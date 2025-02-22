import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const departments = [
  { value: "HR", label: "Human Resources" },
  { value: "Admin", label: "Admin" },
  { value: "qa", label: "QA" },
  { value: "Forging", label: "Forging" },
  { value: "pre_mc", label: "Pre MC" },
  { value: "ht", label: "HT" },
  { value: "Rm", label: "RM" },
  { value: "visual", label: "Visual" },
  { value: "fi", label: "FI" },
  { value: "cnc", label: "CNC" },
  { value: "marking", label: "Marking" },
  { value: "shot_blast", label: "Shot Blast" },
  { value: "dispatch", label: "Dispatch" },
];

const Signup = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: "",
    name: "",
    lastname: "",
    mobile_no: "",
    password: "",
    email: "",
    department: ""
  });

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const registerUser = async () => {
    try {
      const response = await axios.post("http://192.168.1.199:8001/api/register/", userData);
      alert("User registered successfully");
      setUserData({ username: "", name: "", lastname: "", mobile_no: "", password: "", email: "", department: "" });
      navigate(-1); // Redirect to previous page
    } catch (error) {
      alert(error.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Register</h2>
        <div className="space-y-3">
          <input name="username" value={userData.username} onChange={handleChange} className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400" placeholder="Username" />
          <input name="name" value={userData.name} onChange={handleChange} className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400" placeholder="First Name" />
          <input name="lastname" value={userData.lastname} onChange={handleChange} className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400" placeholder="Last Name" />
          <input name="mobile_no" value={userData.mobile_no} onChange={handleChange} className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400" placeholder="Mobile Number" />
          <select name="department" value={userData.department} onChange={handleChange} className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400">
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.value} value={dept.value}>{dept.label}</option>
            ))}
          </select>
          <input name="email" value={userData.email} onChange={handleChange} className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400" placeholder="Email" />
          <input name="password" value={userData.password} onChange={handleChange} type="password" className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400" placeholder="Password" />
          <button onClick={registerUser} className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition duration-300">Register</button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
