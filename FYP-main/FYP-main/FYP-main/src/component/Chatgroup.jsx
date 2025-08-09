// // import React from 'react'
// // import ChatHeader from './ChatHeader'

// // const Chatgroup = () => {
// //   return (
// //      <div className="flex flex-col h-full">
// //       <ChatHeader  />
      
// //     </div>
// //   )
// // }

// // export default Chatgroup


// import React, { useEffect, useState, useRef } from 'react';
// import io from 'socket.io-client';
// import axios from 'axios';
// import socket, { URL } from '../constant/utils';
// import ChatHeader from './ChatHeader';

// // const socket = io('http://localhost:5000'); // change if using deployed URL

// const Chatgroup = ({ groupId }) => {
//   const [messages, setMessages] = useState([]);
  
//   const [text, setText] = useState('');
//   const [file, setFile] = useState(null);
//   const bottomRef = useRef(null);

//   useEffect(() => {
//     socket.emit('joinGroup', groupId);

//     socket.on('receiveGroupMessage', (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });

//     fetchMessages();

//     return () => {
//       socket.off('receiveGroupMessage');
//     };
//   }, [groupId]);

//   const fetchMessages = async () => {
//     const res = await axios.get(`${URL}/api/groups/${groupId}/messages`);
//     setMessages(res.data);
//   };

//   const handleSend = async () => {
//     const senderId = localStorage.getItem('Cuserid');
//     const formData = new FormData();
//     formData.append('groupId', groupId);
//     formData.append('sender', senderId);
//     if (text) formData.append('text', text);
//     if (file) formData.append('file', file);

//     const res = await axios.post(`${URL}/api/groups/message`, formData);
//     socket.emit('sendGroupMessage', res.data); // res.data = saved message from backend
//     console.log(res);
    
//     setText('');
//     setFile(null);
//   };

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   return (
//     <div className="flex flex-col h-full p-4">
//       <ChatHeader  />
//       <div className="flex-1 overflow-y-auto">
//         {messages.map((msg, idx) => (
//           <div key={idx} className="mb-2">
//             <div className="text-sm font-medium">{msg.sender.name}</div>
//             {msg.text && <p>{msg.text}</p>}
//             {msg.fileUrl && (
//               <img src={msg.fileUrl} alt="sent" className="w-40 mt-1 rounded" />
//             )}
//           </div>
//         ))}
//         <div ref={bottomRef} />
//       </div>

//       <div className="mt-2 flex gap-2">
//         <input
//           type="text"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Type a message..."
//           className="flex-1 border rounded px-3 py-2"
//         />
//         <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//         <button
//           onClick={handleSend}
//           className="bg-green-500 text-white px-4 rounded"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chatgroup;












import React, { useEffect, useRef, useState } from 'react';
import socket, { URL } from '../constant/utils';
import axios from 'axios';
import { FaMicrophone, FaPaperclip, FaPaperPlane, FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import ChatHeader from './ChatHeader';
import { format, isToday, isYesterday } from "date-fns";

const Chatgroup = ({ groupId }) => {
  const senderId = localStorage.getItem('Cuserid');
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
console.log(groupId,"hello");

  const [messages, setMessages] = useState([]);
  console.log(messages,"come from bak");
  
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  

  // Fetch messages + join group socket room
 
useEffect(() => {
  if (!groupId) return;

  // 1. Join the correct group room
  socket.emit('joinGroup', groupId);

  // 2. Fetch existing messages
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${URL}/api/groups/messages/${groupId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load group messages:', err);
    }
  };

  fetchMessages();

  // 3. Handle incoming messages
  const handleReceiveMessage = (msg) => {
    // if (msg.group === groupId) {
    //   setMessages((prev) => [...prev, msg]);
    // }
    if (msg.group === groupId && msg.sender._id !== senderId) {
  setMessages((prev) => [...prev, msg]);
}

  };

  socket.on('receiveGroupMessage', handleReceiveMessage);

  // 4. Clean up
  return () => {
    socket.off('receiveGroupMessage', handleReceiveMessage);
  };
}, [groupId]);



  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEmojiClick = (emojiData) => {
    setInputText(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleAttachFile = (event) => {
    const selected = event.target.files[0];
    if (selected) {
      setFile(selected);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const toggleRecording = async () => {
    if (!recording) {
      const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(userStream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setVoiceBlob(blob);
        setStream(null);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setStream(userStream);
      setRecording(true);
    } else {
      mediaRecorder.stop();
      stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && !file && !voiceBlob) return;

    const formData = new FormData();
    formData.append('groupId', groupId);
    formData.append('sender', senderId);
    formData.append('text', inputText);
    if (file) formData.append('file', file);
    if (voiceBlob) formData.append('voice', voiceBlob);

    try {
 
const res = await axios.post(`${URL}/api/groups/message`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
socket.emit('sendGroupMessage', res.data);

 
setMessages((prev) => [...prev, res.data]);

 
setInputText('');
setFile(null);
setVoiceBlob(null);

    } catch (err) {
      console.error('Group message send failed:', err);
    }
  };
 

 const formatDateHeader = (date) => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy'); // Example: July 12, 2025
};

let lastDate = null;


  return (
    <div className="flex flex-col h-full">
      <ChatHeader groupId={groupId} isGroupChat={true} />

      {/* Messages */}
      {/* <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 ${m.sender._id === senderId ? 'text-right' : 'text-left'}`}>
            <div className="text-xs text-gray-500 font-medium mb-1 ">{m.sender?.name}</div>
            <div className={`inline-block px-3 py-2 rounded-lg max-w-sm break-words 
              ${m.sender._id === senderId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              
              {m.text && <p>{m.text}</p>}
              {m.fileUrl && <img src={m.fileUrl} alt="attachment" className="rounded mt-2 w-40" />}
              {m.voiceUrl && (
                <div className="mt-2">
                  <audio controls>
                    <source src={m.voiceUrl} type="audio/webm" />
                  </audio>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div> */}
      <div className="flex-1 overflow-y-auto p-4">
    {messages.map((m, i) => {
      const messageDate = new Date(m.createdAt);
      const isNewDay =
        !lastDate || format(messageDate, 'yyyy-MM-dd') !== format(lastDate, 'yyyy-MM-dd');
      lastDate = messageDate;

      return (
        <div key={i}>
          {/* Date Header */}
          {isNewDay && (
            <div className="flex justify-center my-4">
              <span className="bg-gray-300 text-gray-800 px-3 py-1 rounded-full text-sm shadow">
                {formatDateHeader(messageDate)}
              </span>
            </div>
          )}

          {/* Message */}
          <div className={`mb-3 ${m.sender._id === senderId ? 'text-right' : 'text-left'}`}>
            <div className="text-xs text-gray-500 font-medium mb-1">{m.sender?.name}</div>
            <div
              className={`inline-block px-3 py-2 rounded-lg max-w-sm break-words ${
                m.sender._id === senderId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {m.text && <p>{m.text}</p>}

              {m.fileUrl && (
                <img
                  src={m.fileUrl}
                  alt="attachment"
                  className="rounded mt-2 max-w-[300px]"
                />
              )}

              {m.voiceUrl && (
                <div className="mt-2">
                  <audio controls>
                    <source src={m.voiceUrl} type="audio/webm" />
                  </audio>
                </div>
              )}

              {/* Time under message */}
              <div className="text-[10px] text-black mt-1 text-right">
                {format(messageDate, 'hh:mm a')}
              </div>
            </div>
          </div>
        </div>
      );
    })}
    <div ref={bottomRef} />
  </div>

      {/* Input */}
      <div className="flex items-center p-3 border-t border-gray-200 bg-white relative ">
        <input type="file" id="group-file" className="hidden" onChange={handleAttachFile} />

        <div className="flex items-center space-x-3 mr-2">
          <button onClick={() => setShowEmojiPicker(val => !val)} className="text-gray-500 hover:text-blue-500">
            <FaSmile size={22} />
          </button>
          <label htmlFor="group-file" className="text-gray-500 hover:text-blue-500 cursor-pointer">
            <FaPaperclip size={22} />
          </label>
        </div>

        {/* <div className="relative flex-1 mx-2 border border-green-400">
          <textarea
            ref={inputRef}
            value={inputText}
            placeholder="Type a message..."
            rows={2}
            className="w-full border px-4 py-1.5 focus:outline-none border-gray-300 rounded-2xl resize-none"
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          {showEmojiPicker && (
            <div className="absolute bottom-14 left-0 z-20">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div> */}

        <div className="relative flex-1 mx-2 ">
  {/* File preview */}
  {file && (
    <div className="absolute -top-14 -left-5 z-10 bg-white bg-opacity-90 p-1 rounded shadow flex items-center  max-w-[80%]">
      {file.type.startsWith("image/") ? (
        <img
          src={window.URL.createObjectURL(file)}
          alt="preview"
          className="w-14 h-14 object-cover rounded"
        />
      ) : (
        <div className="text-sm text-gray-700 truncate max-w-[120px]">{file.name}</div>
      )}
      <button
        onClick={() => setFile(null)}
        className="text-red-500 -mt-10 -ml-2 hover:text-red-700 text-sm cursor-pointer"
        title="Remove file"
      >
        ✖
      </button>
    </div>
  )}

  {/* Textarea */}
  <textarea
    ref={inputRef}
    value={inputText}
    placeholder="Type a message..."
    rows={2}
    className="w-full border px-4 py-1.5 focus:outline-none border-gray-300 rounded-2xl resize-none"
    onChange={(e) => setInputText(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }}
  />

  {/* Emoji Picker */}
  {showEmojiPicker && (
    <div className="absolute bottom-14 left-0 z-20">
      <EmojiPicker onEmojiClick={handleEmojiClick} />
    </div>
  )}
</div>


        {voiceBlob && (
          <div className="flex items-center space-x-2 mx-2">
            <audio controls>
              <source src={window.URL.createObjectURL(voiceBlob)} type="audio/webm" />
            </audio>
            <button onClick={() => setVoiceBlob(null)} className="text-red-500 hover:text-red-700">✖</button>
          </div>
        )}

        <button
          onClick={toggleRecording}
          className={`text-white p-2 rounded-full ${recording ? 'bg-red-500' : 'bg-gray-500 hover:bg-blue-500'}`}
        >
          <FaMicrophone size={22} />
        </button>

        <button
          onClick={handleSend}
          className="bg-blue-500 text-white p-3 rounded-full ml-2"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Chatgroup;

