import React from 'react';

interface Props {
  onClose: () => void;
}

const generateState = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
};

const LinkOAuthModal: React.FC<Props> = ({ onClose }) => {
  const handleLink = () => {
    const backend = import.meta.env.VITE_BACKEND_URL || '';
    const state = generateState();
    sessionStorage.setItem('oauth_state', state);
    window.location.href = `${backend}/api/auth/google/link?state=${state}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Link Google Account</h3>
        <p className="mb-4">
          Linking your Google account allows you to sign in with Google in addition to your email/password.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleLink}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Link Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkOAuthModal;
