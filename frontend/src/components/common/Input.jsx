import React from 'react';

export const Input = ({
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  onKeyPress,
  label = '',
  required = false,
  className = '',
  rows = 3,
  name = '',
  maxLength
}) => {
  const commonProps = {
    value,
    onChange,
    onKeyPress,
    placeholder,
    required,
    name,
    maxLength,
    className: `w-full px-4 py-2 border rounded focus:outline-none focus:border-primary ${className}`
  };

  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      {type === 'textarea' ? (
        <textarea {...commonProps} rows={rows} />
      ) : (
        <input type={type} {...commonProps} />
      )}
    </div>
  );
};

export default Input;