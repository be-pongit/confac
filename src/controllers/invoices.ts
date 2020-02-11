import moment from 'moment';
import {Request, Response} from 'express';
import PDFMerge from 'pdf-merge';
import sgMail from '@sendgrid/mail';
import fs from 'fs';
import tmp from 'tmp';
import {ObjectID} from 'mongodb';

import {IInvoice, INVOICE_EXCEL_HEADERS} from '../models/invoices';
import {IAttachment, ISendGridAttachment} from '../models/attachments';
import {createPdf} from './utils';
import {IEmail} from '../models/clients';
import {CollectionNames} from '../models/common';

export const getInvoices = async (req: Request, res: Response) => {
  const invoices = await req.db.collection(CollectionNames.INVOICES).find()
    .toArray();
  return res.send(invoices);
};

export const createInvoice = async (req: Request, res: Response) => {
  const invoice: IInvoice = req.body;

  if (!invoice.isQuotation) {
    const [lastInvoice] = await req.db.collection<IInvoice>(CollectionNames.INVOICES).find({isQuotation: false})
      .sort({number: -1})
      .limit(1)
      .toArray();

    if (lastInvoice) {
      if (invoice.number <= lastInvoice.number) {
        return res.status(400)
          .send({
            msg: 'invoice.badRequest.nrExists',
            data: {
              nr: invoice.number,
              lastNr: lastInvoice.number,
            },
            reload: false,
          });
      }

      if (moment(invoice.date).startOf('day') < moment(lastInvoice.date).startOf('day')) {
        return res.status(400).send({
          msg: 'invoice.badRequest.dateAfterExists',
          data: {
            lastNr: lastInvoice.number,
            date: moment(invoice.date).format('DD/MM/YYYY'),
            lastDate: moment(lastInvoice.date).format('DD/MM/YYYY'),
          },
        });
      }
    }
  }

  const pdfBuffer = await createPdf(invoice);

  if (!Buffer.isBuffer(pdfBuffer) && pdfBuffer.error) {
    return res.status(500).send(pdfBuffer.error);
  }

  const inserted = await req.db.collection<IInvoice>(CollectionNames.INVOICES).insertOne({
    ...invoice,
    createdOn: new Date().toISOString(),
  });

  const [createdInvoice] = inserted.ops;

  if (Buffer.isBuffer(pdfBuffer)) {
    await req.db.collection<Pick<IAttachment, '_id' | 'pdf' >>(CollectionNames.ATTACHMENTS).insertOne({
      _id: new ObjectID(createdInvoice._id),
      pdf: pdfBuffer,
    });
  }

  return res.send(createdInvoice);
};

export const emailInvoice = async (req: Request, res: Response) => {
  const invoiceId = req.params.id;
  const {attachments, combineAttachments, ...email}: IEmail = req.body;

  const attachmentTypes = attachments.map(a => a.type).reduce((acc: { [key: string]: number; }, cur) => {
    acc[cur] = 1;
    return acc;
  }, {});
  const attachmentBuffers: IAttachment | null = await req.db.collection(CollectionNames.ATTACHMENTS).findOne({_id: new ObjectID(invoiceId)}, attachmentTypes);

  let sendGridAttachments: ISendGridAttachment[] = [];

  if (attachmentBuffers) {
    if (combineAttachments) {
      const areAttachmentsMergeable = attachments.every(attachment => attachment.fileType === 'application/pdf');

      if (!areAttachmentsMergeable) {
        return res.status(400).send('Emailing with combineAttachments=true: Can only merge pdfs');
      }

      // Make sure the invoice is the first document in the merged pdf
      // eslint-disable-next-line no-nested-ternary
      const sortedAttachments = attachments.sort((a, b) => (a.type === 'pdf' ? -1 : b.type === 'pdf' ? 1 : 0));

      const files: tmp.FileResult[] = [];
      sortedAttachments.forEach(attachment => {
        const tmpFile = tmp.fileSync();
        fs.writeSync(tmpFile.fd, attachmentBuffers[attachment.type as keyof IAttachment].buffer);
        files.push(tmpFile);
      });

      const buffer: Buffer = await PDFMerge(files.map(f => f.name));

      const invoiceAttachment = sortedAttachments.find(attachment => attachment.type === 'pdf');

      if (invoiceAttachment) {
        sendGridAttachments = [{
          content: buffer.toString('base64'),
          filename: invoiceAttachment.fileName,
          type: invoiceAttachment.fileType as string,
          disposition: 'attachment',
        }];
      }
      files.forEach(file => file.removeCallback());

    } else {
      sendGridAttachments = attachments.map(attachment => ({
        content: attachmentBuffers[attachment.type].toString('base64'),
        filename: attachment.fileName,
        type: attachment.fileType,
        disposition: 'attachment',
      }));
    }
  }

  const mailData = {
    to: email.to.split(';'),
    cc: email.cc?.split(';'),
    bcc: email.bcc?.split(';'),
    from: email.from as string,
    subject: email.subject,
    // text: '', // TODO: Send body stripped from html?
    html: email.body,
    attachments: sendGridAttachments,
  };

  try {
    await sgMail.send(mailData, false).then(() => { console.log('Mail sent successfully'); });
  } catch (error) {
    if (error.code === 401) {
      return res.status(400).send({message: 'Has the SendGrid API Key been set?'});
    }
    return res.status(400).send(error.response.body.errors);

  }

  const lastEmailSent = new Date().toISOString();
  await req.db.collection(CollectionNames.INVOICES).findOneAndUpdate({_id: new ObjectID(invoiceId)}, {$set: {lastEmail: lastEmailSent}});

  return res.status(200).send(lastEmailSent);
};



