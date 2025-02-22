import { useState } from "react";
import axios from "axios";

const OTPVerification = ({ onVerified }) => {
  const [mobileNo, setMobileNo] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const sendOtp = async () => {
    try {
      await axios.post("http://192.168.1.199:8001/api/send-otp/", { mobile_no: mobileNo });
      setOtpSent(true);
      alert("OTP sent successfully");
    } catch (error) {
      alert(error.response?.data?.error || "Error sending OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      await axios.post("http://192.168.1.199:8001/api/verify-otp/", { mobile_no: mobileNo, otp });
      onVerified(mobileNo);
    } catch (error) {
      alert(error.response?.data?.error || "Invalid OTP");
    }
  };

  return (
    <div className="p-4">
      <input className="border p-2" value={mobileNo} onChange={(e) => setMobileNo(e.target.value)} placeholder="Enter Mobile Number" />
      <button className="bg-blue-500 text-white p-2" onClick={sendOtp}>Send OTP</button>

      {otpSent && (
        <>
          <input className="border p-2" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
          <button className="bg-green-500 text-white p-2" onClick={verifyOtp}>Verify OTP</button>
        </>
      )}
    </div>
  );
};

export default OTPVerification;
