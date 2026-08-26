import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';

export const OTPVerification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <FaEnvelope className="text-4xl text-primary mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-primary">Verify Your Email</h2>
          <p className="text-gray-600">We sent a 6-digit code to your email (static demo)</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              className="w-full px-4 py-3 border rounded text-center text-2xl tracking-widest focus:outline-none focus:border-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded hover:bg-red-800 transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Didn't receive code? <button className="text-primary font-bold">Resend</button>
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;