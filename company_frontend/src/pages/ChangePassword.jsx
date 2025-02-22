import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("http://192.168.1.199:8001/api/user-details/", {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        setUserData(response.data);
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      }
    };
    fetchUserData();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }
    try {
      const response = await api.post(
        "http://192.168.1.199:8001/api/change_password/",
        { old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );
      setMessage(response.data.message);
      setTimeout(() => {
        if (userData) {
          const departmentName = userData.department.toLowerCase();
          navigate(`/department/${departmentName}`);
        }
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {[{ label: "Old Password", value: oldPassword, setValue: setOldPassword },
            { label: "New Password", value: newPassword, setValue: setNewPassword },
            { label: "Confirm New Password", value: confirmPassword, setValue: setConfirmPassword }].map(({ label, value, setValue }, index) => (
            <div key={index} className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={label}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          ))}
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200">
            Change Password
          </button>
        </form>
        {message && <p className="text-center text-red-500 mt-3">{message}</p>}
      </div>
    </div>
  );
};

export default ChangePassword;
