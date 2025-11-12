import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Calculator from '../components/Calculator.jsx';

test('renders all buttons', () => {
  render(<Calculator />);
  const btn = screen.getByRole('button', { name: '7' });
  expect(btn).toBeInTheDocument();
});

test('calculates expression on =', async () => {
  render(<Calculator />);
  fireEvent.click(screen.getByRole('button', { name: '2' }));
  fireEvent.click(screen.getByRole('button', { name: '+' }));
  fireEvent.click(screen.getByRole('button', { name: '3' }));
  fireEvent.click(screen.getByRole('button', { name: '=' }));
  const result = await screen.findByText('5');
  expect(result).toBeInTheDocument();
});

test('displays error message on invalid input', async () => {
  render(<Calculator />);
  fireEvent.click(screen.getByRole('button', { name: '2' }));
  fireEvent.click(screen.getByRole('button', { name: '/' }));
  fireEvent.click(screen.getByRole('button', { name: '0' }));
  fireEvent.click(screen.getByRole('button', { name: '=' }));
  const error = await screen.findByText(/division by zero/i);
  expect(error).toBeInTheDocument();
});
