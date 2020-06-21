import React from 'react';
import {Link} from 'react-router-dom';
import {t} from '../../../utils';
import {Icon} from '../../Icon';
import {ButtonSize} from '../Button';
import {BootstrapVariant} from '../../../../models';
import {EnhanceWithClaim, EnhanceWithClaimProps} from '../../../enhancers/EnhanceWithClaim';


type LinkToButtonProps = EnhanceWithClaimProps & {
  to: string;
  label: string;
  size?: ButtonSize;
  variant?: BootstrapVariant;
}


export const LinkToButton = EnhanceWithClaim(({to, label, size, variant}: LinkToButtonProps) => (
  <Link to={to} className={`btn btn-${variant || 'light'} btn-${size || 'md'}`}>
    {t(label)}
    <Icon fa="fa fa-arrow-right" size={1} style={{marginLeft: 8}} />
  </Link>
));
