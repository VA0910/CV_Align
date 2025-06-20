import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import HiringManagerNavbar from '../../components/HiringManagerNavbar';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

function HiringManagerDashboard() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [topJobRoles, setTopJobRoles] = useState([]);
  const [metrics, setMetrics] = useState({
    mostAppliedRole: "Loading...",
    avgFitScore: "Loading...",
    totalCandidates: "Loading...",
    topRecruiter: "Loading...",
    lowestShortlisting: "Loading..."
  });
  const [recruiters, setRecruiters] = useState([]);
  const [allJobRoles, setAllJobRoles] = useState([]);
  const [candidates, setCandidates] = useState([]);

  // Add a recruiterId-to-name map
  const recruiterIdToName = useMemo(() => {
    const map = {};
    recruiters.forEach(r => {
      map[r.id || r._id] = r.full_name;
    });
    return map;
  }, [recruiters]);

  useEffect(() => {
    fetchTopJobRoles();
    fetchMetrics();
    fetchRecruiters();
    fetchAllJobRoles();
    fetchCandidates();
  }, [token]);

  const fetchTopJobRoles = async () => {
    try {
      console.log('Fetching top job roles...');
      const response = await axios.get('http://localhost:8000/job-roles/top/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Top job roles response:', response.data);
      setTopJobRoles(response.data || []);
    } catch (err) {
      // Don't show error if there are no job roles yet
      if (err.response?.status !== 404) {
        console.error('Error fetching top job roles:', err);
      }
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const fetchRecruiters = async () => {
    try {
      const response = await axios.get('http://localhost:8000/users/recruiters/top', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setRecruiters(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch recruiters');
    }
  };

  const fetchAllJobRoles = async () => {
    try {
      console.log('Fetching all job roles...');
      const response = await axios.get('http://localhost:8000/job-roles/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('All job roles response:', response.data);
      setAllJobRoles(response.data || []);
    } catch (err) {
      // Don't show error if there are no job roles yet
      if (err.response?.status !== 404) {
        console.error('Error fetching job roles:', err);
      }
    }
  };

  const handleDeleteRecruiter = async (recruiterId) => {
    try {
      await axios.delete(`http://localhost:8000/recruiters/${recruiterId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchRecruiters(); // Refresh the recruiters list
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete recruiter');
    }
  };

  const handleDeleteJobRole = async (job_id) => {
    try {
      await axios.delete(`http://localhost:8000/job-roles/${job_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchAllJobRoles(); // Refresh the job roles list
      fetchTopJobRoles(); // Also refresh top job roles
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete job role');
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('http://localhost:8000/candidates/company', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCandidates(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch candidates');
    }
  };

  const handleShortlist = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/${id}/status`, {
        status: 'shortlisted'
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
      <HiringManagerNavbar />
      
      <main className="px-36 py-8">
        {/* Welcome Section */}
        <h1 className="text-4xl font-bold text-white mb-8">
          Hello, {user?.full_name || 'Manager'}!
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {/* Most Applied Role */}
          <div className="bg-gray-300/80 rounded-lg p-6">
            <h2 className="text-[#01295B] font-bold mb-4">MOST APPLIED ROLE</h2>
            <p className="text-[#008B8B] text-xl font-medium">
              {metrics.mostAppliedRole}
            </p>
          </div>

          {/* Average Fit Score */}
          <div className="bg-gray-300/80 rounded-lg p-6">
            <h2 className="text-[#01295B] font-bold mb-4">AVG. FIT SCORE</h2>
            <p className="text-[#008B8B] text-xl font-medium">{metrics.avgFitScore}</p>
          </div>

          {/* Total Candidates */}
          <div className="bg-gray-300/80 rounded-lg p-6">
            <h2 className="text-[#01295B] font-bold mb-4">TOTAL CANDIDATES (MONTH)</h2>
            <p className="text-[#008B8B] text-xl font-medium">{metrics.totalCandidates}</p>
          </div>

          {/* Top Recruiter */}
          <div className="bg-gray-300/80 rounded-lg p-6">
            <h2 className="text-[#01295B] font-bold mb-4">TOP RECRUITER</h2>
            <p className="text-[#008B8B] text-xl font-medium">{metrics.topRecruiter}</p>
          </div>

          {/* Lowest Shortlistings */}
          <div className="bg-gray-300/80 rounded-lg p-6">
            <h2 className="text-[#01295B] font-bold mb-4">LOWEST SHORTLISTINGS</h2>
            <p className="text-[#008B8B] text-xl font-medium">{metrics.lowestShortlisting}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Job Roles Section */}
          <div className="bg-gray-300/80 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#01295B]">JOB ROLES</h2>
              <Link
                to="/hiring-manager/manage/create-job-role"
                className="px-4 py-2 bg-[#A2E8DD] text-[#01295B] rounded-lg font-medium hover:bg-[#8CD3C7] transition-colors"
              >
                + CREATE NEW JOB
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-4">Loading job roles...</div>
            ) : allJobRoles.length > 0 ? (
              <div className="space-y-4">
                {allJobRoles.slice(0, 3).map((role) => (
                  <div
                    key={role.id}
                    className="bg-gray-100/90 rounded-lg p-4 hover:bg-gray-200/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-[#01295B]">{role.title}</h3>
                        <p className="text-[#008B8B]">{role.department}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#01295B]">
                          {role.applications_count} Applications
                        </span>
                        <span className="text-sm text-[#01295B]">
                          {role.shortlisted_count} Shortlisted
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <div className="flex gap-2">
                        <Link
                          to={`/hiring-manager/job-roles/${role.id}`}
                          className="text-[#008B8B] hover:text-[#006d6d] transition-colors"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleDeleteJobRole(role.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        role.status === "Active" 
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}>
                        {role.status}
                      </span>
                    </div>
                  </div>
                ))}
                {allJobRoles.length > 3 && (
                  <Link
                    to="/hiring-manager/manage/job-roles"
                    className="block text-center text-[#008B8B] hover:text-[#006d6d] transition-colors mt-4"
                  >
                    View All Job Roles →
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                No job roles found.{" "}
                <Link
                  to="/hiring-manager/manage/create-job-role"
                  className="text-[#008B8B] hover:underline"
                >
                  Create your first job role
                </Link>
              </div>
            )}
          </div>

          {/* Recruiters Team Overview */}
          <div className="bg-gray-300/80 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-[#01295B] mb-6">RECRUITERS TEAM OVERVIEW</h2>
            {recruiters.length > 0 ? (
              <div className="space-y-4">
                {recruiters.map((recruiter) => (
                  <div
                    key={recruiter.id}
                    className="bg-gray-100/90 rounded-lg p-4 hover:bg-gray-200/50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-[#01295B]">
                          {recruiter.full_name}
                        </h3>
                        <p className="text-[#008B8B]">{recruiter.email}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteRecruiter(recruiter.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">No recruiters found</div>
            )}
          </div>
        </div>

        {/* Candidate Summary Section */}
        <div className="bg-gray-300/80 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#01295B] mb-6">CANDIDATE SUMMARY</h2>
          <div className="bg-gray-100/90 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-3 px-4 text-[#008B8B] font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-[#008B8B] font-medium">Role Applied for</th>
                  <th className="text-left py-3 px-4 text-[#008B8B] font-medium">Score</th>
                  <th className="text-left py-3 px-4 text-[#008B8B] font-medium">Recruiter</th>
                  <th className="text-left py-3 px-4 text-[#008B8B] font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-[#008B8B] font-medium">View Feedback</th>
                  <th className="text-left py-3 px-4 text-[#008B8B] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...candidates]
                  .filter(candidate => candidate.status === "selected" || candidate.status === "shortlisted")
                  .sort((a, b) => (b.ats_score || 0) - (a.ats_score || 0))
                  .map((candidate, index) => (
                    <tr key={candidate._id || index} className="border-b border-gray-300 hover:bg-gray-200/50 transition-colors">
                      <td className="py-3 px-4 text-[#01295B] font-semibold">{candidate.candidate_name}</td>
                      <td className="py-3 px-4 text-[#01295B]">{candidate.job_role_title}</td>
                      <td className="py-3 px-4 text-[#01295B]">{candidate.ats_score || 0}%</td>
                      <td className="py-3 px-4 text-[#01295B]">{recruiterIdToName[candidate.recruiter_id] || candidate.recruiter_id}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          candidate.status === "shortlisted"
                            ? "bg-blue-200 text-blue-800"
                            : candidate.status === "rejected"
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link 
                          to={`/hiring-manager/feedback/${candidate._id || candidate.id}`}
                          className="text-[#01295B] hover:underline hover:font-semibold"
                        >
                          View Feedback
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleShortlist(candidate._id || candidate.id)}
                            className="px-4 py-1 rounded-full text-sm font-medium bg-[#008B8B] text-white hover:bg-[#007a7a] transition-colors"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleReject(candidate._id || candidate.id)}
                            className="px-4 py-1 rounded-full text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            Reject
                          </button>
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

export default HiringManagerDashboard; 