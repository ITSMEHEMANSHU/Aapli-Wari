import React from 'react';

export const Select = ({
  value,
  onChange,
  options = [],
  label = '',
  placeholder = 'Select...',
  className = '',
  required = false
}) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-2 border rounded focus:outline-none focus:border-primary ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;