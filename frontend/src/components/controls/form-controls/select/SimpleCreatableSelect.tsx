import Creatable from 'react-select/creatable';
import {SelectItem} from '../../../../models';
import {t} from '../../../utils';


export type SimpleCreatableSelectProps = {
  options: string[];
  value: string;
  onChange: Function;
  isClearable?: boolean;
};


export const SimpleCreatableSelect = ({options, value, onChange, isClearable = false, ...props}: SimpleCreatableSelectProps) => {
  const opts = options.map((itm: string) => ({
    label: itm,
    value: itm,
  }));

  return (
    <Creatable
      value={{label: value, value}}
      options={opts}
      onChange={itm => onChange(itm && (itm as SelectItem).value)}
      isClearable={isClearable}
      isMulti={false}
      noOptionsMessage={() => t('controls.noResultsText')}
      formatCreateLabel={itm => t('controls.addLabelText', {value: itm})}
      placeholder={t('controls.selectPlaceholder')}
      classNamePrefix="react-select"
      className="react-select-simple"
    />
  );
};
