import React, { useEffect, useState } from "react";
 
import axios from "axios";
import socket, { mockGroups, URL } from "../constant/utils";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../context/UserContext";
import { FiPlus } from "react-icons/fi";
import GroupPopup from "./GroupPopup";
 

const Chatlist = ({ mode, onUserSelect , onGroupSelect}) => {

 const { onlineStatus } = useUsers();


  const { users ,setUsers} = useUsers()
  console.log(users,'for');
  
  const navigate =useNavigate()
  const [search, setSearch] = useState("");
  // const [newMessageUserIds, setNewMessageUserIds] = useState([]);

  // const [users, setUsers] = useState([]);
  const [usersGroup, setUsersGroup] = useState([]);
    // const [mode, setMode] = useState("dm");
  const senderId = localStorage.getItem("Cuserid");
// console.log(mode, "chatlist")
 const [showPopup, setShowPopup] = useState(false);
  //  for group chat 
//  const senderId = localStorage.getItem("Cuserid");
  const senderEmail = localStorage.getItem("Cuseremail"); // get the email from localStorage
  const isAdmin = senderEmail === "nouman@gmail.com"; 


  useEffect(() => {
    

const fetchGroups = async () => {
  const userId = localStorage.getItem('Cuserid');
  const res = await axios.get(`${URL}/api/groups/user/${userId}`);
  console.log('User Groups:', res.data);
  setUsersGroup(res.data)
};

fetchGroups()

 
  }, []);

  // useEffect(() => {
  //   // Listen for new incoming messages
  //   socket.on("receiveMessage", (message) => {
  //     const sender = message.senderId;

  //     // Move that user to the top of the list
  //     setUsers((prevUsers) => {
  //       const userIndex = prevUsers.findIndex((u) => u._id === sender);
  //       if (userIndex === -1) return prevUsers;

  //       const updated = [...prevUsers];
  //       const [user] = updated.splice(userIndex, 1);
  //       return [user, ...updated];
  //     });
  //   });

  //   return () => {
  //     socket.off("receiveMessage");
  //   };
  // }, []);


 useEffect(() => {
  // When receiving a message (for sender)
  socket.on("receiveMessage", (message) => {
    const sender = message.senderId;
    setUsers((prevUsers) => {
      const userIndex = prevUsers.findIndex((u) => u._id === sender);
      if (userIndex === -1) return prevUsers;

      const updated = [...prevUsers];
      const [user] = updated.splice(userIndex, 1);
      return [user, ...updated];
    });
  });

  // ✅ When notified to move a user to top (for receiver)
  socket.on("moveUserToTop", ({ userId }) => {
    setUsers((prevUsers) => {
      const index = prevUsers.findIndex((u) => u._id === userId);
      if (index === -1) return prevUsers;

      const updated = [...prevUsers];
      const [user] = updated.splice(index, 1);
      return [user, ...updated];
    });
  });

  return () => {
    socket.off("receiveMessage");
    socket.off("moveUserToTop");
  };
}, []);

// useEffect(() => {
//   socket.on("receiveMessage", (message) => {
//     const sender = message.senderId;

//     setUsers((prevUsers) => {
//       const index = prevUsers.findIndex((u) => u._id === sender);
//       if (index === -1) return prevUsers;
//       const updated = [...prevUsers];
//       const [user] = updated.splice(index, 1);
//       return [user, ...updated];
//     });

//     // Only show notification if user isn't already chatting with sender
//     const currentlyOpenUserId = localStorage.getItem("currentlyChattingWith");
//     if (currentlyOpenUserId !== sender) {
//       setNewMessageUserIds((prev) =>
//         prev.includes(sender) ? prev : [...prev, sender]
//       );
//     }
//   });

//   socket.on("moveUserToTop", ({ userId }) => {
//     setUsers((prevUsers) => {
//       const index = prevUsers.findIndex((u) => u._id === userId);
//       if (index === -1) return prevUsers;
//       const updated = [...prevUsers];
//       const [user] = updated.splice(index, 1);
//       return [user, ...updated];
//     });
//   });

//   return () => {
//     socket.off("receiveMessage");
//     socket.off("moveUserToTop");
//   };
// }, []);


  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  // const isOnline = onlineStatus[user._id] === "online";
  );
