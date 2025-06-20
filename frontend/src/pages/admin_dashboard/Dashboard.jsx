import { useState, useEffect } from 'react';
import DashboardNavbar from '../../components/AdminNavbar';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

function AdminDashboard() {
  const { user, token } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Chart data states
  const [apiCallsOverTime, setApiCallsOverTime] = useState([]);
  const [endpointPerformance, setEndpointPerformance] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [chartsError, setChartsError] = useState('');

  useEffect(() => {
    if (!token) return;
    const fetchMetrics = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get('http://localhost:8000/users/admin/metrics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMetrics(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const fetchCharts = async () => {
      setChartsLoading(true);
      setChartsError('');
      try {
        const [callsRes, perfRes] = await Promise.all([
          axios.get('http://localhost:8000/users/admin/api-calls-over-time', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:8000/users/admin/endpoint-performance', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setApiCallsOverTime(callsRes.data);
        setEndpointPerformance(perfRes.data);
      } catch (err) {
        setChartsError('Failed to fetch chart data');
      } finally {
        setChartsLoading(false);
      }
    };
    fetchCharts();
  }, [token]);

  // Find max response time for display
  const maxResponse = endpointPerformance.length
    ? Math.max(...endpointPerformance.map(e => e.max || 0))
    : null;

  return (
    <div className="min-h-screen bg-[#001F3F]">
      <DashboardNavbar />
      <main className="px-36 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">
          Hello, {user?.full_name || 'Admin'}!
        </h1>
        {loading ? (
          <div className="text-white text-xl">Loading metrics...</div>
        ) : error ? (
          <div className="text-red-400 text-xl">{error}</div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Performance Metrics Card */}
              <div className="lg:col-span-2 bg-gray-200/70 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-[#01295B] mb-4">PERFORMANCE METRICS</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[#008B8B] text-lg font-medium">AVG. RESPONSE TIME</h3>
                    <div className="h-56 bg-[#F4FFF9] rounded-lg mt-2">
                      {chartsLoading ? (
                        <div className="text-center py-20 text-gray-500">Loading chart...</div>
                      ) : chartsError ? (
                        <div className="text-center py-20 text-red-400">{chartsError}</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={endpointPerformance.length ? endpointPerformance : [{ endpoint: 'N/A', avg: 0 }]}
                            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <XAxis dataKey="endpoint" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="avg" fill="#008B8B" name="Avg Response Time (ms)" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[#008B8B] text-lg font-medium">MAX RESPONSE TIME</h3>
                    <p className="text-2xl font-bold text-[#F4FFF9] mt-2">{maxResponse !== null ? `${maxResponse} ms` : 'N/A'}</p>
                  </div>
                </div>
              </div>
              {/* Stats Cards */}
              <div className="space-y-6">
                <div className="bg-gray-200/70 rounded-lg p-6">
                  <h2 className="text-lg font-bold text-[#01295B] mb-2">TOTAL REGISTERED COMPANIES</h2>
                  <p className="text-5xl font-bold text-[#008B8B]">{metrics.total_companies}</p>
                </div>
                <div className="bg-gray-200/70 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-[#01295B] mb-2">TOTAL REGISTERED USERS</h3>
                  <p className="text-5xl font-bold text-[#008B8B]">{metrics.total_users}</p>
                </div>
                <div className="bg-gray-200/70 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-[#01295B] mb-2">TOTAL CVs PROCESSED</h3>
                  <p className="text-5xl font-bold text-[#008B8B]">{metrics.total_cvs}</p>
                </div>
              </div>
            </div>
            {/* Usage Metrics Card */}
            <div className="bg-gray-200/70 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#01295B] mb-4">USAGE METRICS</h2>
              <div>
                <h3 className="text-[#008B8B] text-lg font-medium mb-2">API calls over time</h3>
                <div className="h-48 bg-white rounded-lg mb-4">
                  {chartsLoading ? (
                    <div className="text-center py-20 text-gray-500">Loading chart...</div>
                  ) : chartsError ? (
                    <div className="text-center py-20 text-red-400">{chartsError}</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={apiCallsOverTime.length ? apiCallsOverTime : [{ date: 'N/A', calls: 0 }]}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="calls" stroke="#008B8B" name="API Calls" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-[#008B8B] text-lg font-medium">Total API calls</h3>
                    <p className="text-3xl font-semibold text-[#001F3F]">{metrics.total_api_calls}</p>
                  </div>
                  <div>
                    <h3 className="text-[#008B8B] text-lg font-medium">Most accessed API endpoint</h3>
                    <p className="text-3xl font-semibold text-[#001F3F]">{metrics.most_accessed_endpoint}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard; 