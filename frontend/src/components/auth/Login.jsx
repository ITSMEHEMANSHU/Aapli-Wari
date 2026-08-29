import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaArrowRight, 
  FaSpinner 
} from 'react-icons/fa';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-18 flex items-center justify-center bg-[#FBF5EC] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-[#E8D9C3]">
        
        {/* Left Side Hero */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#3D2518] to-[#2B1810] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#DD6B35]/20 rounded-full blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#E8A15C]/10 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-[#DD6B35]/20 border border-[#DD6B35]/30 text-[#E8A15C] rounded-full text-xs font-semibold uppercase tracking-widest mb-4">
              Welcome Back
            </span>
            <h1 className="text-3xl sm:text-4xl  font-bold tracking-tight leading-tight mb-3 text-white">
              Live the legacy.
            </h1>
            <p className="text-white/70 text-sm leading-relaxed">
              Reconnect with the Wari community, follow your journeys, and access your sacred space.
            </p>
          </div>

          <div className="relative z-10 mt-8 md:mt-0 pt-6 border-t border-white/10">
            <p className="text-xs text-white/60">
              New to the community?
            </p>
            <Link 
              to="/register" 
              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#E8A15C] hover:text-white transition group"
            >
              Create an account
              <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="md:w-7/12 p-6 sm:p-10 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl  font-bold text-[#2B1B12]">Sign In</h2>
            <p className="text-xs text-[#4A392E]/65 mt-1">Enter your credentials to access your account.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#2B1B12] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-3.5 text-[#4A392E]/40 text-sm" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-[#4A392E]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-[#2B1B12] uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-[#DD6B35] font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-3.5 text-[#4A392E]/40 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-[#4A392E]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-[#4A392E]/40 hover:text-[#2B1B12] focus:outline-none text-sm"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#DD6B35] hover:bg-[#C85A28] text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-[#DD6B35]/20 focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin text-base" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FaArrowRight className="text-xs" />
                </>
              )}
            </button>
          </form>

          {/* Mobile Register Link */}
          <p className="text-center mt-6 text-xs text-[#4A392E]/65 md:hidden">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#DD6B35] font-bold hover:underline">
              Register
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;