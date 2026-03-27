import { forwardRef, useState, useId } from 'react';
import './Input.css';

/**
 * Premium Input Component with Floating Label
 * 
 * @component
 * @param {Object} props
 * @param {string} [props.label] - Floating label text
 * @param {string} [props.error] - Error message to display
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.type='text'] - Input type
 * @param {React.ReactNode} [props.icon] - Icon to display on left
 * @param {boolean} [props.clearable=false] - Show clear button
 * @param {number} [props.maxLength] - Maximum character length
 * @param {boolean} [props.showCounter=false] - Show character counter
 * @param {string} [props.className] - Additional CSS classes
 * @param {Function} [props.onChange] - Change handler
 * @param {string} [props.value] - Controlled value
 */
const Input = forwardRef(({
  label,
  error,
  placeholder,
  type = 'text',
  icon,
  clearable = false,
  maxLength,
  showCounter = false,
  className = '',
  onChange,
  value,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [shaking, setShaking] = useState(false);
  const id = useId();

  const hasValue = value !== undefined ? value.length > 0 : undefined;
  const showLabel = label && (focused || hasValue);

  const handleClear = () => {
    onChange?.({ target: { value: '' } });
  };

  const handleChange = (e) => {
    onChange?.(e);
  };

  // Trigger shake animation on error change
  const triggerShake = () => {
    if (error) {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
    }
  };

  const classNames = [
    'ui-input',
    focused && 'ui-input--focused',
    error && 'ui-input--error',
    shaking && 'ui-input--shake',
    icon && 'ui-input--with-icon',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <div className="ui-input__wrapper">
        {icon && (
          <span className="ui-input__icon">
            {icon}
          </span>
        )}

        <input
          ref={ref}
          id={id}
          type={type}
          className="ui-input__field"
          placeholder={!label ? placeholder : undefined}
          value={value}
          maxLength={maxLength}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {label && (
          <label
            htmlFor={id}
            className={`ui-input__label ${showLabel ? 'ui-input__label--float' : ''}`}
          >
            {label}
          </label>
        )}

        {clearable && value && value.length > 0 && (
          <button
            type="button"
            className="ui-input__clear"
            onClick={handleClear}
            tabIndex={-1}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="ui-input__footer">
        {error && (
          <span className="ui-input__error-text">
            {error}
          </span>
        )}

        {showCounter && maxLength && (
          <span className="ui-input__counter">
            {value?.length || 0} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
