import React, { useState, useMemo, useEffect } from 'react';
import RecruiterNavbar from '../../components/RecruiterNavbar';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManageCVs = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cvData, setCvData] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);

  const [filters, setFilters] = useState({
    jobRole: '',
    candidateName: '',
    scoreRange: ''
  });

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  useEffect(() => {
    fetchCVs();
    fetchJobRoles();
  }, [token]);

  const fetchJobRoles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/job-roles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setJobRoles(response.data);
    } catch (err) {
      console.error('Failed to fetch job roles:', err);
    }
  };

  const fetchCVs = async () => {
    try {
      const response = await axios.get('http://localhost:8000/recruiter', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('CV Data:', response.data);
      setCvData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch CVs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const isScoreInRange = (score, range) => {
    if (!range) return true;
    const [min, max] = range.split('-').map(Number);
    return score >= min && score <= max;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-700';
    if (score >= 70) return 'text-blue-700';
    if (score >= 50) return 'text-yellow-700';
    if (score >= 30) return 'text-orange-700';
    return 'text-red-700';
  };

  const handleSort = (key) => {
    setSortConfig(prevSort => ({
      key,
      direction: 
        prevSort.key === key && prevSort.direction === 'asc'
          ? 'desc'
          : 'asc'
    }));
  };

  const SortIndicator = ({ column }) => {
    if (sortConfig.key !== column) {
      return <span className="ml-1 text-gray-400">↕</span>;
    }
    return <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/candidates/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchCVs(); // Refresh the CV list
    } catch (error) {
      console.error('Error deleting CV:', error);
    }
  };

  const handleViewFeedback = (cv) => {
    const candidateId = cv.id || cv._id;
    navigate(`/recruiter/feedback/${candidateId}`);
  };

  const filteredCVs = useMemo(() => {
    let filtered = cvData.filter(cv => {
      const jobRoleMatch = !filters.jobRole || cv.job_role_id === filters.jobRole;
      const nameMatch = !filters.candidateName || 
        cv.candidate_name?.toLowerCase().includes(filters.candidateName.toLowerCase());
      const scoreMatch = isScoreInRange(cv.ats_score, filters.scoreRange);

      return jobRoleMatch && nameMatch && scoreMatch;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    console.log('Filtered CVs:', filtered);
    return filtered;
  }, [cvData, filters, sortConfig]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001F3F]">
        <RecruiterNavbar />
        <div className="px-36 py-6">
          <div className="text-white text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#001F3F]">
        <RecruiterNavbar />
        <div className="px-36 py-6">
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001F3F]">
      <RecruiterNavbar />
      
      <main className="px-36 py-16">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Manage CVs</h1>
          
          {/* Filters */}
          <div className="bg-gray-300/80 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="jobRole" className="block text-[#01295B] font-medium mb-2">
                  Job Role
                </label>
                <select
                  id="jobRole"
                  value={filters.jobRole}
                  onChange={(e) => handleFilterChange('jobRole', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#008B8B] bg-white"
                >
                  <option value="">All Roles</option>
                  {jobRoles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="candidateName" className="block text-[#01295B] font-medium mb-2">
                  Candidate Name
                </label>
                <input
                  type="text"
                  id="candidateName"
                  value={filters.candidateName}
                  onChange={(e) => handleFilterChange('candidateName', e.target.value)}
                  placeholder="Search by name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#008B8B] bg-white"
                />
              </div>
              
              <div>
                <label htmlFor="scoreRange" className="block text-[#01295B] font-medium mb-2">
                  Score Range
                </label>
                <select
                  id="scoreRange"
                  value={filters.scoreRange}
                  onChange={(e) => handleFilterChange('scoreRange', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#008B8B] bg-white"
                >
                  <option value="">All Scores</option>
                  <option value="90-100">90-100</option>
                  <option value="80-89">80-89</option>
                  <option value="70-79">70-79</option>
                  <option value="0-69">Below 70</option>
                </select>
              </div>
            </div>
          </div>

          {/* CV List */}
          <div className="bg-gray-300/80 rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[#01295B]">
                    <th className="pb-4">Candidate Name</th>
                    <th className="pb-4">Position</th>
                    <th className="pb-4">Score</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCVs.map((cv) => (
                    <tr key={cv.id || cv._id} className="border-t border-gray-400">
                      <td className="py-4">{cv.candidate_name}</td>
                      <td className="py-4">{cv.job_role_title}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          cv.ats_score >= 80 ? 'bg-green-100 text-green-800' :
                          cv.ats_score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cv.ats_score}%
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-4">
                          {cv.cv_url ? (
                            <button
                              onClick={() => {
                                try {
                                  // Ensure the URL is properly encoded and add Cloudinary parameters
                                  const encodedUrl = encodeURI(cv.cv_url);
                                  console.log('Opening CV URL:', encodedUrl);
                                  
                                  // Force open in new window with specific dimensions
                                  const width = 800;
                                  const height = 600;
                                  const left = (window.screen.width - width) / 2;
                                  const top = (window.screen.height - height) / 2;
                                  
                                  const windowFeatures = `
                                    width=${width},
                                    height=${height},
                                    left=${left},
                                    top=${top},
                                    menubar=yes,
                                    toolbar=yes,
                                    location=yes,
                                    status=yes,
                                    scrollbars=yes,
                                    resizable=yes
                                  `.replace(/\s/g, '');
                                  
                                  const newWindow = window.open(encodedUrl, '_blank', windowFeatures);
                                  
                                  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                                    // If popup is blocked, show instructions
                                    alert('Please allow popups for this site to view CVs. You can also try right-clicking the link and selecting "Open in new tab".');
                                  }
                                } catch (error) {
                                  console.error('Error opening CV:', error);
                                  alert('Unable to open CV. Please try again or contact support.');
                                }
                              }}
                              className="text-[#008B8B] hover:text-[#006666]"
                            >
                              View CV
                            </button>
                          ) : (
                            <span className="text-gray-500">No CV URL</span>
                          )}
                          <button
                            onClick={() => handleViewFeedback(cv)}
                            className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
                          >
                            View Feedback
                          </button>
                          <button
                            onClick={() => handleDelete(cv.id || cv._id)}
                            className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageCVs; 