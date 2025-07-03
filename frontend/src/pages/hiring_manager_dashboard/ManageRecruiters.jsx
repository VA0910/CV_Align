import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import React, { useState, useMemo, useEffect } from 'react';
import HiringManagerNavbar from '../../components/HiringManagerNavbar';


const ManageRecruiters = () => {
  const { token } = useAuth();
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecruiters = async () => {
      try {
        const response = await axios.get('http://localhost:8000/users/recruiters/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setRecruiters(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch recruiters');
        setRecruiters([]); // Ensure recruiters is always an array
      } finally {
        setLoading(false);
      }
    };
    fetchRecruiters();
  }, [token]);

  const [filters, setFilters] = useState({
    name: '',
    status: 'All Status'
  });

  const [sorting, setSorting] = useState({
    field: null,
    direction: 'asc'
  });

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

  const handleDeleteRecruiter = async (recruiterId) => {
    if (window.confirm('Are you sure you want to delete this recruiter? This action cannot be undone.')) {
        try {
            await axios.delete(`http://localhost:8000/users/recruiters/${recruiterId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Refresh the list after deletion
            setRecruiters(prev => prev.filter(r => (r.id || r._id) !== recruiterId));
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to delete recruiter');
        }
    }
  };

  const handleStatusToggle = (id) => {
    setRecruiters(prev =>
      prev.map(recruiter =>
        recruiter.id === id
          ? { ...recruiter, status: recruiter.status === 'Active' ? 'Inactive' : 'Active' }
          : recruiter
      )
    );
  };

  const SortIndicator = ({ column }) => {
    if (sorting.field !== column) {
      return <span className="ml-1 text-gray-400">↕</span>;
    }
    return <span className="ml-1">{sorting.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const filteredAndSortedRecruiters = useMemo(() => {
    if (!Array.isArray(recruiters)) return [];
    let result = recruiters.filter(recruiter => {
      const nameMatch = recruiter.full_name?.toLowerCase().includes(filters.name.toLowerCase()) || !filters.name;
      const statusMatch = filters.status === 'All Status' || (filters.status === 'Active' && recruiter.is_active) || (filters.status === 'Inactive' && !recruiter.is_active);
      return nameMatch && statusMatch;
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
  }, [recruiters, filters, sorting]);

  return (
    <div className="min-h-screen bg-[#001F3F]">
      <HiringManagerNavbar />
      
      <div className="px-36 py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Manage Recruiters</h1>
        </div>

        {/* Combined Section */}
        <div className="bg-gray-300/80 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#01295B] mb-4">Filters:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                />
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
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className="py-3 px-4 text-left text-[#008B8B] font-medium">S.No</th>
                  <th 
                    className="py-3 px-4 text-left text-[#008B8B] font-medium cursor-pointer hover:text-[#006d6d]"
                    onClick={() => handleSort('name')}
                  >
                    Name <SortIndicator column="full_name" />
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-[#008B8B] font-medium cursor-pointer hover:text-[#006d6d]"
                    onClick={() => handleSort('email')}
                  >
                    Email <SortIndicator column="email" />
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-[#008B8B] font-medium cursor-pointer hover:text-[#006d6d]"
                    onClick={() => handleSort('uploaded_cvs')}
                  >
                    Uploaded CVs <SortIndicator column="uploaded_cvs" />
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-[#008B8B] font-medium cursor-pointer hover:text-[#006d6d]"
                    onClick={() => handleSort('selected_candidates')}
                  >
                    Selected <SortIndicator column="selected_candidates'" />
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-[#008B8B] font-medium cursor-pointer hover:text-[#006d6d]"
                    onClick={() => handleSort('accuracy')}
                  >
                    Accuracy <SortIndicator column="accuracy" />
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-[#008B8B] font-medium cursor-pointer hover:text-[#006d6d]"
                    onClick={() => handleSort('is_active')}
                  >
                    Status <SortIndicator column="is_active" />
                  </th>
                  <th className="py-3 px-4 text-left text-[#008B8B] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedRecruiters.map((recruiter, index) => (
                  <tr 
                    key={recruiter.id || recruiter._id}
                    className="border-b border-gray-300 hover:bg-gray-200/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-[#01295B]">{index + 1}</td>
                    <td className="py-3 px-4 text-[#01295B] font-medium">{recruiter.full_name}</td>
                    <td className="py-3 px-4 text-[#01295B]">{recruiter.email}</td>
                    <td className="py-3 px-4 text-[#01295B]">{recruiter.uploaded_cvs}</td>
                    <td className="py-3 px-4 text-[#01295B]">{recruiter.selected_candidates}</td>
                    <td className="py-3 px-4 text-[#01295B]">{recruiter.accuracy}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        recruiter.is_active 
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {recruiter.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteRecruiter(recruiter.id || recruiter._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
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

export default ManageRecruiters; 