import React from 'react';
import { Chip } from '@mui/material';
import { Signal } from '../types/portfolio';

interface SignalBadgeProps {
  signal: Signal;
}

/**
 * Renders a colored badge (Material‑UI Chip) based on the advisory signal.
 * - Buy  → green
 * - Hold → orange
 * - Sell → red
 * - any other value → grey with label "Unknown"
 */
export const SignalBadge: React.FC<SignalBadgeProps> = ({ signal }) => {
  const { label, bgColor } = (() => {
    switch (signal.type) {
      case 'Buy':
        return { label: 'Buy', bgColor: '#4caf50' }; // green
      case 'Hold':
        return { label: 'Hold', bgColor: '#ff9800' }; // orange
      case 'Sell':
        return { label: 'Sell', bgColor: '#f44336' }; // red
      default:
        return { label: 'Unknown', bgColor: '#9e9e9e' }; // grey
    }
  })();

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        backgroundColor: bgColor,
        color: '#fff',
        fontWeight: 500,
        '& .MuiChip-label': {
          paddingLeft: '6px',
          paddingRight: '6px',
        },
      }}
    />
  );
};

export default SignalBadge;