import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../../../services/auth.service';
import { useAuth } from '../../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import logo from "../../../../assets/All/logo.png";
// Define the interface for the location state to extract the phone number
interface LocationState {
  phoneNumber: string;
}

const OTPVerification: React.FC = () => {
  const navigate = useNavigate(); // Hook to programmatically navigate
  const location = useLocation(); // Hook to access location object
  const { login } = useAuth();
  const phoneNumber = (location.state as LocationState)?.phoneNumber; // Extract phone number from location state

  const [otp, setOtp] = useState<string[]>(new Array(6).fill("")); // State to hold OTP input values
  const [countdown, setCountdown] = useState<number>(29); // State for countdown timer
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // State to manage submission status
  const [error, setError] = useState('');

  // Effect to handle countdown timer
  useEffect(() => {
    if (!phoneNumber) {
      navigate('/login');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0)); // Decrease countdown every second
    }, 1000);
    return () => clearInterval(timer); // Cleanup timer on component unmount
  }, [phoneNumber, navigate]);

  // Function to handle changes in OTP input fields
  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isSubmitting) return; // Prevent changes if submitting
    
    const value = element.value;
    if (!/^\d*$/.test(value)) return; // Only allow digits

    // Handle pasting of full OTP
    if (value.length > 1) {
      // Take only first 6 digits if pasted value is longer
      const otpArray = value.slice(0, 6).split('').map(char => char.toString());
      // Fill remaining slots with empty strings if OTP is shorter than 6 digits
      const newOtp = [...otpArray, ...new Array(6 - otpArray.length).fill("")];
      setOtp(newOtp);
      
      // Auto submit if we got 6 digits
      if (otpArray.length === 6) {
        setTimeout(() => handleVerify(), 100);
      }
      return;
    }

    // Handle single digit input
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto submit when all digits are filled
    if (value && index === 5) {
      handleVerify();
      return;
    }
    
    // Move to next input if value is entered
    if (value && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (!/^\d*$/.test(pastedData)) return; // Only allow digits

    const otpArray = pastedData.slice(0, 6).split('').map(char => char.toString());
    const newOtp = [...otpArray, ...new Array(6 - otpArray.length).fill("")];
    setOtp(newOtp);

    // Auto submit if we got 6 digits
    if (otpArray.length === 6) {
      setTimeout(() => handleVerify(), 100);
    }
  };

  // Function to handle key down events in OTP input fields
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      handleVerify();
      return;
    }
    
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = e.currentTarget.previousSibling; // Get the previous input
      if (prevInput) {
        (prevInput as HTMLInputElement).focus(); // Move focus to the previous input if current is empty
      }
    }
  };

  // Function to handle OTP verification
  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6 || !phoneNumber) return;

    try {
      setIsSubmitting(true);
      setError('');
      const response = await authService.verifyOTP(phoneNumber, otpString);
      
      if (response.message === "Number verified successfully") {
        toast.success('OTP verified successfully!');
        
        // Update auth context with the new token
        if (response.token) {
          login(response.token, phoneNumber);
        }
        
        // If user exists (phone number is in database), go to location page
        if (response.userExists) {
          // Store username if available
          if (response.userName) {
            localStorage.setItem('userName', response.userName);
          }
          navigate('/location', { 
            state: { 
              returnUrl: '/home' 
            } 
          });
        } else {
          // If new user (phone number not in database), go to name input
          navigate('/name-input');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
      setOtp(new Array(6).fill(""));
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle resending OTP
  const handleResendOTP = async () => {
    if (countdown > 0 || !phoneNumber) return;
    
    try {
      await authService.sendOTP(phoneNumber);
      setCountdown(29);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  // Function to format the phone number for display
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
 // Get the last 4 digits of the phone number
    return `+91 ${phone.slice(0, -4)}XXXX`; // Mask the phone number except for the last 4 digits
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-b from-[#FFF1F2] to-[#FFFBEB] fixed inset-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[800px] mx-auto flex flex-col items-center"
      >
        <div className="w-full max-w-md px-6">
          <img 
            src={logo}
            alt="Genda Phool"
            className="h-32 mx-auto mb-20"
          />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full bg-white p-8 rounded-2xl shadow-sm"
          >
            <div className="text-center mb-10">
              <h1 className="text-2xl font-semibold mb-2">Verify WhatsApp OTP</h1>
              <p className="text-gray-600">Enter 6-digit OTP sent to {formatPhoneNumber(phoneNumber || '')}</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center mb-6"
              >
                {error}
              </motion.div>
            )}

            <div className="flex gap-4 justify-center mb-8">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="tel"
                  maxLength={index === 0 ? 6 : 1}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={(e) => handlePaste(e)}
                  className="w-12 h-12 border border-gray-300 rounded-lg text-center text-xl font-semibold focus:border-[#FF5722] focus:outline-none transition-all duration-200 bg-white"
                  disabled={isSubmitting}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleVerify}
              disabled={isSubmitting || otp.join('').length !== 6}
              className="w-full py-3.5 px-4 bg-[#FF5722] text-white rounded-full font-medium hover:bg-[#F4511E] transition-colors duration-200 mb-6"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Verify & Continue'
              )}
            </motion.button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive OTP?{' '}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                  className={countdown > 0 ? 'text-gray-400' : 'text-[#FF5722] font-medium'}
                >
                  Resend
                </motion.button>
                {countdown > 0 && (
                  <span className="text-gray-400 ml-1">
                    in {`00:${countdown < 10 ? `0${countdown}` : countdown}`}
                  </span>
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;