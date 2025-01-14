import {connect} from 'react-redux';
import {IconProps, Icon} from '../Icon';
import {ConfacState} from '../../../reducers/app-state';
import {EnhanceWithBusySpinner} from '../../enhancers/EnhanceWithBusySpinner';

export const VerifyIcon = ({...props}: IconProps) => (
  <Icon className="tst-verify" fa="fa fa-check" color="green" {...props} />
);

export const BusyVerifyIcon = connect((state: ConfacState) => ({isBusy: state.app.isBusy}))(EnhanceWithBusySpinner(VerifyIcon));
