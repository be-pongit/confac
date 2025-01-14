import {Col, Row} from 'react-bootstrap';
import {StringInput} from './StringInput';
import {BaseInputProps} from './BaseInput';
import {SelectItem} from '../../../../models';


type ExtraFieldsInputProps = BaseInputProps<SelectItem[]>;


export const ExtraFieldsInput = ({value, onChange, ...props}: ExtraFieldsInputProps) => {
  const updater = (updateLabel: string, newText: string): void => {
    onChange((value || []).map(col => {
      if (col.label === updateLabel) {
        return {
          label: col.label,
          value: newText,
        };
      }
      return col;
    }));
  };

  return (
    <Row>
      {(value || []).map(col => (
        <Col sm={4} key={col.label}>
          <StringInput
            label={col.label as string}
            value={col.value as string}
            onChange={(newText: string) => updater(col.label as string, newText)}
          />
        </Col>
      ))}
    </Row>
  );
};
