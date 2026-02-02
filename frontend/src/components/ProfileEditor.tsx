import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@/services/profileService';
import { RiskTolerance } from '@/utils/constants';

type Profile = {
  investmentGoal: string;
  riskTolerance: RiskTolerance;
};

const ProfileEditor: React.FC = () => {
  const [profile, setProfile] = useState<Profile>({
    investmentGoal: '',
    riskTolerance: RiskTolerance.MEDIUM
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err: any) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateProfile(profile);
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      {error && <p className="text-red-600 mb-2" role="alert">{error}</p>}
      {success && <p className="text-green-600 mb-2" role="status">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Investment Goal</label>
          <input
            type="text"
            name="investmentGoal"
            value={profile.investmentGoal}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Risk Tolerance</label>
          <select
            name="riskTolerance"
            value={profile.riskTolerance}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            {Object.values(RiskTolerance).map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-white py-2 px-4 rounded hover:bg-primary/80"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfileEditor;
