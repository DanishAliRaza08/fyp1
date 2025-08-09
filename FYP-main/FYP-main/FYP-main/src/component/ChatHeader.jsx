// src/components/ChatHeader.jsx
import React from 'react';
import { useUsers } from '../context/UserContext';
import { useVideoCall } from '../context/VideoCallContext';
import { FaVideo, FaPhone } from 'react-icons/fa';

const ChatHeader = ({ userId, groupId = null, isGroupChat = false }) => {
  const { onlineStatus } = useUsers();
  const { initiateCall } = useVideoCall();
  
  const isOnline = onlineStatus[userId] === 'online'; 
  const Username = localStorage.getItem("Cusername");

  const handleVideoCall = () => {
    if (isGroupChat && groupId) {
      // Group video call
      initiateCall(null, null, true, groupId);
    } else if (userId) {
      // 1-on-1 video call
      initiateCall(userId, Username, false);
    }
  };

  return (
    <div className="border-b border-gray-200 px-6 py-1.5 flex items-center justify-between">
      <div>
        <div className="font-semibold text-lg">{Username}</div>
        {!isGroupChat && (
          <div className={`text-sm ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </div>
        )}
        {isGroupChat && (
          <div className="text-sm text-blue-500">Group Chat</div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={handleVideoCall}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded flex items-center space-x-2 transition-colors"
          title="Start Video Call"
        >
          <FaVideo size={14} />
          <span>Video Call</span>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
