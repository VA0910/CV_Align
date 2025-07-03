import { useState, useEffect } from 'react';
import RecruiterNavbar from '../../components/RecruiterNavbar';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

function RecruiterDashboard() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({
    mostAppliedRole: 'Loading...',
    avgFitScore: 'Loading...',
    totalCVs: 'Loading...',
    rejected: 'Loading...',
    shortlisted: 'Loading...'
  });
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    fetchMetrics();
    fetchCandidates();
  }, [token]);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('http://localhost:8000/job-roles/metrics/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMetrics(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('http://localhost:8000/recruiter', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCandidates(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch candidates');
    }
  };

  const handleSelect = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/${id}/status`, {
        status: 'selected'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchCandidates(); // Refresh the candidates list
      fetchMetrics(); // Refresh metrics
    } catch (error) {
      console.error('Error updating candidate status:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/${id}/status`, {
        status: 'rejected'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchCandidates(); // Refresh the candidates list
      fetchMetrics(); // Refresh metrics
    } catch (error) {
      console.error('Error updating candidate status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#001F3F]">
      <RecruiterNavbar />
      
      <main className="px-36 py-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Hello, {user?.full_name || 'Recruiter'}!
          </h1>
          <Link 
            to="/recruiter/upload-cv"
            className="bg-[#A2E8DD] text-[#01295B] px-6 py-2 rounded-lg font-medium hover:bg-[#8CD3C7] transition-colors"
          >
            UPLOAD NEW CV
          </Link>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-300/80 rounded-lg p-6">
            <h2 className="text-[#01295B] font-bold mb-4">MOST APPLIED ROLE</h2>
            <p className="text-[#008B8B] text-xl font-medium">{metrics.mostAppliedRole}</p>
          </div>

          <div className="bg-gray-300/80 rounded-lg p-6">
            <h2 className="text-[#01295B] font-bold mb-4">AVG. FIT SCORE</h2>
            <p className="text-[#008B8B] text-xl font-medium">{metrics.avgFitScore}%</p>
          </div>

          <div className="bg-gray-300/80 rounded-lg p-6">
            <h2 className="text-[#01295B] font-bold mb-4">TOTAL CVs UPLOADED</h2>
            <p className="text-[#008B8B] text-xl font-medium">{metrics.totalCVs}</p>
          </div>

          <div className="bg-gray-300/80 rounded-lg p-6">
            <h2 className="text-[#01295B] font-bold mb-4"># REJECTED</h2>
            <p className="text-[#008B8B] text-xl font-medium">{metrics.rejected}</p>
          </div>

          <div className="bg-gray-300/80 rounded-lg p-6">
            <h2 className="text-[#01295B] font-bold mb-4"># SHORTLISTED</h2>
            <p className="text-[#008B8B] text-xl font-medium">{metrics.shortlisted}</p>
          </div>
        </div>

        {/* Candidate Summary */}
        <div className="bg-gray-300/80 rounded-lg p-6">
          <h2 className="text-xl font-bold text-[#01295B] mb-4">Recent Candidates</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[#01295B]">
                  <th className="pb-4">Candidate Name</th>
                  <th className="pb-4">Position</th>
                  <th className="pb-4">Score</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .slice(0, 5)
                  .map((candidate) => (
                  <tr key={candidate._id} className="border-t border-gray-400">
                    <td className="py-4">{candidate.candidate_name}</td>
                    <td className="py-4">{candidate.job_role_title}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        candidate.ats_score >= 80 ? 'bg-green-100 text-green-800' :
                        candidate.ats_score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {candidate.ats_score}%
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        candidate.status === 'selected' ? 'bg-green-100 text-green-800' :
                        candidate.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        candidate.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-4">
                        {candidate.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleSelect(candidate.id)}
                              className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600"
                            >
                              Select
                            </button>
                            <button
                              onClick={() => handleReject(candidate.id)}
                              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {(candidate.status === 'selected' || candidate.status === 'rejected' || candidate.status === 'shortlisted') && (
                          <span className="text-gray-500 text-sm">
                            {candidate.status === 'selected' ? 'Forwarded to Hiring Manager' :
                             candidate.status === 'shortlisted' ? 'Approved by Hiring Manager' :
                             'Rejected'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RecruiterDashboard; 