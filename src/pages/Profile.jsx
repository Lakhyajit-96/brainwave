import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../lib/api';
import Section from '../components/Section';
import Button from '../components/Button';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
    }
  }, [user, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await userAPI.updateProfile({ name, avatar });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      await userAPI.deleteAccount();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
    }
  };

  return (
    <Section className="pt-[12rem] -mt-[5.25rem]">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Button onClick={() => navigate('/dashboard')}>← Back to Dashboard</Button>
          </div>

          <div className="p-8 bg-n-8 border border-n-6 rounded-2xl">
            <h2 className="h2 mb-8">Profile Settings</h2>

            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-500 text-sm">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-n-1 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-n-7 border border-n-6 rounded-lg text-n-3 cursor-not-allowed"
                />
                <p className="text-n-4 text-xs mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-n-1 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-n-7 border border-n-6 rounded-lg text-n-1 placeholder-n-4 focus:outline-none focus:border-color-1"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-n-1 mb-2">
                  Avatar URL
                </label>
                <input
                  id="avatar"
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-4 py-3 bg-n-7 border border-n-6 rounded-lg text-n-1 placeholder-n-4 focus:outline-none focus:border-color-1"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>

            <div className="pt-8 border-t border-n-6">
              <h3 className="h4 mb-4 text-red-500">Danger Zone</h3>
              <p className="body-2 text-n-3 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500/20 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Profile;
