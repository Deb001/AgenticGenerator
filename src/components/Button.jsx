import React from 'react';

function Button({ label, onClick }) {
  const handleClick = typeof onClick === 'function' ? onClick : () => {};
  return (
    <button
      type="button"
      className="calc-button"
      onClick={handleClick}
      aria-label={label}
    >
      {label}
    </button>
  );
}

export default Button;
