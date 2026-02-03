import React from 'react';
import LinkOAuthModal from '../Modals/LinkOAuthModal';
import PasswordResetModal from '../Modals/PasswordResetModal';

const Settings: React.FC = () => {
  const [showLinkModal, setShowLinkModal] = React.useState(false);
  const [showResetModal, setShowResetModal] = React.useState(false);

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
      <div className="space-y-4">
        <button
          onClick={() => setShowLinkModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Link Google Account
        </button>
        <button
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Change Password
        </button>
      </div>
      {showLinkModal && (
        <LinkOAuthModal onClose={() => setShowLinkModal(false)} />
      )}
      {showResetModal && (
        <PasswordResetModal onClose={() => setShowResetModal(false)} />
      )}
    </div>
  );
};

export default Settings;
