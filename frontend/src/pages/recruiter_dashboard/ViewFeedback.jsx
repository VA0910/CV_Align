import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecruiterNavbar from '../../components/RecruiterNavbar';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

function ViewFeedback() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('pending'); // 'pending', 'selected', 'rejected'

  useEffect(() => {
    if (candidateId) {
      fetchCandidateData();
    }
  }, [candidateId]);

  const fetchCandidateData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/candidates/${candidateId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCandidate(response.data);
      setStatus(response.data.status || 'pending');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch candidate data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async () => {
    try {
      // Update candidate status in database
      await axios.patch(`http://localhost:8000/candidates/${candidateId}/status`, {
        status: status === 'selected' ? 'pending' : 'selected'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setStatus(status === 'selected' ? 'pending' : 'selected');
    } catch (err) {
      setError('Failed to update candidate status');
    }
  };

  const handleReject = async () => {
    try {
      // Update candidate status in database
      await axios.patch(`http://localhost:8000/candidates/${candidateId}/status`, {
        status: status === 'rejected' ? 'pending' : 'rejected'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setStatus(status === 'rejected' ? 'pending' : 'rejected');
    } catch (err) {
      setError('Failed to update candidate status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001F3F]">
        <RecruiterNavbar />
        <main className="px-36 py-8">
          <div className="text-white text-center">Loading candidate data...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#001F3F]">
        <RecruiterNavbar />
        <main className="px-36 py-8">
          <div className="text-red-400 text-center">{error}</div>
        </main>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-[#001F3F]">
        <RecruiterNavbar />
        <main className="px-36 py-8">
          <div className="text-white text-center">Candidate not found</div>
        </main>
      </div>
    );
  }

  // Parse feedback and detailed feedback into arrays
  const feedbackPoints = candidate.feedback ? candidate.feedback.split('\n').filter(point => point.trim()) : [];
  const detailedFeedbackPoints = candidate.detailed_feedback ? candidate.detailed_feedback.split('\n').filter(point => point.trim()) : [];

  return (
    <div className="min-h-screen bg-[#001F3F]">
      <RecruiterNavbar />
      
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
              {status !== 'pending' && (
                <div className={`inline-block rounded-full px-4 py-2 text-sm font-bold uppercase ${
                  status === 'selected' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500' 
                    : 'bg-red-500/20 text-red-400 border border-red-500'
                }`}>
                  {status === 'selected' ? 'Selected' : 'Rejected'}
                </div>
              )}
            </div>

            {/* Basic Info Card */}
            <div className="bg-gray-200/70 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg text-[#007180] font-medium mb-1">Applied For:</h3>
                  <p className="text-[#01295B] font-roboto font-semibold">{candidate.job_role_title}</p>
                  
                  <h3 className="text-lg text-[#007180] font-medium mb-1 mt-4">Score:</h3>
                  <p className="text-[#01295B] font-roboto font-semibold">{candidate.ats_score}/100</p>
                </div>
                <div>
                  <h3 className="text-lg text-[#007180] font-medium mb-1">Education:</h3>
                  <p className="text-[#01295B] font-roboto font-semibold">
                    {candidate.degree} in {candidate.course}
                  </p>
                  
                  <h3 className="text-lg text-[#007180] font-medium mb-1 mt-4">CGPA:</h3>
                  <p className="text-[#01295B] font-roboto font-semibold">{candidate.cgpa}</p>
                </div>
              </div>
            </div>

            {/* Summary Points */}
            <div className="mb-8">
              {feedbackPoints.map((point, index) => (
                <p key={index} className="text-white mb-3 opacity-90">
                  {point}
                </p>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSelect}
                className={`px-12 py-3 rounded-lg font-bold text-lg uppercase transition-all duration-200 ${
                  status === 'selected'
                    ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {status === 'selected' ? 'Selected' : 'Select'}
              </button>
              <button
                onClick={handleReject}
                className={`px-12 py-3 rounded-lg font-bold text-lg uppercase transition-all duration-200 ${
                  status === 'rejected'
                    ? 'bg-red-500/20 text-red-400 border-2 border-red-500'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {status === 'rejected' ? 'Rejected' : 'Reject'}
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="col-span-7 py-3">
            {/* Strengths and Weaknesses */}
            <div className="bg-gray-200/70 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-2">
                <div className="pr-4">
                  <h2 className="text-2xl font-bold text-white mb-4">Strengths</h2>
                  <ul className="space-y-2">
                    {candidate.strengths && candidate.strengths.length > 0 ? (
                      candidate.strengths.map((strength, index) => (
                        <li key={index} className="text-[#01295B] font-roboto font-semibold">
                          {strength}
                        </li>
                      ))
                    ) : (
                      <li className="text-[#01295B] font-roboto font-semibold">No strengths identified</li>
                    )}
                  </ul>
                </div>
                <div className="pl-4 border-l border-gray-500">
                  <h2 className="text-2xl font-bold text-white mb-4">Weaknesses</h2>
                  <ul className="space-y-2">
                    {candidate.weaknesses && candidate.weaknesses.length > 0 ? (
                      candidate.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-[#01295B] font-roboto font-semibold">
                          {weakness}
                        </li>
                      ))
                    ) : (
                      <li className="text-[#01295B] font-roboto font-semibold">No weaknesses identified</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="bg-gray-200/70 h-[300px] rounded-lg p-6 overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Detailed Feedback</h2>
              {detailedFeedbackPoints.length > 0 ? (
                <div className="space-y-2">
                  {detailedFeedbackPoints.map((point, index) => (
                    <p key={index} className="text-[#01295B] font-roboto font-semibold leading-relaxed">
                      {point}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-[#01295B] font-roboto font-semibold leading-relaxed">
                  {candidate.detailed_feedback || 'No detailed feedback available'}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ViewFeedback; 