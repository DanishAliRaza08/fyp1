import { createContext, useContext, useState, useEffect } from 'react';
import socket from '../constant/utils';
import { v4 as uuidv4 } from 'uuid';

const VideoCallContext = createContext();

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
};

export const VideoCallProvider = ({ children }) => {
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    // Listen for incoming video calls
    socket.on('incomingVideoCall', (callData) => {
      console.log('Incoming video call:', callData);
      setIncomingCall(callData);
      setIsCallModalOpen(true);
    });

    // Listen for call acceptance
    socket.on('videoCallAccepted', (callData) => {
      console.log('Video call accepted:', callData);
      setCurrentCall(callData);
      setIncomingCall(null);
    });

    // Listen for call rejection
    socket.on('videoCallRejected', (callData) => {
      console.log('Video call rejected:', callData);
      setCurrentCall(null);
      setIncomingCall(null);
      setIsCallModalOpen(false);
    });

    // Listen for call end
    socket.on('videoCallEnded', (callData) => {
      console.log('Video call ended:', callData);
      setCurrentCall(null);
      setIncomingCall(null);
      setIsCallModalOpen(false);
    });

    return () => {
      socket.off('incomingVideoCall');
      socket.off('videoCallAccepted');
      socket.off('videoCallRejected');
      socket.off('videoCallEnded');
    };
  }, []);

  const initiateCall = (receiverId, receiverName, isGroupCall = false, groupId = null) => {
    const roomName = `call-${uuidv4()}`;
    const callerId = localStorage.getItem('Cuserid');
    const callerName = localStorage.getItem('Cusername');

    const callData = {
      roomName,
      callerId,
      callerName,
      receiverId: isGroupCall ? null : receiverId,
      receiverName: isGroupCall ? null : receiverName,
      isGroupCall,
      groupId: isGroupCall ? groupId : null,
      timestamp: new Date().toISOString()
    };

    if (isGroupCall) {
      // For group calls, emit to all group members
      socket.emit('initiateGroupVideoCall', callData);
    } else {
      // For 1-on-1 calls
      socket.emit('initiateVideoCall', callData);
    }

    // Open call modal for caller
    setCurrentCall(callData);
    setIsCallModalOpen(true);
  };

  const acceptCall = () => {
    if (incomingCall) {
      socket.emit('acceptVideoCall', incomingCall);
      setCurrentCall(incomingCall);
      setIncomingCall(null);
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      socket.emit('rejectVideoCall', incomingCall);
      setIncomingCall(null);
      setIsCallModalOpen(false);
    }
  };

  const endCall = () => {
    if (currentCall) {
      socket.emit('endVideoCall', currentCall);
    }
    setCurrentCall(null);
    setIncomingCall(null);
    setIsCallModalOpen(false);
  };

  const value = {
    isCallModalOpen,
    currentCall,
    incomingCall,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    setIsCallModalOpen
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
};

export default VideoCallContext;
