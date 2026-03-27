import { forwardRef } from 'react';
import './Card.css';

/**
 * Premium Card Component with Glassmorphism
 * 
 * @component
 * @param {Object} props
 * @param {'default' | 'elevated' | 'bordered'} [props.variant='default'] - Card style variant
 * @param {React.ReactNode} [props.header] - Optional header content
 * @param {React.ReactNode} [props.footer] - Optional footer content
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {Function} [props.onClick] - Click handler (makes card interactive)
 * @param {boolean} [props.hoverable=false] - Enable hover effects
 */
const Card = forwardRef(({
  variant = 'default',
  header,
  footer,
  children,
  className = '',
  onClick,
  hoverable = false,
  ...props
}, ref) => {
  const classNames = [
    'ui-card',
    `ui-card--${variant}`,
    (onClick || hoverable) && 'ui-card--interactive',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      className={classNames}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      } : undefined}
      {...props}
    >
      {header && (
        <div className="ui-card__header">
          {header}
        </div>
      )}

      <div className="ui-card__body">
        {children}
      </div>

      {footer && (
        <div className="ui-card__footer">
          {footer}
        </div>
      )}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
