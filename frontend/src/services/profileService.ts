import api from '@/services/api';
import { Profile } from '@/utils/constants';

export const getProfile = async (): Promise<Profile> => {
  const response = await api.get('/api/profile/me');
  return response.data;
};

export const updateProfile = async (profile: Profile): Promise<void> => {
  await api.put('/api/profile/me', profile);
};
