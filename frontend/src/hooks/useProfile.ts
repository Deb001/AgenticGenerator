import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@/services/profileService';

type Profile = {
  investmentGoal: string;
  riskTolerance: string;
};

const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const save = async (updated: Profile) => {
    setLoading(true);
    try {
      await updateProfile(updated);
      setProfile(updated);
    } catch (err: any) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, save };
};

export default useProfile;
