import { createContext, useContext, useEffect, useState } from 'react';
import socket from '../constant/utils';
import { useUser } from './UserContext'; // 👈 import your user context

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { currentUser } = useUser(); // 👈 get user from context
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!currentUser?._id) return;

    socket.emit('userConnected', currentUser._id);

    socket.on('onlineUsers', (onlineUserIds) => {
      setOnlineUsers(onlineUserIds);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
