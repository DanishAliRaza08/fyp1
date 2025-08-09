import React, { useState, useEffect } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { IoClose } from 'react-icons/io5';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';

const VideoCallModal = ({ 
  isOpen, 
  onClose, 
  roomName, 
  userName, 
  isIncoming = false,
  callerName = null 
}) => {
  const [callAccepted, setCallAccepted] = useState(!isIncoming);
  const [callEnded, setCallEnded] = useState(false);

  if (!isOpen) return null;

  const handleAcceptCall = () => {
    setCallAccepted(true);
  };

  const handleRejectCall = () => {
    setCallEnded(true);
    onClose();
  };

  const handleCallEnd = () => {
    setCallEnded(true);
    onClose();
  };

  // If it's an incoming call and not accepted yet, show call invitation
  if (isIncoming && !callAccepted && !callEnded) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FaVideo className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Incoming Video Call</h3>
            <p className="text-gray-600">{callerName} is calling you</p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRejectCall}
              className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors"
              title="Reject Call"
            >
              <FaPhoneSlash size={20} />
            </button>
            <button
              onClick={handleAcceptCall}
              className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition-colors"
              title="Accept Call"
            >
              <FaVideo size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main video call interface
  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Video Call - {roomName}</h3>
          <p className="text-sm text-gray-300 mt-1">
            🎥 Direct Jitsi connection - should load automatically for both users
          </p>
        </div>
        <button
          onClick={handleCallEnd}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <IoClose size={24} />
        </button>
      </div>

      {/* Jitsi Meet Component */}
      <div className="flex-1 relative">
        {/* Loading overlay while Jitsi loads */}
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10" id="jitsi-loading">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Connecting to video call...</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
            >
              Reload if stuck
            </button>
          </div>
        </div>
        
        <iframe
          src={`https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.requireDisplayName=false&interfaceConfig.SHOW_JITSI_WATERMARK=false&userInfo.displayName="${encodeURIComponent(userName)}"`}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="camera; microphone; fullscreen; display-capture"
          onLoad={() => {
            // Hide loading overlay when iframe loads
            const loading = document.getElementById('jitsi-loading');
            if (loading) {
              setTimeout(() => {
                loading.style.display = 'none';
              }, 2000);
            }
          }}
          style={{ 
            minHeight: '500px',
            backgroundColor: '#1f2937'
          }}
        ></iframe>
      </div>
    </div>
  );
};

export default VideoCallModal;
