import React from 'react';
import { GOOGLE_OAUTH_URL } from '@/utils/constants';

const GoogleOAuthButton: React.FC = () => {
  const handleClick = () => {
    // Redirect the browser to the backend Google OAuth endpoint
    window.location.href = GOOGLE_OAUTH_URL;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center justify-center border border-gray-300 rounded py-2 hover:bg-gray-100"
    >
      <svg
        className="w-5 h-5 mr-2"
        viewBox="0 0 533.5 544.3"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M533.5 278.4c0-17.7-1.6-35-4.6-51.7H272v97.9h146.9c-6.4 34.5-25.5 63.7-54.5 83.2v68.9h88.2c51.6-47.5 81.9-117.5 81.9-198.3z"
          fill="#4285F4"
        />
        <path
          d="M272 544.3c73.5 0 135.1-24.4 180.1-66.2l-88.2-68.9c-24.5 16.5-55.9 26.2-91.9 26.2-70.6 0-130.5-47.6-152-111.5h-90.5v70.1c45.2 89.5 138.2 150.3 242.5 150.3z"
          fill="#34A853"
        />
        <path
          d="M120 322.9c-10.5-31.4-10.5-65.2 0-96.6V156h-90.5c-39.5 77.2-39.5 168.4 0 245.6L120 322.9z"
          fill="#FBBC05"
        />
        <path
          d="M272 107.7c39.9-.6 78.5 15.1 107.1 43.5l80.2-80.2C420.6 22.1 347.5-2.5 272 0 167.7 0 74.7 60.8 29.5 150.3l90.5 70.1c21.5-63.9 81.4-111.5 152-111.5z"
          fill="#EA4335"
        />
      </svg>
      Sign in with Google
    </button>
  );
};

export default GoogleOAuthButton;
