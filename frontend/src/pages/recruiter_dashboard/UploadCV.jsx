import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterNavbar from '../../components/RecruiterNavbar';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

function UploadCV() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [jobRoles, setJobRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!allowedTypes.includes(droppedFile.type)) {
        setError('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
        return;
      }
      
      setFile(droppedFile);
      setError('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !jobRole) {
      setError('Please select both a job role and a CV file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Get job description for the selected role
      const jobRoleData = jobRoles.find(role => role._id === jobRole);
      if (!jobRoleData) {
        throw new Error('Selected job role not found');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('job_role_id', jobRole);
      formData.append('job_description', jobRoleData.description);

      // Upload CV
      const response = await axios.post('http://localhost:8000/candidates/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted);
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      if (response.status === 200) {
        // Navigate back to dashboard on success
        navigate('/recruiter/dashboard');
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      let errorMessage = 'Failed to upload CV';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = err.response.data?.detail || err.response.data?.message || errorMessage;
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#001F3F]">
      <RecruiterNavbar />
      
      <main className="px-36 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Upload CV</h1>
          
          <form onSubmit={handleSubmit} className="bg-gray-300/80 rounded-lg p-8">
            <div className="mb-6">
              <label htmlFor="jobRole" className="block text-[#01295B] font-medium mb-2">
                Job Role
              </label>
              <select
                id="jobRole"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#008B8B] bg-white"
                required
                disabled={loading || uploading}
              >
                <option value="">Select a job role</option>
                {jobRoles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.title}
                  </option>
                ))}
              </select>
              {loading && (
                <p className="mt-2 text-sm text-gray-600">Loading job roles...</p>
              )}
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div 
              className={`relative border-2 border-dashed rounded-lg p-8 text-center mb-6
                ${dragActive ? 'border-[#008B8B] bg-[#008B8B]/10' : 'border-gray-400'}
                ${file ? 'bg-green-50' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="cv-upload"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx"
                disabled={uploading}
              />
              
              {file ? (
                <div className="text-[#01295B]">
                  <p className="font-medium">Selected file:</p>
                  <p>{file.name}</p>
                </div>
              ) : (
                <>
                  <label
                    htmlFor="cv-upload"
                    className="block text-[#01295B] cursor-pointer"
                  >
                    <p className="font-medium mb-2">
                      Drag and drop your CV here or click to browse
                    </p>
                    <p className="text-sm text-gray-600">
                      Supported formats: PDF, DOC, DOCX
                    </p>
                  </label>
                </>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/recruiter/dashboard')}
                className="mr-4 px-6 py-2 rounded-lg text-[#01295B] font-medium hover:bg-gray-400/50 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#008B8B] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#007a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || uploading || !jobRole || !file}
              >
                {uploading ? 'Uploading...' : 'Upload CV'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default UploadCV; 