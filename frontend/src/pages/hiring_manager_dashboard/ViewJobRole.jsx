import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import HiringManagerNavbar from '../../components/HiringManagerNavbar';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ViewJobRole = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [jobRole, setJobRole] = useState({
    title: '',
    description: '',
    type: '',
    department: '',
    location: '',
    education: '',
    skills: '',
    experience: '',
    deadline: '',
    requirements: '',
    applications_count: 0,
    shortlisted_count: 0,
    status: ''
  });

  useEffect(() => {
    fetchJobRole();
  }, [id]);

  const fetchJobRole = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/job-roles/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setJobRole(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch job role details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job role?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/job-roles/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      navigate('/hiring-manager/manage/job-roles');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete job role');
    }
  };

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
      
      <div className="px-36 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/hiring-manager/manage/job-roles" className="text-white hover:text-gray-300 transition">
            <i className="fas fa-arrow-left text-2xl"></i>
          </Link>
          <h1 className="text-4xl font-bold text-white">Job Role</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-[#F4FFF9]/30 rounded-2xl p-12">
          <div className="space-y-6">
            <div>
              <h2 className="text-[#A2E8DD] text-lg mb-2">Job Title</h2>
              <div className="w-full bg-[#F4FFF9]/56 rounded-lg px-4 py-3 text-[#01295B] font-semibold">
                {jobRole.title}
              </div>
            </div>

            <div>
              <h2 className="text-[#A2E8DD] text-lg mb-2">Job Description</h2>
              <div className="w-full h-[125px] bg-[#F4FFF9]/56 rounded-lg px-4 py-3 text-[#01295B] font-semibold">
                {jobRole.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-[#A2E8DD] text-lg mb-2">Job Type</h2>
                <div className="w-full bg-[#F4FFF9]/56 rounded-lg px-4 py-3 text-[#01295B] font-semibold">
                  {jobRole.type}
                </div>
              </div>
              <div>
                <h2 className="text-[#A2E8DD] text-lg mb-2">Location</h2>
                <div className="w-full bg-[#F4FFF9]/56 rounded-lg px-4 py-3 text-[#01295B] font-semibold">
                  {jobRole.location}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-[#A2E8DD] text-lg mb-2">Department</h2>
                <div className="w-full bg-[#F4FFF9]/56 rounded-lg px-4 py-3 text-[#01295B] font-semibold">
                  {jobRole.department}
                </div>
              </div>
              <div>
                <h2 className="text-[#A2E8DD] text-lg mb-2">Education</h2>
                <div className="w-full bg-[#F4FFF9]/56 rounded-lg px-4 py-3 text-[#01295B] font-semibold">
                  {jobRole.education}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-[#A2E8DD] text-lg mb-2">Skills Required</h2>
              <div className="w-full bg-[#F4FFF9]/56 rounded-lg px-4 py-3 text-[#01295B] font-semibold">
                {jobRole.skills}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-[#A2E8DD] text-lg mb-2">Experience level</h2>
                <div className="w-full bg-[#F4FFF9]/56 rounded-lg px-4 py-3 text-[#01295B] font-semibold">
                  {jobRole.experience}
                </div>
              </div>
              <div>
                <h2 className="text-[#A2E8DD] text-lg mb-2">Application Deadline</h2>
                <div className="w-full bg-[#F4FFF9]/56 rounded-lg px-4 py-3 text-[#01295B] font-semibold">
                  {jobRole.deadline}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-[#A2E8DD] text-lg mb-2">Any specific requirements (optional|Hidden)</h2>
              <div className="w-full h-[100px] bg-[#F4FFF9]/56 rounded-lg px-4 py-3 text-[#01295B] font-semibold">
                {jobRole.requirements}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-[#A2E8DD] text-lg mb-2">Applications</h2>
                <div className="w-full bg-[#F4FFF9]/56 rounded-lg px-4 py-3 text-[#01295B] font-semibold">
                  {jobRole.applications_count}
                </div>
              </div>
              <div>
                <h2 className="text-[#A2E8DD] text-lg mb-2">Shortlisted</h2>
                <div className="w-full bg-[#F4FFF9]/56 rounded-lg px-4 py-3 text-[#01295B] font-semibold">
                  {jobRole.shortlisted_count}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => navigate(`/hiring-manager/manage/job-roles/${id}/edit`)}
                className="px-8 py-3 bg-[#A2E8DD] text-[#001F3F] rounded-lg font-medium text-lg hover:bg-[#8CD3C7] transition-colors"
              >
                Modify
              </button>
              <button
                onClick={handleDelete}
                className="px-8 py-3 bg-red-500 text-white rounded-lg font-medium text-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewJobRole; 