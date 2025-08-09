import React, { useState } from 'react'
import { CiChat1 } from 'react-icons/ci';
import { FaComments, FaSearch, FaBell, FaCog, FaRegUser } from 'react-icons/fa';
import { MdGroups2 } from 'react-icons/md';
import Profile from './Profile';
const Siderbar = ({setMode}) => {
  // console.log(setMode, "setmode in sidebar")
 const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="w-[90px]   text-black border-r border-gray-200  flex flex-col items-center py-4 space-y-6">
      <div className=' space-y-1.5 flex flex-col items-center justify-center mt-2  not-first:'>
      <FaComments className="text-2xl cursor-pointer" />
       <p>Workspace</p>
      </div  >
      <div className=' space-y-1.5 flex flex-col items-center justify-center cursor-pointer'  onClick={() => setMode('dm')}>
      <CiChat1 className="text-2xl cursor-pointer" />
    <p>DMs</p>
      </div  >
      <div  className='cursor-pointer  space-y-1.5 flex flex-col items-center justify-center' onClick={() => setMode('group')}>
      <MdGroups2  className="text-2xl cursor-pointer"/>
 <p>Group </p>
      </div  >
      <div className='  space-y-1.5 flex flex-col items-center justify-center '  onClick={() => setShowProfile(true)}>
      <FaRegUser className="text-xl cursor-pointer"  />
        <p>profile</p>
      </div  >
        {showProfile && <Profile onClose={() => setShowProfile(false)} />}
       {/* {showProfile && <Profile  />} */}
    </div>
  )
}

export default Siderbar