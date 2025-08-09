import React, { useState } from 'react';
import signinImg from '../assets/signin-image.png';
import { IoIosPerson } from 'react-icons/io';
import { RiLockPasswordFill } from 'react-icons/ri';
import axios from 'axios';
// import { URL } from '../../const/utils';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { setUser } from '../reduxtolkit/slice/userinfo';
import { URL } from '../constant/utils';
const Login = () => {
  // const dispatch = useDispatch()
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
     localStorage.setItem("Cuseremail", formData.email);
    // const SendData = new FormData()
    // SendData.append("email",formData.email)
    // SendData.append("password",formData.password)  this data is not send json form 
    try {
      const res =await axios.post(`${URL}/user/login`,{
        email: formData.email,
        password: formData.password,
      })
      console.log(res); 
      // dispatch(setUser(res.data.user))
      localStorage.setItem('Cusertoken',res.data.token)
      localStorage.setItem("Cuserid",res.data.user._id)
  toast.success(res.data.message)  
  if(res.status ===200){
    navigate('/chat')
  } 
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message)
    }
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 ">
      <div className="bg-white rounded-2xl shadow-lg px-6 py-14 w-full max-w-4xl flex flex-col md:flex-row gap-6">
        {/* Image Section */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src={signinImg}
            alt="Login illustration"
            className="max-w-xs md:max-w-full"
          />
        </div>

        {/* Form Section */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
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
                <IoIosPerson/>
              </span>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border-b-2 outline-none py-2 pl-8 "
              />
              <span className="absolute left-0 top-3.5 text-gray-500">
                <RiLockPasswordFill/>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 mt-3 px-6 cursor-pointer rounded"
            >
              Log in
            </button>
          </form>

          {/* Create Account Link */}
          <p className="mt-6 text-sm">
           <Link to='/'> <a  className="text-blue-600 hover:underline">
              Create an account
            </a></Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
