import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVerifyOTP, useResendOTP } from '../hooks/authhooks';
import treegarLogo from '/Images/treegarlogo.svg';

const OTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [otpData, setOtpData] = useState(null);
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  
  // React Query mutations
  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();

  // Load OTP data from sessionStorage on component mount
  useEffect(() => {
    const storedOtpData = sessionStorage.getItem('otpData');
    if (storedOtpData) {
      setOtpData(JSON.parse(storedOtpData));
    } else {
      // No OTP data found, redirect to login
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Calculate initial time left
  useEffect(() => {
    if (otpData?.expiresAt) {
      const updateTimeLeft = () => {
        const now = new Date().getTime();
        const expiry = new Date(otpData.expiresAt).getTime();
        const difference = expiry - now;
        
        if (difference > 0) {
          setTimeLeft(Math.floor(difference / 1000));
          setCanResend(false);
        } else {
          setTimeLeft(0);
          setCanResend(true);
        }
      };

      updateTimeLeft();
      const timer = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [otpData?.expiresAt]);

  // Format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && value) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      handleVerifyOTP(pastedData);
    }
  };

  // Verify OTP
  const handleVerifyOTP = (otpCode) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6 || !otpData?.twoFactorChallengeId) return;

    verifyOTPMutation.mutate(
      { 
        twoFactorChallengeId: otpData.twoFactorChallengeId, 
        code,
        emailAddress: otpData.userEmail
      },
      {
        onSuccess: (data) => {
          console.log('✅ OTP verification successful');
          // Clear OTP data from sessionStorage
          sessionStorage.removeItem('otpData');
          // Token and user data are already stored by the hook
          navigate('/dashboard', { replace: true });
        },
        onError: (error) => {
          console.error('❌ OTP verification error:', error);
          // Clear OTP on error
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        },
      }
    );
  };

  // Resend OTP
  const handleResendOTP = () => {
    if (!otpData?.userEmail || !otpData?.userPassword) return;

    resendOTPMutation.mutate(
      { 
        emailAddress: otpData.userEmail,
        password: otpData.userPassword
      },
      {
        onSuccess: (response) => {
          console.log('✅ OTP resent successfully');
          setCanResend(false);
          
          // Update OTP data with new challenge ID and expiry time
          if (response.data?.twoFactorChallengeId && response.data?.twoFactorExpiresAt) {
            const updatedOtpData = {
              ...otpData,
              twoFactorChallengeId: response.data.twoFactorChallengeId,
              expiresAt: response.data.twoFactorExpiresAt
            };
            setOtpData(updatedOtpData);
            sessionStorage.setItem('otpData', JSON.stringify(updatedOtpData));
          } else {
            // Default to 5 minutes if no expiry provided
            const newExpiryTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
            const updatedOtpData = {
              ...otpData,
              expiresAt: newExpiryTime
            };
            setOtpData(updatedOtpData);
            sessionStorage.setItem('otpData', JSON.stringify(updatedOtpData));
          }
        },
        onError: (error) => {
          console.error('❌ Resend OTP error:', error);
        },
      }
    );
  };

  // Handle back to login
  const handleBackToLogin = () => {
    // Clear OTP data and navigate back
    sessionStorage.removeItem('otpData');
    navigate('/login', { replace: true });
  };

  // Get error message
  const getErrorMessage = () => {
    const error = verifyOTPMutation.error || resendOTPMutation.error;
    if (!error) return '';
    
    if (error.response?.status === 400) {
      return 'Invalid or expired OTP code';
    }
    if (error.response?.status === 429) {
      return 'Too many attempts. Please try again later.';
    }
    if (error.response?.status >= 500) {
      return 'Server error. Please try again later.';
    }
    if (error.message === 'Network Error') {
      return 'Network error. Please check your connection.';
    }
    
    return error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
  };

  // Show loading if OTP data is not loaded yet
  if (!otpData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Logo */}
          <img
            src={treegarLogo}
            alt="Treegar Logo"
            className="mx-auto h-16 w-auto mb-4"
          />
          <h3 className="mt-2 text-center text-xl text-gray-900 font-semibold">
            Two-Factor Authentication
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit code to your {otpData.deliveryChannel?.toLowerCase()}: {otpData.userEmail}
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          {/* Success Message */}
          {resendOTPMutation.isSuccess && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              ✅ OTP code resent successfully!
            </div>
          )}

          {/* Error Message */}
          {(verifyOTPMutation.isError || resendOTPMutation.isError) && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {getErrorMessage()}
            </div>
          )}

          {/* OTP Input Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enter verification code
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={verifyOTPMutation.isPending}
                    className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-600">
                  Code expires in: <span className="font-semibold text-red-600">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  Code has expired. Please request a new one.
                </p>
              )}
            </div>

            {/* Verify Button */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => handleVerifyOTP()}
                disabled={verifyOTPMutation.isPending || otp.join('').length !== 6}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyOTPMutation.isPending ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </div>
                ) : (
                  'Verify Code'
                )}
              </button>

              {/* Resend Code Button */}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend || resendOTPMutation.isPending}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendOTPMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resending...
                  </div>
                ) : canResend ? (
                  'Resend Code'
                ) : (
                  'Resend Code'
                )}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={verifyOTPMutation.isPending || resendOTPMutation.isPending}
                className="w-full py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTP;