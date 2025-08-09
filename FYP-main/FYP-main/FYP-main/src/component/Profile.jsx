import { useEffect, useState } from "react";
import { URL } from "../constant/utils";
import axios from "axios";

// Profile.js
const Profile = ({ onClose }) => {


const [profile, setProfile] = useState(null);

  useEffect(() => {
   const getUserProfile = async () => {
  try {
    const token = localStorage.getItem("Cusertoken"); // or context/sessionStorage/etc.

    const response = await axios.get(`${URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("User Profile:", response);
       setProfile(response.data); 
    console.log(" Profile:", response.data);
  } catch (error) {
    console.log(error);
    
    console.error("Error fetching profile:", error.response?.data || error.message);
    
  }}
  getUserProfile()
  }, []);


  return (
   <div className="fixed inset-0  bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-500 text-xl">
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">User Profile</h2>

        {profile ? (
          <div className="flex flex-col items-center space-y-4">
            {/* User Image */}
            <img
              src={profile.user.picture.url || "/default-profile.png"} // fallback if no image
              alt="User"
              className="w-24 h-24 rounded-full object-cover"
            />

            {/* Email */}
            <p className="text-gray-700 font-semibold">{profile.user.email}</p>

            {/* Name Input */}
            <input
              type="text"
              value={profile.user.name}
              readOnly
              className="w-full border p-2 rounded"
            />

            {/* Password Placeholder Input */}
            <input
              type="password"
              value={profile.user.password}
              readOnly
              className="w-full border p-2 rounded"
            />
          </div>
        ) : (
          <p className="text-center">Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
