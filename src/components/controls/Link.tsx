import React from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {EnhanceWithClaim} from '../enhancers/EnhanceWithClaim';
import {t} from '../utils';


type LinkProps = {
  to: string;
  label: string;
}


export const LinkComponent = ({to, label}: LinkProps) => (
  <RouterLink to={to}>
    {t(label)}
  </RouterLink>
);

export const Link = EnhanceWithClaim(LinkComponent);
