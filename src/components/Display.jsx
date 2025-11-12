import React from 'react';

function Display({ expression, result }) {
  return (
    <div className="display" aria-live="polite">
      <div className="expression">{expression || '0'}</div>
      <div className="result">{result}</div>
    </div>
  );
}

export default Display;
