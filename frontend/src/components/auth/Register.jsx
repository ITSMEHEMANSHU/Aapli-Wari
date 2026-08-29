import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaUserTag, 
  FaEye, 
  FaEyeSlash, 
  FaArrowRight, 
  FaSpinner,
  FaArrowLeft
} from 'react-icons/fa';

export const Register = () => {
  const { register, registerPalkhiPramukh } = useAuth();
  const navigate = useNavigate();
  
  // Step management
  const [step, setStep] = useState(1); // 1 = Account Info, 2 = Palkhi Info
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });

  const [palkhiData, setPalkhiData] = useState({
    name: '',
    description: ''
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    api.roles()
      .then(setRoles)
      .catch((requestError) => setError(requestError.message));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handlePalkhiChange = (e) => {
    setPalkhiData({ ...palkhiData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // Step 1: Account Registration
  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // If role is Palkhi Pramukh → Go to Step 2
    if (formData.role === 'palkhi_pramukh') {
      setStep(2);
      setLoading(false);
      return;
    }

    // For other roles → Register directly
    try {
      await register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      navigate('/');
    } catch (requestError) {
      setError(requestError.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Palkhi Registration
  const handlePalkhiSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!palkhiData.name.trim()) {
      setError('Palkhi name is required');
      setLoading(false);
      return;
    }

    try {
      await registerPalkhiPramukh({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        palkhi_name: palkhiData.name,
        palkhi_description: palkhiData.description || null,
      });

      navigate('/channels');
    } catch (requestError) {
      setError(requestError.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Go back to step 1
  const goBack = () => {
    setStep(1);
    setError('');
  };

  const isPalkhiPramukh = formData.role === 'palkhi_pramukh';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF5EC] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-[#E8D9C3]">
        
        {/* Left Side Hero - Stays Same for Both Steps */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#3D2518] to-[#2B1810] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#DD6B35]/20 rounded-full blur-2xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#E8A15C]/10 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-[#DD6B35]/20 border border-[#DD6B35]/30 text-[#E8A15C] rounded-full text-xs font-semibold uppercase tracking-widest mb-4">
              {step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight leading-tight mb-3 text-white">
              {step === 1 ? 'Walk the path.' : 'Register Your Palkhi'}
            </h1>
            <p className="text-white/70 text-sm leading-relaxed">
              {step === 1 
                ? 'Become part of the living heritage of Pandharpur Wari.' 
                : 'As a Palkhi Pramukh, register your Palkhi to create a channel and share Wari heritage.'}
            </p>
          </div>

          <div className="relative z-10 mt-8 md:mt-0 pt-6 border-t border-white/10">
            <p className="text-xs text-white/60">
              {step === 1 ? 'Already part of the journey?' : 'Need to go back?'}
            </p>
            {step === 1 ? (
              <Link 
                to="/login" 
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#E8A15C] hover:text-white transition group"
              >
                Sign in to your account
                <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <button 
                onClick={goBack}
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#E8A15C] hover:text-white transition group"
              >
                <FaArrowLeft className="text-xs" />
                Back to account details
              </button>
            )}
          </div>
        </div>

        {/* Right Side Form */}
        <div className="md:w-7/12 p-6 sm:p-10 flex flex-col justify-center">
          
          {/* Step 1: Account Registration */}
          {step === 1 && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-serif font-bold text-[#2B1B12]">Create an Account</h2>
                <p className="text-xs text-[#4A392E]/65 mt-1">Fill in your details below to get started.</p>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg text-sm mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleAccountSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-semibold text-[#2B1B12] uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-3.5 text-[#4A392E]/40 text-sm" />
                    <input
                      type="text"
                      name="full_name"
                      placeholder="Enter your name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-[#4A392E]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1B12] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-3.5 text-[#4A392E]/40 text-sm" />
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-[#4A392E]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#2B1B12] uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3.5 top-3.5 text-[#4A392E]/40 text-sm" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={handleChange}
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

                  <div>
                    <label className="block text-xs font-semibold text-[#2B1B12] uppercase tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3.5 top-3.5 text-[#4A392E]/40 text-sm" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-[#4A392E]/40 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3.5 text-[#4A392E]/40 hover:text-[#2B1B12] focus:outline-none text-sm"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B1B12] uppercase tracking-wider mb-1">
                    Account Type
                  </label>
                  <div className="relative">
                    <FaUserTag className="absolute left-3.5 top-3.5 text-[#4A392E]/40 text-sm pointer-events-none" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>Select account type</option>
                      {roles.map((role) => (
                        <option key={role.id || role._id || role.name} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-3.5 pointer-events-none text-[#4A392E]/40 text-xs">
                      ▼
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-[#DD6B35] hover:bg-[#C85A28] text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-[#DD6B35]/20 focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin text-base" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>{isPalkhiPramukh ? 'Next Step' : 'Create Account'}</span>
                      <FaArrowRight className="text-xs" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Palkhi Registration */}
          {step === 2 && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-serif font-bold text-[#2B1B12]">Register Your Palkhi</h2>
                <p className="text-xs text-[#4A392E]/65 mt-1">
                  As a Palkhi Pramukh, register your Palkhi to create a channel.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg text-sm mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handlePalkhiSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#2B1B12] mb-1">
                    Palkhi Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., Sant Dnyaneshwar Palkhi"
                    value={palkhiData.name}
                    onChange={handlePalkhiChange}
                    className="w-full px-4 py-3 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-[#4A392E]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2B1B12] mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    placeholder="Tell us about your Palkhi, its history, significance..."
                    value={palkhiData.description}
                    onChange={handlePalkhiChange}
                    className="w-full px-4 py-3 text-sm bg-[#FBF5EC]/50 border border-[#E8D9C3] text-[#2B1B12] placeholder-[#4A392E]/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 focus:border-[#DD6B35] transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#DD6B35] hover:bg-[#C85A28] text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-[#DD6B35]/20 focus:outline-none focus:ring-2 focus:ring-[#DD6B35]/40 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <span>Register Palkhi</span>
                      <FaArrowRight className="text-xs" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <p className="text-center mt-6 text-xs text-[#4A392E]/65 md:hidden">
            {step === 1 ? (
              <>Already have an account? <Link to="/login" className="text-[#DD6B35] font-bold hover:underline">Log in</Link></>
            ) : (
              <button onClick={goBack} className="text-[#DD6B35] font-bold hover:underline">← Back</button>
            )}
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;