console.log(filteredUsers,"filter");

 

//   useEffect(() => {
//   localStorage.removeItem("currentlyChattingWith");
// }, []);

  

  return (
    <div className="w-96 border-r border-gray-200 h-full overflow-y-auto overflow-x-hidden hide-scrollbar">

       {mode === "group" ? (
        <>

         <div className="flex justify-between items-center px-4 py-2 mt-1.5">
        <div className="font-medium text-lg">Groups</div>
        {/* <div
          className="flex gap-2 justify-center items-center font-medium text-lg bg-green-400 px-2 py-1 rounded-lg cursor-pointer hover:bg-green-500"
          onClick={() => setShowPopup(true)}
        >
          <FiPlus /> Create
        </div> */}
        {isAdmin && (
  <div
    className="flex gap-2 justify-center items-center font-medium text-lg bg-green-400 px-2 py-1 rounded-lg cursor-pointer hover:bg-green-500"
    onClick={() => setShowPopup(true)}
  >
    <FiPlus /> Create
  </div>
)}

      </div>

      {showPopup && <GroupPopup onClose={() => setShowPopup(false)} />}
         

   <div className="sticky top-0 bg-white w-full pt-4 px-4">
        <h2 className="text-lg font-medium font-sans mb-4">
          Active Conversation{" "}
          <span className="bg-gray-300 px-2 text-sm rounded-md ml-2">
            {mockGroups.length}
          </span>
        </h2>
        <input
          // onChange={(e) => setSearch(e.target.value)}
          // value={search}
          type="text"
          placeholder="Search"
          className="w-full px-3 py-1.5 mb-4 rounded border border-gray-300 bg-gray-100"
        />
      </div>


  <ul className="space-y-4 p-4">
        {usersGroup.map((user, idx) => (
          <li
            key={idx}
            onClick={() => {
              onGroupSelect(user);
              // navigate(`/chat/${user._id}`);
              localStorage.setItem("Cusername", user.name);
            }}
            className="cursor-pointer"
          >
            <div className="flex space-x-4 hover:bg-gray-100 p-1 rounded-lg transition duration-200 ease-in-out">
              <div>
                <img
                  src={user.picture}
                  alt="user pic"
                  className="w-14 h-14 rounded-full"
                />
              
              </div>
              <div>
                {/* <div className={`text-sm ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
          {isOnline ? 'h-10 w-10 rounded-full ' : 'Offline'}
        </div> */}
                <div className="font-medium">{user.name}</div>

              </div>
            </div>
          </li>
        ))}
      </ul>
        </>

 
) : (
 
<>
      

      <div className="w-96 border-r border-gray-200 h-full overflow-y-auto overflow-x-hidden hide-scrollbar relative z-0">
  {/* Sticky Header */}
  <div className="sticky top-0 bg-white w-full pt-4 px-4 z-10">
    <h2 className="text-lg font-medium font-sans mb-4">
      Active Conversation{" "}
      <span className="bg-gray-300 px-2 text-sm rounded-md ml-2">
        {filteredUsers.length}
      </span>
    </h2>
    <input
      onChange={(e) => setSearch(e.target.value)}
      value={search}
      type="text"
      placeholder="Search"
      className="w-full px-3 py-1.5 mb-4 rounded border border-gray-300 bg-gray-100"
    />
  </div>

  {/* List */}
  <ul className="space-y-4 p-4">
    {filteredUsers.map((user, idx) => (
      <li
        key={idx}
        onClick={() => {
          onUserSelect(user);
          localStorage.setItem("Cusername", user.name);
         
        }}
        className="cursor-pointer"
      >
        <div className="flex space-x-4 hover:bg-gray-100 p-1 rounded-lg transition duration-200 ease-in-out">
          <div className="relative w-14 h-14">
            <img
              src={user.picture.url}
              alt="user pic"
              className="w-14 h-14 rounded-full"
            />
            {onlineStatus[user._id] === "online" && (
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
             
          </div>
        </div>
      </li>
    ))}
  </ul>
</div>

</>
 
)}
  
    </div>
  );
};

export default Chatlist;
