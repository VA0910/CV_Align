import React, { useState, useMemo, useEffect } from 'react';
import DashboardNavbar from '../../components/AdminNavbar';
import CVFilters from '../../components/CVFilters';
import { useAuth } from '../../contexts/AuthContext';

const ManageCVs = () => {
  const { token } = useAuth();
  const [cvData, setCvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    recruiter: '',
    fileName: '',
    scoreRange: '',
    status: ''
  });

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  useEffect(() => {
    const fetchCVs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/candidates/company', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const text = await res.text();
        console.log('Response:', text);
        if (!res.ok) throw new Error(text);
        const data = JSON.parse(text);
        setCvData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCVs();
  }, [token]);

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
      // TODO: Add API call to delete CV
      // For now, just update the UI
      setCvData(prevData => prevData.filter(cv => cv._id !== id && cv.id !== id));
    } catch (error) {
      console.error('Error deleting CV:', error);
    }
  };

  const handleViewFeedback = (id) => {
    // Implement feedback viewing logic
    console.log('View feedback for CV:', id);
  };

  const filteredCVs = useMemo(() => {
    let filtered = cvData.filter(cv => {
      const recruiterMatch = cv.recruiter_id?.toLowerCase().includes(filters.recruiter.toLowerCase()) || !filters.recruiter;
      const fileNameMatch = cv.cv_url?.toLowerCase().includes(filters.fileName.toLowerCase()) || !filters.fileName;
      const scoreMatch = isScoreInRange(cv.ats_score || 0, filters.scoreRange);
      const statusMatch = cv.status === filters.status || !filters.status;
      return recruiterMatch && fileNameMatch && scoreMatch && statusMatch;
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
  }, [cvData, filters, sortConfig]);

  const columns = [
    { key: 'id', label: 'S.No.', sortable: true },
    { key: 'cv_url', label: 'CVs', sortable: true },
    { key: 'recruiter_id', label: 'Uploaded By', sortable: true },
    { key: 'ats_score', label: 'Score', sortable: true },
    { key: 'feedback', label: 'Generated Feedback', sortable: false },
    { key: 'actions', label: '', sortable: false }
  ];

  return (
    <div className="min-h-screen bg-[#001F3F]">
      <DashboardNavbar />
      <div className="px-36 py-6">
        <h1 className="text-4xl font-bold text-white mb-8">Manage CVs</h1>
        <div className="bg-gray-300/80 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#01295B] mb-4">Filters:</h2>
            <CVFilters onFilterChange={handleFilterChange} />
          </div>
          {loading ? (
            <div className="text-center py-8">Loading CVs...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
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
                {filteredCVs.map((cv, index) => (
                  <tr 
                    key={cv._id || cv.id}
                    className="border-b border-gray-300 hover:bg-gray-200/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-[#01295B]">{index + 1}</td>
                    <td className="py-3 px-4">
                      <a href={cv.cv_url} target="_blank" rel="noopener noreferrer" className="text-[#01295B] hover:underline font-medium">
                        {cv.cv_url?.split('/').pop() || 'CV'}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-[#01295B]">{cv.recruiter_id}</td>
                    <td className={`py-3 px-4 font-medium ${getScoreColor(cv.ats_score || 0)}`}>{cv.ats_score || 0}%</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewFeedback(cv.id || cv._id)}
                        className="text-[#008B8B] hover:underline"
                      >
                        View Feedback
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(cv._id || cv.id)}
                        className="px-4 py-1 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCVs;