import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import HiringManagerNavbar from '../../components/HiringManagerNavbar';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

function FinalListing() {
  const { token } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [recruiters, setRecruiters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sorting, setSorting] = useState({
    field: null,
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

  const handleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIndicator = ({ column }) => {
    if (sorting.field !== column) {
      return <span className="ml-1 text-gray-400">↕</span>;
    }
    return <span className="ml-1">{sorting.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const shortlistedCandidates = useMemo(() => {
    // Always sort by ats_score descending by default
    const filtered = candidates.filter(c => c.status === 'shortlisted');
    if (!sorting.field || sorting.field === 'ats_score') {
      return [...filtered].sort((a, b) => parseFloat(b.ats_score) - parseFloat(a.ats_score));
    }
    return filtered;
  }, [candidates, sorting.field]);

  const sortedCandidates = useMemo(() => {
    if (!sorting.field || sorting.field === 'ats_score') return shortlistedCandidates;
    return [...shortlistedCandidates].sort((a, b) => {
      let aValue = a[sorting.field];
      let bValue = b[sorting.field];
      if (sorting.field === 'ats_score') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      if (aValue < bValue) return sorting.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sorting.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [shortlistedCandidates, sorting]);

  if (loading) return <div className="min-h-screen bg-[#001F3F]"><HiringManagerNavbar /><div className="px-36 py-6 text-white">Loading...</div></div>;
  if (error) return <div className="min-h-screen bg-[#001F3F]"><HiringManagerNavbar /><div className="px-36 py-6 text-red-500">{error}</div></div>;

  return (
    <div className="min-h-screen bg-[#001F3F]">
      <HiringManagerNavbar />
      <main className="px-36 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Shortlisted Candidates</h1>
        <div className="bg-gray-300/80 rounded-lg p-6 mb-8">
          <div className="bg-gray-100/90 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-3 px-4 text-[#008B8B] font-medium cursor-pointer hover:text-[#006d6d]" onClick={() => handleSort('candidate_name')}>Name <SortIndicator column="candidate_name" /></th>
                  <th className="text-left py-3 px-4 text-[#008B8B] font-medium cursor-pointer hover:text-[#006d6d]" onClick={() => handleSort('job_role_title')}>Role Applied for <SortIndicator column="job_role_title" /></th>
                  <th className="text-left py-3 px-4 text-[#008B8B] font-medium">Score</th>
                  <th className="text-left py-3 px-4 text-[#008B8B] font-medium cursor-pointer hover:text-[#006d6d]" onClick={() => handleSort('recruiter_id')}>Recruiter <SortIndicator column="recruiter_id" /></th>
                  <th className="text-left py-3 px-4 text-[#008B8B] font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-[#008B8B] font-medium">View Feedback</th>
                </tr>
              </thead>
              <tbody>
                {sortedCandidates.map((candidate, index) => (
                  <tr key={candidate.id || candidate._id} className="border-b border-gray-300 hover:bg-gray-200/50 transition-colors">
                    <td className="py-3 px-4 text-[#01295B] font-semibold">{candidate.candidate_name}</td>
                    <td className="py-3 px-4 text-[#01295B]">{candidate.job_role_title}</td>
                    <td className="py-3 px-4 text-[#01295B]">{candidate.ats_score}</td>
                    <td className="py-3 px-4 text-[#01295B]">{recruiters[candidate.recruiter_id] || candidate.recruiter_id}</td>
                    <td className="py-3 px-4"><span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-200 text-blue-800">{candidate.status}</span></td>
                    <td className="py-3 px-4">
                      <Link to={`/hiring-manager/feedback/${candidate.id || candidate._id}`} className="text-[#01295B] hover:underline hover:font-semibold">View Feedback</Link>
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

export default FinalListing; 