/** Update an existing invoice */
export const updateInvoice = async (req: Request, res: Response) => {
  const {_id, ...invoice}: IInvoice = req.body;

  const updatedPdfBuffer = await createPdf({
    _id,
    ...invoice,
  });

  if (!Buffer.isBuffer(updatedPdfBuffer) && updatedPdfBuffer.error) {
    return res.status(500).send(updatedPdfBuffer.error);
  }

  if (Buffer.isBuffer(updatedPdfBuffer)) {
    await req.db.collection<Pick<IAttachment, 'pdf'>>(CollectionNames.ATTACHMENTS).findOneAndUpdate({_id: new ObjectID(_id)}, {$set: {pdf: updatedPdfBuffer}});
  }

  const inserted = await req.db.collection<IInvoice>(CollectionNames.INVOICES).findOneAndUpdate({_id: new ObjectID(_id)}, {$set: invoice}, {returnOriginal: false});
  const updatedInvoice = inserted.value;

  if (updatedInvoice && updatedInvoice.projectId) {
    console.log('updating', invoice.projectId, 'verified', updatedInvoice.verified);
    await ProjectsPerMonthCollection.findByIdAndUpdate({_id: invoice.projectId}, {verified: updatedInvoice.verified});
  }

  return res.send(updatedInvoice);
};



/** Hard invoice delete: There is no coming back from this one */
export const deleteInvoice = async (req: Request, res: Response) => {
  const {id}: {id: string;} = req.body;

  await req.db.collection(CollectionNames.INVOICES).findOneAndDelete({_id: new ObjectID(id)});
  await req.db.collection(CollectionNames.ATTACHMENTS).findOneAndDelete({_id: new ObjectID(id)});

  return res.send(id);
};



/** Open the invoice pdf in the browser in a new tab */
export const previewPdfInvoice = async (req: Request, res: Response) => {
  const invoice: IInvoice = req.body;

  const pdfBuffer = await createPdf(invoice);

  if (!Buffer.isBuffer(pdfBuffer) && pdfBuffer.error) {
    return res.status(500).send(pdfBuffer.error);
  }

  return res.type('application/pdf').send(pdfBuffer);
};



/** Create simple CSV output of the invoice._ids passed in the body */
export const generateExcelForInvoices = async (req: Request, res: Response) => {
  const invoiceIds: ObjectID[] = req.body.map((invoiceId: string) => new ObjectID(invoiceId));

  const invoices = await req.db.collection<IInvoice>(CollectionNames.INVOICES).find({_id: {$in: invoiceIds}})
    .toArray();

  const separator = ';';

  const excelHeader = `${INVOICE_EXCEL_HEADERS.join(separator)}\r\n`;

  const excelBody = `${invoices.map(invoice => ([
    invoice.number,
    moment(invoice.date).format('YYYY-MM-DD'),
    invoice.client.name,
    invoice.orderNr,
    invoice.money.totalWithoutTax.toString().replace('.', ','),
    invoice.money.totalTax.toString().replace('.', ','),
    invoice.money.total.toString().replace('.', ','),
    invoice.verified,
    invoice.money.discount!.toString().replace('.', ','),
    `"${invoice.lines[0].desc}"`,
    invoice._id,
  ].join(separator))).join('\r\n')}`;

  const excel = `${excelHeader}${excelBody}`;

  return res.send(excel);
};

