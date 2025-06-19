import React, { useState, useMemo, useEffect } from 'react';
import RecruiterNavbar from '../../components/RecruiterNavbar';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const ManageCandidates = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [candidates, setCandidates] = useState([]);

  const [filters, setFilters] = useState({
    name: '',
    position: '',
    scoreRange: '',
    status: ''
  });

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  useEffect(() => {
    fetchCandidates();
  }, [token]);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('http://localhost:8000/candidates/recruiter', {
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

  const handleSelect = async (id) => {
    try {
      await axios.post(`http://localhost:8000/candidates/${id}/select`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchCandidates(); // Refresh the candidates list
    } catch (error) {
      console.error('Error updating candidate status:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`http://localhost:8000/candidates/${id}/reject`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchCandidates(); // Refresh the candidates list
    } catch (error) {
      console.error('Error updating candidate status:', error);
    }
  };

  const getStatusFromFilters = (candidate) => {
    return candidate.status;
  };

  const filteredCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      const nameMatch = candidate.candidate_name?.toLowerCase().includes(filters.name.toLowerCase()) || !filters.name;
      const positionMatch = candidate.job_role_title?.toLowerCase().includes(filters.position.toLowerCase()) || !filters.position;
      const scoreMatch = isScoreInRange(candidate.ats_score, filters.scoreRange);
      const statusMatch = !filters.status || candidate.status === filters.status;

      return nameMatch && positionMatch && scoreMatch && statusMatch;
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
  }, [candidates, filters, sortConfig]);

  const columns = [
    { key: 'serialNo', label: 'S.No', sortable: false },
    { key: 'candidate_name', label: 'Candidate Name', sortable: true },
    { key: 'job_role_title', label: 'Applied Role', sortable: true },
    { key: 'ats_score', label: 'Score', sortable: true },
    { key: 'feedback', label: 'Generated Feedback', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

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
      
      <div className="px-36 py-6">
        <h1 className="text-4xl font-bold text-white mb-8">Manage Candidates</h1>
        
        <div className="bg-gray-300/80 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#01295B] mb-4">Filters:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <option value="uploaded">Uploaded</option>
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-400">
                  {columns.map(column => (
                    <th 
                      key={column.key}
                      className={`py-3 px-4 text-left text-[#008B8B] font-medium ${
                        column.sortable ? 'cursor-pointer hover:text-[#006d6d]' : ''
                      }`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center">
                        {column.label}
                        {column.sortable && <SortIndicator column={column.key} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate, index) => (
                  <tr 
                    key={candidate.id}
                    className="border-b border-gray-300 hover:bg-gray-200/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-[#01295B]">{index + 1}</td>
                    <td className="py-3 px-4 text-[#01295B] font-medium">{candidate.candidate_name}</td>
                    <td className="py-3 px-4 text-[#01295B]">{candidate.job_role_title}</td>
                    <td className={`py-3 px-4 font-medium ${getScoreColor(candidate.ats_score)}`}>
                      {candidate.ats_score}%
                    </td>
                    <td className="py-3 px-4">
                      <a 
                        href={`/recruiter/feedback/${candidate.id}`}
                        className="text-[#01295B] hover:underline hover:font-semibold"
                      >
                        View Feedback
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleSelect(candidate.id)}
                          className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                            candidate.status === 'selected'
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Select
                        </button>
                        <button
                          onClick={() => handleReject(candidate.id)}
                          className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                            candidate.status === 'rejected'
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
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
      </div>
    </div>
  );
};

export default ManageCandidates; 