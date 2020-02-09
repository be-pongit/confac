import React from 'react';
import {useDispatch} from 'react-redux';
import cn from 'classnames';
import useViewportSizes from 'use-viewport-sizes'
import {FullProjectMonthModel, ProjectMonthTimesheet} from '../models/ProjectMonthModel';
import {FloatInput} from '../../controls/form-controls/inputs/FloatInput';
import {t} from '../../utils';
import {ValidityToggleButton} from '../../controls/form-controls/button/ValidityToggleButton';
import {NotesModalButton} from '../../controls/form-controls/button/NotesModalButton';
import {UploadFileButton} from '../../controls/form-controls/button/UploadFileButton';
import {projectMonthUpload, patchProjectsMonth} from '../../../actions/projectActions';
import {getNewProjectMonthTimesheet} from '../models/getNewProject';
import {useDebouncedSave} from '../../hooks/useDebounce';

interface ProjectMonthTimesheetCellProps {
  projectMonth: FullProjectMonthModel;
}


/** Display timesheet number in days */
const TimesheetDaysDisplay = ({days}: {days: number | undefined}) => {
  const [vpWidth] = useViewportSizes();

  if (typeof days !== 'number') {
    return <span>&nbsp;</span>;
  }

  // TODO: hourly rate not implemented

  if (vpWidth > 1600) {
    return <span>{t('client.daysWorked', {days})}</span>;
  }

  return <span>{days}</span>;
};


/** Timesheet form cell for a ProjectMonth row */
export const ProjectMonthTimesheetCell = ({projectMonth}: ProjectMonthTimesheetCellProps) => {
  const dispatch = useDispatch();

  const defaultValue = projectMonth.details.timesheet || getNewProjectMonthTimesheet();
  const dispatcher = (val: ProjectMonthTimesheet) => {
    dispatch(patchProjectsMonth({...projectMonth.details, timesheet: val}));
  };
  const [timesheet, setTimesheet, saveTimesheet] = useDebouncedSave<ProjectMonthTimesheet>(defaultValue, dispatcher);


  const projectConfig = projectMonth.project.projectMonthConfig;


  const canToggleValid = !(
    timesheet.timesheet
    && (timesheet.timesheet === timesheet.check || timesheet.note || !projectConfig.timesheetCheck)
  );


  return (
    <div className={cn('timesheet-cell')}>
      <>
        <FloatInput
          value={timesheet.timesheet}
          onChange={val => setTimesheet({...timesheet, timesheet: val})}
          placeholder={t('projectMonth.timesheet')}
          display={timesheet.validated && (() => <TimesheetDaysDisplay days={timesheet.timesheet} />)}
        />

        {projectConfig.timesheetCheck ? (
          <FloatInput
            value={timesheet.check}
            onChange={val => setTimesheet({...timesheet, check: val})}
            placeholder={t('projectMonth.timesheetCheck')}
            display={timesheet.validated && (() => <TimesheetDaysDisplay days={timesheet.check} />)}
          />
        ) : <div />}
      </>


      <div className="timesheet-actions">
        <ValidityToggleButton
          value={timesheet.validated}
          onChange={val => saveTimesheet({...timesheet, validated: val})}
          disabled={canToggleValid}
        />
        <NotesModalButton
          value={timesheet.note}
          onChange={val => saveTimesheet({...timesheet, note: val})}
          title={t('projectMonth.timesheetNote', {name: `${projectMonth.consultant.firstName} ${projectMonth.consultant.name}`})}
        />
        <UploadFileButton
          onUpload={f => dispatch(projectMonthUpload(f, 'timesheet'))}
          icon="fa fa-clock"
          title={t('projectMonth.timesheetUpload')}
        />
      </div>
    </div>
  );
};
