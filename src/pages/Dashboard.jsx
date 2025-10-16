import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI, aiAPI, subscriptionAPI } from '../lib/api';
import Section from '../components/Section';
import Button from '../components/Button';

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [aiHistory, setAiHistory] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profileRes, subscriptionRes, historyRes] = await Promise.all([
        userAPI.getProfile(),
        subscriptionAPI.getCurrent(),
        aiAPI.getHistory({ limit: 5 })
      ]);
      setProfile(profileRes.data.user);
      setSubscription(subscriptionRes.data.subscription);
      setAiHistory(historyRes.data.chats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIChat = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setAiLoading(true);
    setAiResponse('');

    try {
      const response = await aiAPI.chat({ prompt });
      setAiResponse(response.data.response);
      setPrompt('');
      fetchDashboardData(); // Refresh history
    } catch (error) {
      setAiResponse(error.response?.data?.error || 'Failed to get AI response');
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <Section className="pt-[12rem] -mt-[5.25rem]">
        <div className="container">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-color-1"></div>
            <p className="mt-4 text-n-3">Loading dashboard...</p>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section className="pt-[12rem] -mt-[5.25rem]">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="h2 mb-2">Welcome back, {profile?.name}!</h1>
              <p className="body-2 text-n-3">
                Subscription: <span className="text-color-1 font-semibold">{subscription?.plan || 'FREE'}</span>
              </p>
            </div>
            <Button onClick={handleLogout}>Logout</Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-n-8 border border-n-6 rounded-2xl">
              <h3 className="text-n-3 text-sm mb-2">AI Chats</h3>
              <p className="h3">{profile?.stats?.aiChats || 0}</p>
            </div>
            <div className="p-6 bg-n-8 border border-n-6 rounded-2xl">
              <h3 className="text-n-3 text-sm mb-2">Contacts Submitted</h3>
              <p className="h3">{profile?.stats?.contacts || 0}</p>
            </div>
            <div className="p-6 bg-n-8 border border-n-6 rounded-2xl">
              <h3 className="text-n-3 text-sm mb-2">Member Since</h3>
              <p className="h3 text-sm">{new Date(profile?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* AI Chat Interface */}
          <div className="mb-8 p-8 bg-n-8 border border-n-6 rounded-2xl">
            <h2 className="h3 mb-6">AI Assistant</h2>
            
            <form onSubmit={handleAIChat} className="mb-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-3 bg-n-7 border border-n-6 rounded-lg text-n-1 placeholder-n-4 focus:outline-none focus:border-color-1"
                  disabled={aiLoading}
                />
                <Button type="submit" disabled={aiLoading || !prompt.trim()}>
                  {aiLoading ? 'Thinking...' : 'Send'}
                </Button>
              </div>
            </form>

            {aiResponse && (
              <div className="p-4 bg-n-7 border border-n-6 rounded-lg mb-6">
                <p className="text-n-1 whitespace-pre-wrap">{aiResponse}</p>
              </div>
            )}

            {/* Recent AI Chats */}
            {aiHistory.length > 0 && (
              <div>
                <h3 className="text-n-3 text-sm mb-4">Recent Conversations</h3>
                <div className="space-y-4">
                  {aiHistory.map((chat) => (
                    <div key={chat.id} className="p-4 bg-n-7 border border-n-6 rounded-lg">
                      <p className="text-n-3 text-sm mb-2">
                        <strong>You:</strong> {chat.prompt}
                      </p>
                      <p className="text-n-1 text-sm">
                        <strong>AI:</strong> {chat.response.substring(0, 150)}...
                      </p>
                      <p className="text-n-4 text-xs mt-2">
                        {new Date(chat.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-n-8 border border-n-6 rounded-2xl">
              <h3 className="h4 mb-4">Subscription Management</h3>
              <p className="body-2 text-n-3 mb-4">
                Current plan: {subscription?.plan || 'FREE'}
              </p>
              <Button onClick={() => navigate('/pricing')}>
                Upgrade Plan
              </Button>
            </div>

            <div className="p-6 bg-n-8 border border-n-6 rounded-2xl">
              <h3 className="h4 mb-4">Profile Settings</h3>
              <p className="body-2 text-n-3 mb-4">
                Manage your account settings and preferences
              </p>
              <Button onClick={() => navigate('/profile')}>
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Dashboard;
