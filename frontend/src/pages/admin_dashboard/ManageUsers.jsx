import { useState, useMemo, useEffect } from 'react';
import UserFilters from '../../components/UserFilters';
import DashboardNavbar from '../../components/AdminNavbar';
import { useAuth } from '../../contexts/AuthContext';

function ManageUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    name: '',
    company: '',
    role: '',
    status: ''
  });

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:8000/users/all/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Sort handler
  const handleSort = (key) => {
    setSortConfig(prevSort => ({
      key,
      direction: 
        prevSort.key === key && prevSort.direction === 'asc'
          ? 'desc'
          : 'asc'
    }));
  };

  // Sort indicator component
  const SortIndicator = ({ column }) => {
    if (sortConfig.key !== column) {
      return (
        <span className="ml-1 text-gray-400">↕</span>
      );
    }
    return (
      <span className="ml-1">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const nameMatch = user.full_name?.toLowerCase().includes(filters.name.toLowerCase()) || !filters.name;
      const companyMatch = user.company_code?.toLowerCase().includes(filters.company.toLowerCase()) || !filters.company;
      const roleMatch = user.role === filters.role || !filters.role;
      const statusMatch = 
        (filters.status === 'enabled' && user.is_active) ||
        (filters.status === 'disabled' && !user.is_active) ||
        !filters.status;

      return nameMatch && companyMatch && roleMatch && statusMatch;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle special cases
        if (sortConfig.key === 'is_active') {
          return sortConfig.direction === 'asc'
            ? Number(a.is_active) - Number(b.is_active)
            : Number(b.is_active) - Number(a.is_active);
        }

        // Convert to lowercase for string comparison
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
  }, [users, filters, sortConfig]);

  const handleToggleStatus = async (userId) => {
    try {
      const res = await fetch(`http://localhost:8000/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      const data = await res.json();
      
      setUsers(prevUsers =>
        prevUsers.map(user => {
          const currentId = user.id || user._id;
          if (currentId === userId) {
            return { ...user, is_active: data.is_active };
          }
          return user;
        })
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // Column configuration
  const columns = [
    { key: 'id', label: 'S.No.', sortable: true },
    { key: 'full_name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email Address', sortable: true },
    { key: 'company_code', label: 'Company', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'apiCalls', label: 'API calls', sortable: false },
    { key: 'is_active', label: 'Enable/Disable', sortable: true }
  ];

  return (
    <div className="min-h-screen bg-[#001F3F]">
      <DashboardNavbar />
      
      <div className="px-36 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Manage Users</h1>

        <div className="bg-gray-300/80 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#01295B] mb-4">Filters:</h2>
            <UserFilters onFilterChange={handleFilterChange} />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading users...</div>
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
                {filteredUsers.map((user, index) => (
                  <tr 
                    key={user.id || user._id}
                    className="border-b border-gray-300 hover:bg-gray-200/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-[#01295B]">{index + 1}</td>
                    <td className="py-3 px-4 text-[#01295B] font-medium">{user.full_name}</td>
                    <td className="py-3 px-4 text-[#01295B]">{user.email}</td>
                    <td className="py-3 px-4 text-[#01295B]">{user.company_code}</td>
                    <td className="py-3 px-4 text-[#01295B]">{user.role}</td>
                    <td className="py-3 px-4 text-[#01295B]">{user.apiCalls || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(user.id || user._id)}
                        className={`px-3 py-1 text-sm rounded-full ${
                          user.is_active 
                            ? 'bg-green-200 text-green-800 hover:bg-green-300'
                            : 'bg-red-200 text-red-800 hover:bg-red-300'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
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
}

export default ManageUsers; 