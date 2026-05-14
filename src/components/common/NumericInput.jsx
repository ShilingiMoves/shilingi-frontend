import React from 'react';

/**
 * A specialized input component that displays numbers with thousand separators (commas).
 * It communicates with the parent using raw numeric strings to maintain compatibility
 * with existing form logic.
 */
const NumericInput = ({ value, onChange, name, placeholder, className, ...props }) => {
  // Format the value for display (e.g., 1000 -> 1,000)
  const formatValue = (val) => {
    if (val === null || val === undefined || val === '') return '';
    
    // Convert to string and remove any existing commas
    const stringValue = val.toString().replace(/,/g, '');
    
    // Split into integer and decimal parts
    const parts = stringValue.split('.');
    
    // Add commas to the integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return parts.join('.');
  };

  const handleChange = (e) => {
    const { value: inputValue } = e.target;
    
    // Remove everything except numbers and decimal point
    const rawValue = inputValue.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = rawValue.split('.');
    const sanitizedValue = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');

    // Call the original onChange with the sanitized numeric value
    if (onChange) {
      const event = {
        ...e,
        target: {
          ...e.target,
          name: name,
          value: sanitizedValue,
        },
      };
      onChange(event);
    }
  };

  return (
    <input
      {...props}
      type="text"
      name={name}
      value={formatValue(value)}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      inputMode="decimal"
    />
  );
};

export default NumericInput;
