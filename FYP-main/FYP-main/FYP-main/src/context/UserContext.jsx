// // context/UserContext.js
// import { createContext, useContext, useEffect, useState } from 'react';
// import axios from 'axios';
// import socket, { URL } from '../constant/utils';

// const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [users, setUsers] = useState([]);
// //   const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"; // adjust if needed

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await axios.get(`${URL}/user/fetch`);
//         setUsers(res.data);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     };

//     fetchUsers();
//   }, []);

//   useEffect(() => {
//   socket.on('updateUserStatus', ({ userId, status }) => {
//     setUsers((prevUsers) =>
//       prevUsers.map((user) =>
//         user._id === userId ? { ...user, status } : user
//       )
//     );
//   });

//   return () => {
//     socket.off('updateUserStatus');
//   };
// }, []);

//   return (
//     <UserContext.Provider value={{ users, setUsers }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// // Custom hook to use the UserContext
// export const useUsers = () => useContext(UserContext);











// context/UserContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import socket, { URL } from '../constant/utils';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({}); // 🔥 NEW: userId => 'online' | 'offline'

  // Fetch all users once
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${URL}/user/fetch`);
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

   

  useEffect(() => {
  // update when any user changes status
  const handleStatusUpdate = ({ userId, status }) => {
    setOnlineStatus((prev) => ({
      ...prev,
      [userId]: status,
    }));
  };

  // set all online users on first connect
  const handleInitialOnline = (userIds) => {
    const newStatus = {};
    userIds.forEach((id) => {
      newStatus[id] = "online";
    });
    setOnlineStatus(newStatus);
  };

  socket.on("updateUserStatus", handleStatusUpdate);
  socket.on("initialOnlineUsers", handleInitialOnline);

  return () => {
    socket.off("updateUserStatus", handleStatusUpdate);
    socket.off("initialOnlineUsers", handleInitialOnline);
  };
}, []);


  return (
    <UserContext.Provider value={{ users, setUsers, onlineStatus }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook
export const useUsers = () => useContext(UserContext);
