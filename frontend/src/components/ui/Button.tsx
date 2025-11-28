import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

const Button: React.FC<Props> = ({ children, loading = false, className = '', ...rest }) => {
  return (
    <button
      className={`px-4 py-2 bg-accent text-white rounded shadow hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent transition ${className}`}
      disabled={loading}
      {...rest}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
