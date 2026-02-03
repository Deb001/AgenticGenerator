import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';

interface ProfileData {
  full_name?: string;
  investment_goals?: string;
  risk_tolerance?: string;
}

const MAX_NAME_LENGTH = 255;
const MAX_GOALS_LENGTH = 500;

const ProfilePage: React.FC = () => {
  const { user, fetchProfile, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProfile();
        setProfile(data);
      } catch {
        addToast('Failed to load profile.', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.full_name && profile.full_name.length > MAX_NAME_LENGTH) {
      addToast('Full name is too long.', 'error');
      return;
    }
    if (profile.investment_goals && profile.investment_goals.length > MAX_GOALS_LENGTH) {
      addToast('Investment goals are too long.', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(profile);
      addToast('Profile updated', 'success');
    } catch {
      addToast('Update failed. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1" htmlFor="full_name">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            maxLength={MAX_NAME_LENGTH}
            className="w-full border rounded px-3 py-2"
            value={profile.full_name || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="investment_goals">
            Investment Goals
          </label>
          <textarea
            id="investment_goals"
            name="investment_goals"
            maxLength={MAX_GOALS_LENGTH}
            className="w-full border rounded px-3 py-2"
            rows={3}
            value={profile.investment_goals || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="risk_tolerance">
            Risk Tolerance
          </label>
          <select
            id="risk_tolerance"
            name="risk_tolerance"
            className="w-full border rounded px-3 py-2"
            value={profile.risk_tolerance || ''}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
