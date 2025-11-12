import React, { useState } from 'react';
import Display from './Display.jsx';
import Button from './Button.jsx';
import evaluateExpression from '../evaluator.js';

function Calculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');

  const handleClick = (value) => {
    if (value === '=') {
      try {
        const evalResult = evaluateExpression(expression);
        setResult(String(evalResult));
      } catch (e) {
        setResult(e.message);
      }
    } else if (value === 'C') {
      setExpression('');
      setResult('');
    } else {
      setExpression((prev) => prev + value);
    }
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+',
    'C'
  ];

  return (
    <section aria-label="Calculator">
      <Display expression={expression} result={result} />
      <div
        role="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginTop: '12px'
        }}
      >
        {buttons.map((val, idx) => (
          <Button key={idx} label={val} onClick={() => handleClick(val)} />
        ))}
      </div>
    </section>
  );
}

export default Calculator;
