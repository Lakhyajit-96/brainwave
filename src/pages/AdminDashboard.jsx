import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../lib/api';
import Section from '../components/Section';
import Button from '../components/Button';

const AdminDashboard = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchAdminData();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, contactsRes, waitlistRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ limit: 10 }),
        adminAPI.getContacts({ limit: 10 }),
        adminAPI.getWaitlist({ limit: 10 })
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setContacts(contactsRes.data.contacts);
      setWaitlist(waitlistRes.data.waitlist);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactStatusUpdate = async (id, status) => {
    try {
      await adminAPI.updateContact(id, { status });
      fetchAdminData();
    } catch (error) {
      console.error('Failed to update contact:', error);
    }
  };

  if (loading) {
    return (
      <Section className="pt-[12rem] -mt-[5.25rem]">
        <div className="container">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-color-1"></div>
            <p className="mt-4 text-n-3">Loading admin dashboard...</p>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section className="pt-[12rem] -mt-[5.25rem]">
      <div className="container">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="h2">Admin Dashboard</h1>
            <Button onClick={() => navigate('/dashboard')}>User Dashboard</Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-n-6">
            {['overview', 'users', 'contacts', 'waitlist'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-color-1 text-color-1'
                    : 'text-n-3 hover:text-n-1'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="p-6 bg-n-8 border border-n-6 rounded-2xl">
                  <h3 className="text-n-3 text-sm mb-2">Total Users</h3>
                  <p className="h2">{stats.totalUsers}</p>
                </div>
                <div className="p-6 bg-n-8 border border-n-6 rounded-2xl">
                  <h3 className="text-n-3 text-sm mb-2">Active Subscriptions</h3>
                  <p className="h2">{stats.totalSubscriptions}</p>
                </div>
                <div className="p-6 bg-n-8 border border-n-6 rounded-2xl">
                  <h3 className="text-n-3 text-sm mb-2">Total Revenue</h3>
                  <p className="h2">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="p-6 bg-n-8 border border-n-6 rounded-2xl">
                  <h3 className="text-n-3 text-sm mb-2">AI Chats</h3>
                  <p className="h2">{stats.totalAIChats}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-n-8 border border-n-6 rounded-2xl">
                  <h3 className="h4 mb-4">Subscriptions by Plan</h3>
                  {stats.subscriptionsByPlan.map((item) => (
                    <div key={item.plan} className="flex justify-between py-2 border-b border-n-6">
                      <span className="text-n-3">{item.plan}</span>
                      <span className="text-n-1 font-semibold">{item._count}</span>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-n-8 border border-n-6 rounded-2xl">
                  <h3 className="h4 mb-4">Quick Stats</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-n-6">
                      <span className="text-n-3">Contacts</span>
                      <span className="text-n-1 font-semibold">{stats.totalContacts}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-n-6">
                      <span className="text-n-3">Waitlist</span>
                      <span className="text-n-1 font-semibold">{stats.waitlistCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="p-6 bg-n-8 border border-n-6 rounded-2xl">
              <h3 className="h4 mb-6">Recent Users</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-n-6">
                      <th className="text-left py-3 px-4 text-n-3">Name</th>
                      <th className="text-left py-3 px-4 text-n-3">Email</th>
                      <th className="text-left py-3 px-4 text-n-3">Plan</th>
                      <th className="text-left py-3 px-4 text-n-3">Role</th>
                      <th className="text-left py-3 px-4 text-n-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-n-6">
                        <td className="py-3 px-4 text-n-1">{user.name}</td>
                        <td className="py-3 px-4 text-n-1">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-color-1/10 text-color-1 rounded text-xs">
                            {user.subscription?.plan || 'FREE'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-n-1">{user.role}</td>
                        <td className="py-3 px-4 text-n-3 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="p-6 bg-n-8 border border-n-6 rounded-2xl">
              <h3 className="h4 mb-6">Contact Submissions</h3>
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="p-4 bg-n-7 border border-n-6 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-n-1 font-semibold">{contact.name}</h4>
                        <p className="text-n-3 text-sm">{contact.email}</p>
                      </div>
                      <select
                        value={contact.status}
                        onChange={(e) => handleContactStatusUpdate(contact.id, e.target.value)}
                        className="px-3 py-1 bg-n-8 border border-n-6 rounded text-sm text-n-1"
                      >
                        <option value="NEW">New</option>
                        <option value="READ">Read</option>
                        <option value="REPLIED">Replied</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                    {contact.subject && (
                      <p className="text-n-2 text-sm mb-2"><strong>Subject:</strong> {contact.subject}</p>
                    )}
                    <p className="text-n-3 text-sm">{contact.message}</p>
                    <p className="text-n-4 text-xs mt-2">
                      {new Date(contact.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Waitlist Tab */}
          {activeTab === 'waitlist' && (
            <div className="p-6 bg-n-8 border border-n-6 rounded-2xl">
              <h3 className="h4 mb-6">Waitlist Entries</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-n-6">
                      <th className="text-left py-3 px-4 text-n-3">Name</th>
                      <th className="text-left py-3 px-4 text-n-3">Email</th>
                      <th className="text-left py-3 px-4 text-n-3">Status</th>
                      <th className="text-left py-3 px-4 text-n-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlist.map((entry) => (
                      <tr key={entry.id} className="border-b border-n-6">
                        <td className="py-3 px-4 text-n-1">{entry.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-n-1">{entry.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-color-1/10 text-color-1 rounded text-xs">
                            {entry.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-n-3 text-sm">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};

export default AdminDashboard;
