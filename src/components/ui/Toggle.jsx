import { forwardRef, useId } from 'react';
import './Toggle.css';

/**
 * Premium Toggle Switch Component
 * 
 * @component
 * @param {Object} props
 * @param {boolean} [props.checked=false] - Toggle state
 * @param {Function} [props.onChange] - Change handler
 * @param {string} [props.label] - Label text
 * @param {'left' | 'right'} [props.labelPosition='right'] - Label position
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.className] - Additional CSS classes
 */
const Toggle = forwardRef(({
  checked = false,
  onChange,
  label,
  labelPosition = 'right',
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const id = useId();

  const handleChange = (e) => {
    if (!disabled) {
      onChange?.(e.target.checked);
    }
  };

  const classNames = [
    'ui-toggle',
    `ui-toggle--label-${labelPosition}`,
    disabled && 'ui-toggle--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <label className={classNames} htmlFor={id}>
      {label && labelPosition === 'left' && (
        <span className="ui-toggle__label">
          {label}
        </span>
      )}

      <div className="ui-toggle__wrapper">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className="ui-toggle__input"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        
        <div className="ui-toggle__track">
          <div className="ui-toggle__thumb" />
        </div>
      </div>

      {label && labelPosition === 'right' && (
        <span className="ui-toggle__label">
          {label}
        </span>
      )}
    </label>
  );
});

Toggle.displayName = 'Toggle';

export default Toggle;
