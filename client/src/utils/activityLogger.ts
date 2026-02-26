import api from '../api/axios';

export const logActivity = async (action: string, module: string, description: string) => {
  try {
    await api.post('/activity', {
      action,
      module,
      description
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
