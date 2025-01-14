import {useSelector, useDispatch} from 'react-redux';
import {ConfacState} from '../../reducers/app-state';
import {ListPage} from '../controls/table/ListPage';
import {consultantFeature, ConsultantFeatureBuilderConfig} from './models/getConsultantFeature';
import {saveConsultant} from '../../actions/consultantActions';
import {updateAppFilters} from '../../actions';
import {useDocumentTitle} from '../hooks/useDocumentTitle';
import {Features} from '../controls/feature/feature-models';


export const ConsultantsList = () => {
  useDocumentTitle('consultantList');

  const dispatch = useDispatch();
  const models = useSelector((state: ConfacState) => ({filters: state.app.filters.consultants, data: state.consultants}));

  const config: ConsultantFeatureBuilderConfig = {
    data: models.data,
    save: m => dispatch(saveConsultant(m) as any),
    filters: models.filters,
    setFilters: f => dispatch(updateAppFilters(Features.consultants, f)),
  };

  const feature = consultantFeature(config);

  return (
    <ListPage feature={feature} />
  );
};
