import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import '../styles/customSelect.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

interface CustomSelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options?: SelectOption[];
  optionGroups?: SelectOptionGroup[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  width?: string | number;
}

export default function CustomSelect({
  id,
  name,
  value,
  onChange,
  options = [],
  optionGroups = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = '',
  width
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Flatten all options for keyboard navigation
  const allOptions: SelectOption[] = [];
  // Add flat options first
  if (options.length > 0) {
    allOptions.push(...options);
  }
  // Then add options from groups
  optionGroups.forEach(group => {
    allOptions.push(...group.options);
  });

  const selectedOption = allOptions.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        selectRef.current && 
        !selectRef.current.contains(target) &&
        !listRef.current?.contains(target)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev < allOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => prev > 0 ? prev - 1 : 0);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < allOptions.length) {
            onChange(allOptions[focusedIndex].value);
            setIsOpen(false);
            setFocusedIndex(-1);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(allOptions.length - 1);
          break;
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, focusedIndex, allOptions, onChange]);

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.querySelector(
        `[data-option-index="${focusedIndex}"]`
      ) as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: '0px' });

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      const dropdownWidth = width 
        ? (typeof width === 'number' ? `${width}px` : width)
        : `${rect.width}px`;
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: dropdownWidth
      });
    }
  }, [isOpen, width]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        const currentIndex = allOptions.findIndex(opt => opt.value === value);
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
    }
  };

  const dropdownContent = isOpen ? (
    <div 
      className="custom-select-dropdown"
      style={{
        position: 'absolute',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: dropdownPosition.width
      }}
    >
      <ul 
        ref={listRef}
        className="custom-select-list"
        role="listbox"
      >
        {/* Render flat options first if provided */}
        {options.map((option, index) => (
          <li
            key={option.value}
            data-option-index={index}
            className={`custom-select-option ${
              value === option.value ? 'selected' : ''
            } ${focusedIndex === index ? 'focused' : ''}`}
            onClick={() => handleSelect(option.value)}
            onMouseEnter={() => setFocusedIndex(index)}
            role="option"
            aria-selected={value === option.value}
          >
            {option.label}
          </li>
        ))}
        {/* Render option groups */}
        {optionGroups.map((group, groupIndex) => {
          const optionsOffset = options.length;
          return (
            <li key={group.label} className="custom-select-group">
              <div className="custom-select-group-label">{group.label}</div>
              <ul className="custom-select-group-options">
                {group.options.map((option, optionIndex) => {
                  const flatIndex = optionsOffset + optionGroups
                    .slice(0, groupIndex)
                    .reduce((sum, g) => sum + g.options.length, 0) + optionIndex;
                  return (
                    <li
                      key={option.value}
                      data-option-index={flatIndex}
                      className={`custom-select-option ${
                        value === option.value ? 'selected' : ''
                      } ${focusedIndex === flatIndex ? 'focused' : ''}`}
                      onClick={() => handleSelect(option.value)}
                      onMouseEnter={() => setFocusedIndex(flatIndex)}
                      role="option"
                      aria-selected={value === option.value}
                    >
                      {option.label}
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  ) : null;

  const widthStyle = width 
    ? { width: typeof width === 'number' ? `${width}px` : width }
    : {};

  return (
    <>
      <div 
        ref={selectRef}
        className={`custom-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${className}`}
        style={widthStyle}
      >
        <input
          type="hidden"
          id={id}
          name={name}
          value={value}
          required={required}
        />
        <button
          type="button"
          className="custom-select-trigger"
          onClick={handleToggle}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={displayValue}
        >
          <span className={!selectedOption ? 'placeholder' : ''}>
            {displayValue}
          </span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </>
  );
}

