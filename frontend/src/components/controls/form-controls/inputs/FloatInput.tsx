import {BaseInput, BaseInputProps} from './BaseInput';
import {parseIntOrFloat} from './input-util';

type FloatInputProps = BaseInputProps<number> & {}

export const FloatInput = ({value, onChange, ...props}: FloatInputProps) => (
  <BaseInput
    type="number"
    value={value || ''}
    onChange={e => onChange(parseIntOrFloat(e.target.value, true))}
    {...props}
  />
);
