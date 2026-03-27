import { useState, useRef, useEffect, forwardRef, useId } from 'react';
import './Dropdown.css';

/**
 * Premium Dropdown Component
 * 
 * @component
 * @param {Object} props
 * @param {Array<{value: any, label: string, disabled?: boolean}>} props.options - Dropdown options
 * @param {any|any[]} [props.value] - Selected value(s)
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.placeholder='Select...'] - Placeholder text
 * @param {boolean} [props.multiple=false] - Enable multi-select
 * @param {boolean} [props.searchable=false] - Enable search filtering
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.className] - Additional CSS classes
 * @param {number} [props.maxHeight=300] - Maximum dropdown height for virtual scrolling
 */
const Dropdown = forwardRef(({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  multiple = false,
  searchable = false,
  disabled = false,
  className = '',
  maxHeight = 300,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const id = useId();

  const selectedValues = multiple 
    ? (Array.isArray(value) ? value : [])
    : (value !== undefined && value !== null ? [value] : []);

  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setFocusedIndex(0);
    }
  };

  const handleSelect = (option) => {
    if (option.disabled) return;

    if (multiple) {
      const newValue = selectedValues.includes(option.value)
        ? selectedValues.filter(v => v !== option.value)
        : [...selectedValues, option.value];
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
        } else if (!searchable || !searchQuery) {
          e.preventDefault();
          handleSelect(filteredOptions[focusedIndex]);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            Math.min(prev + 1, filteredOptions.length - 1)
          );
        }
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => Math.max(prev - 1, 0));
        }
        break;
    }
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    
    if (multiple) {
      const labels = selectedValues
        .map(v => options.find(opt => opt.value === v)?.label)
        .filter(Boolean);
      return labels.length > 0 ? labels.join(', ') : placeholder;
    } else {
      const selected = options.find(opt => opt.value === selectedValues[0]);
      return selected?.label || placeholder;
    }
  };

  const classNames = [
    'ui-dropdown',
    isOpen && 'ui-dropdown--open',
    disabled && 'ui-dropdown--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={dropdownRef}
      className={classNames}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <button
        ref={ref}
        type="button"
        id={id}
        className="ui-dropdown__trigger"
        onClick={handleToggle}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="ui-dropdown__value">
          {getDisplayText()}
        </span>
        <svg 
          className="ui-dropdown__arrow" 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="ui-dropdown__menu"
          style={{ maxHeight }}
          role="listbox"
          aria-labelledby={id}
        >
          {searchable && (
            <div className="ui-dropdown__search">
              <input
                ref={searchInputRef}
                type="text"
                className="ui-dropdown__search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFocusedIndex(0);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="ui-dropdown__options">
            {filteredOptions.length === 0 ? (
              <div className="ui-dropdown__empty">No options found</div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = selectedValues.includes(option.value);
                const isFocused = index === focusedIndex;

                return (
                  <div
                    key={option.value}
                    className={`ui-dropdown__option ${isSelected ? 'ui-dropdown__option--selected' : ''} ${isFocused ? 'ui-dropdown__option--focused' : ''} ${option.disabled ? 'ui-dropdown__option--disabled' : ''}`}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {multiple && (
                      <div className="ui-dropdown__checkbox">
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    )}
                    <span className="ui-dropdown__option-label">
                      {option.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

export default Dropdown;
