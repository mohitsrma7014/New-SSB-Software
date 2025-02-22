import { useState } from "react";
import axios from "axios";

const Register = ({ mobileNo }) => {
  const [userData, setUserData] = useState({ username: "", first_name: "", last_name: "" });

  const registerUser = async () => {
    try {
      await axios.post("http://192.168.1.199:8001/api/register/", { ...userData, mobile_no: mobileNo });
      alert("User registered successfully");
    } catch (error) {
      alert(error.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div>
      <input placeholder="Username" onChange={(e) => setUserData({ ...userData, username: e.target.value })} />
      <input placeholder="First Name" onChange={(e) => setUserData({ ...userData, first_name: e.target.value })} />
      <input placeholder="Last Name" onChange={(e) => setUserData({ ...userData, last_name: e.target.value })} />
      <button onClick={registerUser}>Register</button>
    </div>
  );
};

export default Register;
