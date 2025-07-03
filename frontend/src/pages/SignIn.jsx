import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyCode: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(formData.email, formData.password);
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'hiring_manager':
          navigate('/hiring-manager/dashboard');
          break;
        case 'recruiter':
          navigate('/recruiter/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-[#000B18] to-[#001F3F] overflow-hidden">
      {/* Left Section */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-[420px] h-[420px] bg-[#BFC8C8] rounded-[30px]" />
      </div>

      {/* Right Section */}
      <div className="w-1/2 flex flex-col justify-center px-28 relative h-full py-8">
        {/* Logo and Square */}
        <div 
        className="cursor-pointer" 
        onClick={() => navigate('/')}>
          <div className="px-36 absolute top-6 right-8 flex items-center gap-2">
            <div className="w-10 h-10 bg-[#A2E8DD] rounded-lg flex items-center justify-center">
              <span className="text-[#001F3F] font-bold text-xl">CV</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="w-full max-w-[460px]">
          <h1 className="text-[#A2E8DD] text-4xl font-bold mb-6">Welcome!</h1>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[#A2E8DD] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-[45px] bg-transparent border-2 border-[#ffffff] rounded-[15px] py-2 px-6 text-white focus:outline-none focus:border-[#7FFFD4]"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[#A2E8DD] mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full h-[45px] bg-transparent border-2 border-[#ffffff] rounded-[15px] py-2 px-6 text-white focus:outline-none focus:border-[#7FFFD4]"
                required
              />
            </div>
            <div>
              <label htmlFor="companyCode" className="block text-[#A2E8DD] mb-2">
                Company Code
              </label>
              <input
                type="text"
                id="companyCode"
                name="companyCode"
                value={formData.companyCode}
                onChange={handleChange}
                className="w-full h-[45px] bg-transparent border-2 border-[#ffffff] rounded-[15px] py-2 px-6 text-white focus:outline-none focus:border-[#7FFFD4]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full h-[50px] bg-[#A2E8DD] text-[#001F3F] font-semibold text-lg rounded-[15px] hover:bg-opacity-90 transition-all mt-4"
            >
              Sign In
            </button>
            <div className="text-center mt-4">
              <span className="text-[#A2E8DD]">Don't have an account? </span>
              <Link to="/signup" className="text-[#7FFFD4] hover:underline">
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
