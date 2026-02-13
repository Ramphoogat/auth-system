import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import api from '../api/axios';

type ProfileForm = {
  name: string;
  username: string;
  email: string;

  currentPassword: string;
  newPassword: string;
};

type UserResponse = {
  name?: string;
  username: string;
  email: string;

};



const Profile: React.FC = () => {
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    username: '',
    email: '',

    currentPassword: '',
    newPassword: '',
  });
  const [initialForm, setInitialForm] = useState<ProfileForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const token = useMemo(
    () => localStorage.getItem('token') || sessionStorage.getItem('token'),
    [],
  );

  const authHeaders = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token],
  );

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        alert('Please login again');
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await api.get<{ user: UserResponse }>('/auth/profile', authHeaders);


        const mapped: ProfileForm = {
          name: data.user.name || '',
          username: data.user.username || '',
          email: data.user.email || '',

          currentPassword: '',
          newPassword: '',
        };

        setForm(mapped);
        setInitialForm(mapped);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          alert(error.response?.data?.message || 'Failed to load profile');
        } else {
          alert('Failed to load profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [authHeaders, token]);

  const onChange = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Please login again');
      return;
    }

    if (form.newPassword && !form.currentPassword) {
      alert('Please enter current password');
      return;
    }

    setIsSaving(true);
    try {
      await api.put(
        '/auth/profile',
        {
          name: form.name.trim(),
          username: form.username.trim(),
          email: form.email.trim(),

          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword || undefined,
        },
        authHeaders,
      );

      const refreshed: ProfileForm = {
        ...form,
        currentPassword: '',
        newPassword: '',
      };
      setForm(refreshed);
      setInitialForm(refreshed);
      alert('Profile updated successfully');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Failed to update profile');
      } else {
        alert('Failed to update profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = useMemo(() => {
    if (!initialForm) {
      return false;
    }
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-white/90 p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Profile</h2>
        <p className="text-sm text-gray-500 mb-6">
          Update your account details and password.
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1" htmlFor="name">Name</label>
              <input
                id="name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40"
                value={form.name}
                onChange={(e) => onChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1" htmlFor="username">Username</label>
              <input
                id="username"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40"
                value={form.username}
                onChange={(e) => onChange('username', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40"
              value={form.email}
              onChange={(e) => onChange('email', e.target.value)}
              required
            />
          </div>



          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="password"
                placeholder="Current password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40"
                value={form.currentPassword}
                onChange={(e) => onChange('currentPassword', e.target.value)}
              />
              <input
                type="password"
                placeholder="New password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40"
                value={form.newPassword}
                onChange={(e) => onChange('newPassword', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg disabled:opacity-50"
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
