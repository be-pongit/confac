import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {ConfacState} from '../../reducers/app-state';
import {saveProject, updateAppFilters} from '../../actions';
import {ListPage} from '../controls/table/ListPage';
import {projectFeature, ProjectFeatureBuilderConfig} from './models/getProjectFeature';
import {LinkToButton} from '../controls/form-controls/button/LinkToButton';
import {useDocumentTitle} from '../hooks/useDocumentTitle';
import {Claim} from '../users/models/UserModel';
import {useProjects} from '../hooks/useProjects';


import './ProjectsList.scss';


export const ProjectsList = () => {
  useDocumentTitle('projectList');

  const history = useHistory();
  const dispatch = useDispatch();
  const projects = useProjects();
  const projectFilters = useSelector((state: ConfacState) => state.app.filters.projects);

  const config: ProjectFeatureBuilderConfig = {
    data: projects,
    save: m => dispatch(saveProject(m.details, history)),
    filters: projectFilters,
    setFilters: f => dispatch(updateAppFilters('projects', f)),
  };

  const TopToolbar = (
    <LinkToButton claim={Claim.ViewConsultants} to="/consultants" label="consultant.title" />
  );


  const feature = projectFeature(config);
  return <ListPage feature={feature} topToolbar={TopToolbar} />;
};
