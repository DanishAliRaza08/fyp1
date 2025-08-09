import React, { useState } from 'react';
import signupimg from '../assets/signup-image.png'; 
import { IoIosPerson,   } from "react-icons/io";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdEmail } from "react-icons/md";
import { URL } from '../../const/utils';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import ChatMain from '../page/ChatMain';
const Signup = () => {
  const navigate = useNavigate()
  const [show, setShow]= useState([])
  console.log(show,"picc");
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    picture: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    console.log(name, value, files);
    
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
formDataToSend.append('name', formData.name);
formDataToSend.append('email', formData.email);
formDataToSend.append('password', formData.password);
formDataToSend.append('picture', formData.picture);

try {
  const result = await axios.post(`${URL}/user/register` , formDataToSend)
  console.log(result); 
  toast.success(result.data.message);
  if(result.status ===201){
    navigate('/login')
  }
  setShow(result.data.user.picture)
  // ChatMain(result.data.user.picture)
  setFormData({
    name: '',
    email: '',
    password: '',
    picture: null,
  });
} catch (error) {
  console.log(error);
  const message =    error?.response?.data?.message || 'Something went wrong!';
  toast.error(message);
}
 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-4xl flex flex-col md:flex-row gap-6">
        {/* Form Section */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-6">Sign up</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="relative">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border-b-2 outline-none py-2 pl-8"
              />
              <span className="absolute left-0 top-3.5 text-gray-500">
                {/* <i className="fas fa-user"></i> */}
                <IoIosPerson />
              </span>
            </div>

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-b-2 outline-none py-2 pl-8"
              />
              <span className="absolute left-0 top-3.5 text-gray-500">
                <MdEmail />
              </span>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Password At Least 6 Characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full border-b-2 outline-none py-2 pl-8"
              />
              <span className="absolute left-0 top-3.5 text-gray-500">
                    <RiLockPasswordFill />
                {/* </i> */}
              </span>
            </div>

            {/* Picture Upload */}
            <div className="relative">
              <label className="block text-sm text-gray-700 mb-1">Upload Picture</label>
              <input
              required
                type="file"
                name="picture"
                accept="image/*"
                onChange={handleChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Submit */}

            <div className='flex gap-2.5 '  >

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-5 rounded"
            >
              Register
            </button>
            <Link to='/login'>
            <button
              // type="submit"
              className="text-sm mt-2 cursor-pointer "
              >
          Already have account <span className='text-blue-600 hover:underline'>Login</span> 
            </button>
              </Link>
            </div>
      
          </form>

          
        </div>

        {/* Image Section */}
        <div className="flex-1 hidden md:flex items-center justify-center">
          <img
            src={signupimg} // Replace with your image path
            alt="Signup illustration"
            className="max-w-full h-auto"
          />
        </div>
      </div>
 
    </div>
  );
};

export default Signup;
