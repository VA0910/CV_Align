import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DisabledPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#001F3F]">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Account Disabled</h1>
        <p className="text-lg mb-8">
          Your account has been disabled by an administrator. Please contact support for assistance.
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default DisabledPage; 