import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HiringManagerNavbar from '../../components/HiringManagerNavbar';
import CVFilters from '../../components/CVFilters';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ManageCVs = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [cvData, setCvData] = useState([]);
  const [recruiters, setRecruiters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    position: '',
    fileName: '',
    scoreRange: '',
    recruiter: '',
    status: ''
  });

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  useEffect(() => {
    fetchCVs();
    fetchRecruiters();
    // eslint-disable-next-line
  }, [token]);

  const fetchCVs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/candidates/company', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCvData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch CVs');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecruiters = async () => {
    try {
      const response = await axios.get('http://localhost:8000/users/recruiters/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Map recruiter id to name
      const map = {};
      response.data.forEach(r => { map[r.id] = r.full_name; });
      setRecruiters(map);
    } catch (err) {
      // ignore recruiter error
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'selected':
        return 'bg-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-200 text-red-800';
      case 'shortlisted':
        return 'bg-blue-200 text-blue-800';
      default:
        return 'bg-yellow-200 text-yellow-800';
    }
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

  const handleViewFeedback = (id) => {
    navigate(`/hiring-manager/feedback/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this CV?')) return;
    try {
      await axios.delete(`http://localhost:8000/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchCVs();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete CV');
    }
  };

  const filteredCVs = useMemo(() => {
    let filtered = cvData.filter(cv => {
      const positionMatch = cv.job_role_title?.toLowerCase().includes(filters.position.toLowerCase()) || !filters.position;
      const fileNameMatch = cv.candidate_name?.toLowerCase().includes(filters.fileName.toLowerCase()) || !filters.fileName;
      const scoreMatch = isScoreInRange(cv.ats_score, filters.scoreRange);
      const recruiterMatch = recruiters[cv.recruiter_id]?.toLowerCase().includes(filters.recruiter.toLowerCase()) || !filters.recruiter;
      const statusMatch = !filters.status || cv.status?.toLowerCase() === filters.status.toLowerCase();
      return positionMatch && fileNameMatch && scoreMatch && recruiterMatch && statusMatch;
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
    return filtered;
  }, [cvData, filters, sortConfig, recruiters]);

  const columns = [
    { key: 'candidate_name', label: 'Candidate Name', sortable: true },
    { key: 'job_role_title', label: 'Position', sortable: true },
    { key: 'recruiter_id', label: 'Recruiter', sortable: true },
    { key: 'ats_score', label: 'Score', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'cv_url', label: 'View CV', sortable: false },
    { key: 'view_feedback', label: 'View Feedback', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  if (loading) return <div className="min-h-screen bg-[#001F3F]"><HiringManagerNavbar /><div className="px-36 py-6 text-white">Loading...</div></div>;
  if (error) return <div className="min-h-screen bg-[#001F3F]"><HiringManagerNavbar /><div className="px-36 py-6 text-red-500">{error}</div></div>;

  return (
    <div className="min-h-screen bg-[#001F3F]">
      <HiringManagerNavbar />
      <div className="px-36 py-6">
        <h1 className="text-4xl font-bold text-white mb-8">Manage CVs</h1>
        <div className="bg-gray-300/80 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#01295B] mb-4">Filters:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label htmlFor="fileName" className="block text-sm font-medium text-[#01295B] mb-1">
                  CV Name
                </label>
                <input
                  type="text"
                  id="fileName"
                  name="fileName"
                  className="w-full px-3 py-2 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#008B8B] focus:border-[#008B8B]"
                  placeholder="Search by CV name"
                  onChange={(e) => handleFilterChange('fileName', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-[#01295B] mb-1">
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  className="w-full px-3 py-2 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#008B8B] focus:border-[#008B8B]"
                  placeholder="Search by position"
                  onChange={(e) => handleFilterChange('position', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="recruiter" className="block text-sm font-medium text-[#01295B] mb-1">
                  Recruiter
                </label>
                <input
                  type="text"
                  id="recruiter"
                  name="recruiter"
                  className="w-full px-3 py-2 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#008B8B] focus:border-[#008B8B]"
                  placeholder="Search by recruiter"
                  onChange={(e) => handleFilterChange('recruiter', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="scoreRange" className="block text-sm font-medium text-[#01295B] mb-1">
                  Score Range
                </label>
                <select
                  id="scoreRange"
                  name="scoreRange"
                  className="w-full px-3 py-2 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#008B8B] focus:border-[#008B8B]"
                  onChange={(e) => handleFilterChange('scoreRange', e.target.value)}
                >
                  <option value="">All Scores</option>
                  <option value="90-100">90-100</option>
                  <option value="80-89">80-89</option>
                  <option value="70-79">70-79</option>
                  <option value="0-69">Below 70</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-[#01295B] mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="w-full px-3 py-2 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#008B8B] focus:border-[#008B8B]"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
          <div className="bg-gray-100/90 rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col.key} className="py-3 px-4 text-[#008B8B] font-medium cursor-pointer" onClick={() => col.sortable && handleSort(col.key)}>
                      {col.label} {col.sortable && <SortIndicator column={col.key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCVs.map((cv, idx) => (
                  <tr key={cv.id || cv._id} className="border-b border-gray-300 hover:bg-gray-200/50 transition-colors">
                    <td className="py-3 px-4 text-[#01295B] font-semibold">{cv.candidate_name}</td>
                    <td className="py-3 px-4 text-[#01295B]">{cv.job_role_title}</td>
                    <td className="py-3 px-4 text-[#01295B]">{recruiters[cv.recruiter_id] || cv.recruiter_id}</td>
                    <td className={`py-3 px-4 font-semibold ${getScoreColor(cv.ats_score)}`}>{cv.ats_score}</td>
                    <td className={`py-3 px-4`}><span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(cv.status)}`}>{cv.status}</span></td>
                    <td className="py-3 px-4">
                      {cv.cv_url ? (
                        <a href={cv.cv_url} target="_blank" rel="noopener noreferrer" className="text-[#008B8B] hover:underline">View CV</a>
                      ) : (
                        <span className="text-gray-400">No CV</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleViewFeedback(cv.id || cv._id)} className="text-[#008B8B] hover:underline">View Feedback</button>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleDelete(cv.id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCVs; 