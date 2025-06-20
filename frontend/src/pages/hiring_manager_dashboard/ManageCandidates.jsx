import React, { useState, useEffect, useMemo } from 'react';
import HiringManagerNavbar from '../../components/HiringManagerNavbar';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ManageCandidates = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [recruiters, setRecruiters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    name: '',
    position: '',
    scoreRange: '',
    recruiter: '',
    status: ''
  });

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  useEffect(() => {
    fetchCandidates();
    fetchRecruiters();
    // eslint-disable-next-line
  }, [token]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/candidates/company', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCandidates(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch candidates');
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
    return 'text-red-700';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-blue-200 text-blue-800';
      case 'rejected':
        return 'bg-red-200 text-red-800';
      case 'selected':
        return 'bg-green-200 text-green-800';
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

  const filteredCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      const nameMatch = candidate.candidate_name?.toLowerCase().includes(filters.name.toLowerCase()) || !filters.name;
      const positionMatch = candidate.job_role_title?.toLowerCase().includes(filters.position.toLowerCase()) || !filters.position;
      const scoreMatch = isScoreInRange(candidate.ats_score, filters.scoreRange);
      const recruiterMatch = recruiters[candidate.recruiter_id]?.toLowerCase().includes(filters.recruiter.toLowerCase()) || !filters.recruiter;
      const statusMatch = !filters.status || candidate.status?.toLowerCase() === filters.status.toLowerCase();
      return nameMatch && positionMatch && scoreMatch && recruiterMatch && statusMatch;
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
  }, [candidates, filters, sortConfig, recruiters]);

  const columns = [
    { key: 'candidate_name', label: 'Candidate Name', sortable: true },
    { key: 'job_role_title', label: 'Applied Role', sortable: true },
    { key: 'recruiter_id', label: 'Recruiter', sortable: true },
    { key: 'ats_score', label: 'Score', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'feedback', label: 'View Feedback', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  const handleShortlist = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/${id}/status`, { status: 'shortlisted' }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchCandidates();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to shortlist candidate');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/${id}/status`, { status: 'rejected' }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchCandidates();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to reject candidate');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#001F3F]"><HiringManagerNavbar /><div className="px-36 py-6 text-white">Loading...</div></div>;
  if (error) return <div className="min-h-screen bg-[#001F3F]"><HiringManagerNavbar /><div className="px-36 py-6 text-red-500">{error}</div></div>;

  return (
    <div className="min-h-screen bg-[#001F3F]">
      <HiringManagerNavbar />
      <div className="px-36 py-6">
        <h1 className="text-4xl font-bold text-white mb-8">Manage Candidates</h1>
        <div className="bg-gray-300/80 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#01295B] mb-4">Filters:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#01295B] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-3 py-2 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#008B8B] focus:border-[#008B8B]"
                  placeholder="Search by name"
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-[#01295B] mb-1">
                  Applied Role
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  className="w-full px-3 py-2 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#008B8B] focus:border-[#008B8B]"
                  placeholder="Search by role"
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
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="selected">Selected</option>
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
                {filteredCandidates.map((candidate, idx) => (
                  <tr key={candidate.id || candidate._id} className="border-b border-gray-300 hover:bg-gray-200/50 transition-colors">
                    <td className="py-3 px-4 text-[#01295B] font-semibold">{candidate.candidate_name}</td>
                    <td className="py-3 px-4 text-[#01295B]">{candidate.job_role_title}</td>
                    <td className="py-3 px-4 text-[#01295B]">{recruiters[candidate.recruiter_id] || candidate.recruiter_id}</td>
                    <td className={`py-3 px-4 font-semibold ${getScoreColor(candidate.ats_score)}`}>{candidate.ats_score}</td>
                    <td className={`py-3 px-4`}><span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(candidate.status)}`}>{candidate.status}</span></td>
                    <td className="py-3 px-4">
                      <button onClick={() => navigate(`/hiring-manager/feedback/${candidate.id || candidate._id}`)} className="text-[#008B8B] hover:underline cursor-pointer">View Feedback</button>
                    </td>
                    <td className="py-3 px-4">
                      {candidate.status === 'selected' ? (
                        <>
                          <button onClick={() => handleShortlist(candidate.id)} className="px-4 py-1 rounded-full text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 mr-2">Shortlist</button>
                          <button onClick={() => handleReject(candidate.id)} className="px-4 py-1 rounded-full text-sm font-medium bg-red-500 text-white hover:bg-red-600">Reject</button>
                        </>
                      ) : (
                        <button onClick={() => handleReject(candidate.id)} className="px-4 py-1 rounded-full text-sm font-medium bg-red-500 text-white hover:bg-red-600">Reject</button>
                      )}
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

export default ManageCandidates; 