import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HiringManagerNavbar from '../../components/HiringManagerNavbar';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ManageJobRoles = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [jobRoles, setJobRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    title: '',
    type: '',
    status: ''
  });

  const [sorting, setSorting] = useState({
    field: null,
    direction: 'asc'
  });

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];

  useEffect(() => {
    fetchJobRoles();
  }, []);

  const fetchJobRoles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/job-roles/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setJobRoles(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch job roles');
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

  const handleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job role?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/job-roles/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setJobRoles(prev => prev.filter(role => role.id !== id));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete job role');
    }
  };

  const SortIndicator = ({ column }) => {
    if (sorting.field !== column) {
      return <span className="ml-1 text-gray-400">↕</span>;
    }
    return <span className="ml-1">{sorting.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const filteredAndSortedRoles = useMemo(() => {
    let result = jobRoles.filter(role => {
      const titleMatch = role.title.toLowerCase().includes(filters.title.toLowerCase()) || !filters.title;
      const typeMatch = role.type === filters.type || !filters.type;
      const statusMatch = role.status === filters.status || !filters.status;

      return titleMatch && typeMatch && statusMatch;
    });

    if (sorting.field) {
      result.sort((a, b) => {
        let comparison = 0;
        if (a[sorting.field] < b[sorting.field]) comparison = -1;
        if (a[sorting.field] > b[sorting.field]) comparison = 1;
        return sorting.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [jobRoles, filters, sorting]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001F3F] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001F3F]">
      <HiringManagerNavbar />
      
      <div className="px-36 py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Job Roles</h1>
          <button
            onClick={() => navigate('/hiring-manager/manage/create-job-role')}
            className="px-6 py-2 bg-[#A2E8DD] text-[#001F3F] rounded-lg font-medium hover:bg-[#8CD3C7] transition-colors"
          >
            + CREATE NEW JOB
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-gray-300/80 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#01295B] mb-4">Filters:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-[#01295B] mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="w-full px-3 py-2 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#008B8B] focus:border-[#008B8B]"
                  placeholder="Search by title"
                  value={filters.title}
                  onChange={(e) => handleFilterChange('title', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-[#01295B] mb-1">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="w-full px-3 py-2 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#008B8B] focus:border-[#008B8B]"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">All Types</option>
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
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
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className="py-3 px-4 text-left text-[#008B8B] font-medium">S.No.</th>
                  <th 
                    className="py-3 px-4 text-left text-[#008B8B] font-medium cursor-pointer hover:text-[#006d6d]"
                    onClick={() => handleSort('title')}
                  >
                    Job Title <SortIndicator column="title" />
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-[#008B8B] font-medium cursor-pointer hover:text-[#006d6d]"
                    onClick={() => handleSort('type')}
                  >
                    Type <SortIndicator column="type" />
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-[#008B8B] font-medium cursor-pointer hover:text-[#006d6d]"
                    onClick={() => handleSort('applications')}
                  >
                    Applications <SortIndicator column="applications" />
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-[#008B8B] font-medium cursor-pointer hover:text-[#006d6d]"
                    onClick={() => handleSort('shortlisted')}
                  >
                    Shortlisted <SortIndicator column="shortlisted" />
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-[#008B8B] font-medium cursor-pointer hover:text-[#006d6d]"
                    onClick={() => handleSort('status')}
                  >
                    Status <SortIndicator column="status" />
                  </th>
                  <th className="py-3 px-4 text-left text-[#008B8B] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedRoles.map((role, index) => (
                  <tr 
                    key={role.id}
                    className="border-b border-gray-300 hover:bg-gray-200/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-[#01295B]">{index + 1}</td>
                    <td className="py-3 px-4 text-[#01295B] font-medium">{role.title}</td>
                    <td className="py-3 px-4 text-[#01295B]">{role.type}</td>
                    <td className="py-3 px-4 text-[#01295B]">{role.applications}</td>
                    <td className="py-3 px-4 text-[#01295B]">{role.shortlisted}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        role.status === 'Active'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {role.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigate(`/hiring-manager/manage/job-roles/${role.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => navigate(`/hiring-manager/manage/job-roles/${role.id}/edit`)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
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

export default ManageJobRoles; 