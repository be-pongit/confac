import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {t} from '../../util.js';
import {SimpleSelect} from '../../controls/Select.js';
import {invoiceDateStrategies} from '../invoice-date-strategy.js';


export class InvoiceDateStrategySelect extends Component {
  static propTypes = {
    value: PropTypes.oneOf(invoiceDateStrategies).isRequired,
    onChange: PropTypes.func.isRequired,
  }
  static defaultProps = {value: 'prev-month-last-day'}

  render() {
    const {value, ...props} = this.props;
    return (
      <SimpleSelect
        label={t('config.defaultInvoiceDateStrategy')}
        transFn={key => t('invoice.dateStrategies.' + key)}
        value={value}
        options={invoiceDateStrategies}
        isClearable={false}
        {...props}
      />
    );
  }
}
