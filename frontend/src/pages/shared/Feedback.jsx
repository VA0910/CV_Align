import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import RecruiterNavbar from '../../components/RecruiterNavbar';
import HiringManagerNavbar from '../../components/HiringManagerNavbar';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Feedback = () => {
  const { candidateId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [candidate, setCandidate] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Determine which navbar to show based on the current path
  const getNavbar = () => {
    if (location.pathname.includes('/admin')) {
      return <AdminNavbar />;
    } else if (location.pathname.includes('/recruiter')) {
      return <RecruiterNavbar />;
    } else if (location.pathname.includes('/hiring-manager')) {
      return <HiringManagerNavbar />;
    }
    return null;
  };

  useEffect(() => {
    fetchCandidateData();
  }, [candidateId, token]);

  const fetchCandidateData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/candidates/${candidateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCandidate(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch candidate data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-700';
    if (score >= 70) return 'text-blue-700';
    if (score >= 50) return 'text-yellow-700';
    return 'text-red-700';
  };

  const handleSelect = async () => {
    if (candidate.status === 'selected') return;
    setUpdating(true);
    try {
      const response = await axios.patch(
        `http://localhost:8000/${candidateId}/status`,
        { status: 'selected' },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setCandidate(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update candidate status');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (candidate.status === 'rejected') return;
    setUpdating(true);
    try {
      const response = await axios.patch(
        `http://localhost:8000/${candidateId}/status`,
        { status: 'rejected' },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setCandidate(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update candidate status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001F3F]">
        {getNavbar()}
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A2E8DD]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#001F3F]">
        {getNavbar()}
        <div className="px-36 py-8">
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-[#001F3F]">
        {getNavbar()}
        <div className="px-36 py-8">
          <div className="text-white text-center">Candidate not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001F3F]">
      {getNavbar()}
      
      <main className="px-36 py-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left Section */}
          <div className="col-span-5">
            {/* Candidate Name and Status */}
            <div className="flex items-center gap-4 mb-8">
              <h1 className="text-4xl font-bold text-white">
                {candidate.candidate_name}
              </h1>
              <div className={`inline-block rounded-full px-4 py-2 text-sm font-bold uppercase ${
                candidate.status === 'selected' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500' 
                  : candidate.status === 'rejected'
                  ? 'bg-red-500/20 text-red-400 border border-red-500'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
              }`}>
                {candidate.status}
              </div>
            </div>

            {/* Basic Info Card */}
            <div className="bg-gray-200/70 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg text-[#007180] font-medium mb-1">Applied For:</h3>
                  <p className="text-[#01295B] font-roboto font-semibold">{candidate.job_role_title}</p>
                  
                  <h3 className="text-lg text-[#007180] font-medium mb-1 mt-4">Education:</h3>
                  <p className="text-[#01295B] font-roboto font-semibold">
                    {candidate.degree} in {candidate.course}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg text-[#007180] font-medium mb-1">Score:</h3>
                  <p className={`text-[#01295B] font-roboto font-semibold ${getScoreColor(candidate.ats_score)}`}>
                    {candidate.ats_score}%
                  </p>
                  
                  <h3 className="text-lg text-[#007180] font-medium mb-1 mt-4">CGPA:</h3>
                  <p className="text-[#01295B] font-roboto font-semibold">{candidate.cgpa}</p>
                </div>
              </div>
            </div>

            {/* Feedback Summary */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Feedback Summary</h2>
              <p className="text-white opacity-90">
                {candidate.feedback}
              </p>
            </div>

            {/* Action Buttons */}
            {(location.pathname.includes('/recruiter') || location.pathname.includes('/hiring-manager')) && (
              <div className="flex gap-4">
                <button
                  onClick={handleSelect}
                  disabled={updating || candidate.status === 'selected'}
                  className={`px-12 py-3 rounded-lg font-bold text-lg uppercase transition-all duration-200 ${
                    candidate.status === 'selected'
                      ? 'bg-green-500/20 text-green-400 border-2 border-green-500 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {updating ? 'Updating...' : candidate.status === 'selected' ? 'Selected' : 'Select'}
                </button>
                <button
                  onClick={handleReject}
                  disabled={updating || candidate.status === 'rejected'}
                  className={`px-12 py-3 rounded-lg font-bold text-lg uppercase transition-all duration-200 ${
                    candidate.status === 'rejected'
                      ? 'bg-red-500/20 text-red-400 border-2 border-red-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {updating ? 'Updating...' : candidate.status === 'rejected' ? 'Rejected' : 'Reject'}
                </button>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="col-span-7 py-3">
            {/* Strengths and Weaknesses */}
            <div className="bg-gray-200/70 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-2">
                <div className="pr-4">
                  <h2 className="text-2xl font-bold text-white mb-4">Strengths</h2>
                  <ul className="space-y-2">
                    {candidate.strengths.map((strength, index) => (
                      <li key={index} className="text-[#01295B] font-roboto font-semibold">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pl-4 border-l border-gray-500">
                  <h2 className="text-2xl font-bold text-white mb-4">Weaknesses</h2>
                  <ul className="space-y-2">
                    {candidate.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-[#01295B] font-roboto font-semibold">
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="bg-gray-200/70 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Detailed Feedback</h2>
              <p className="text-[#01295B] font-roboto font-semibold leading-relaxed">
                {candidate.detailed_feedback}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feedback; 