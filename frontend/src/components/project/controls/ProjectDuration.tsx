import React from 'react';
import moment from 'moment';
import {IProjectModel} from '../models/IProjectModel';
import {Icon} from '../../controls/Icon';
import {formatDate, t} from '../../utils';


export const ProjectDuration = ({project}: {project: IProjectModel}) => (
  <div className="project-duration">
    <Icon fa="fa fa-clock" className="tst-icon-date" />
    <span>{formatDate(project.startDate)}</span>
    {project.endDate ? (
      <>
        <Icon fa="fa fa-arrow-right" className="tst-icon-pick" />
        <span>{formatDate(project.endDate)}</span>
        {project.endDate.isAfter(moment()) && (
          <small>
            (
            {t('projectMonth.timesheetExpiration', {daysLeft: moment.duration(moment(project.endDate).diff(moment())).humanize(true)})}
            )
          </small>
        )}
      </>
    ) : (
      <>
        <Icon fa="fa fa-arrow-right" className="tst-icon-pick" />
        <Icon fa="fa fa-infinity" className="tst-icon-infinity" />
      </>
    )}
  </div>
);




export const ProjectDurationSmall = ({project}: {project: IProjectModel}) => (
  <div className="project-duration">
    <div>
      <Icon className="tst-icon-date" fa="fa fa-clock" size={1} />
      <span>{project.startDate.format('MMM YYYY')}</span>
      {project.endDate ? (
        <>
          <Icon fa="fa fa-arrow-right" size={1} className="tst-icon-pick" />
          <span>{project.endDate.format('MMM YYYY')}</span>
        </>
      ) : (
        <>
          <Icon fa="fa fa-arrow-right" size={1} className="tst-icon-pick"/>
          <Icon fa="fa fa-infinity" size={1} className="tst-icon-infinity" />
        </>
      )}
    </div>
  </div>
);
