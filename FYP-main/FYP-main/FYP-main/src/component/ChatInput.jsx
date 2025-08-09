// src/components/ChatInput.jsx
import EmojiPicker from 'emoji-picker-react';
import React, { useRef, useState } from 'react';
import { FaCamera, FaMicrophone, FaPaperclip, FaPaperPlane, FaSmile } from 'react-icons/fa';

const ChatInput = () => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const handleEmojiClick = (emojiData) => {
    setInputText((prevInput) => prevInput + emojiData.emoji);
    setShowEmojiPicker(false);
  };

const SenderID=  localStorage.getItem("Cuserid")
console.log("SenderID", SenderID);

const ReceiverID= localStorage.getItem("recevierID")
console.log("ReceiverID", ReceiverID);
  const handleSend = () => {
    console.log('Sending message:', inputText);
    setInputText('');
  };

  const handleAttachFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Attached file:', file);
      setInputText((prevInput) => prevInput + file);
    }
  };

 
  
  return (
    <div className="flex items-center p-3 border-t border-gray-200 bg-white relative">
    {/* Hidden File Input */}
    <input
      id="file-upload"
      type="file"
      className="hidden"
      onChange={handleAttachFile}
    />

    {/* Left icons */}
    <div className="flex items-center space-x-3 mr-2">
      {/* Emoji */}
      <button
        type="button"
        onClick={() => setShowEmojiPicker((val) => !val)}
        className="text-gray-500 hover:text-blue-500"
      >
        <FaSmile size={22} />
      </button>

      {/* Attach file */}
      <label htmlFor="file-upload" className="text-gray-500 hover:text-blue-500 cursor-pointer">
        <FaPaperclip size={22} />
      </label>

    
    
    </div>

    {/* Text Input */}
    <div className="relative flex-1 mx-2">
      <input
        type="text"
        placeholder="Type a message..."
        className="w-full border px-4 py-2 focus:outline-none border-gray-300 rounded-full"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-14 left-0 z-20">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>

    
    
    <button
        onClick={handleSend}
        className="bg-blue-500 text-white p-3 rounded-full"
      >
        <FaPaperPlane />
      </button>
  </div>
  );
};

export default ChatInput;









































// // src/components/ChatInput.jsx
// import EmojiPicker from 'emoji-picker-react';
// import React, { useRef, useState } from 'react';
// import { FaCamera, FaMicrophone, FaPaperclip, FaPaperPlane, FaSmile } from 'react-icons/fa';

// const ChatInput = () => {
//   const [inputText, setInputText] = useState('');
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);

//   const handleEmojiClick = (emojiData) => {
//     setInputText((prevInput) => prevInput + emojiData.emoji);
//     setShowEmojiPicker(false);
//   };

// const SenderID=  localStorage.getItem("Cuserid")
// console.log("SenderID", SenderID);

// const ReceiverID= localStorage.getItem("recevierID")
// console.log("ReceiverID", ReceiverID);
//   const handleSend = () => {
//     console.log('Sending message:', inputText);
//     setInputText('');
//   };

//   const handleAttachFile = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       console.log('Attached file:', file);
//       setInputText((prevInput) => prevInput + file);
//     }
//   };

//   const handleOpenCamera = () => {
//     console.log('Camera clicked');
//   };

//   const handleStartRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream);
//       mediaRecorderRef.current = mediaRecorder;
//       audioChunksRef.current = [];

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorder.onstop = () => {
//         const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
//         const audioUrl = URL.createObjectURL(audioBlob);
//         console.log('Voice recording URL:', audioUrl);
//         // You can now send audioBlob to your server
//       };

//       mediaRecorder.start();
//       setIsRecording(true);
//     } catch (error) {
//       console.error('Error starting recording:', error);
//     }
//   };

//   const handleStopRecording = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     }
//   };
//   return (
//     <div className="flex items-center p-3 border-t border-gray-200 bg-white relative">
//     {/* Hidden File Input */}
//     <input
//       id="file-upload"
//       type="file"
//       className="hidden"
//       onChange={handleAttachFile}
//     />

//     {/* Left icons */}
//     <div className="flex items-center space-x-3 mr-2">
//       {/* Emoji */}
//       <button
//         type="button"
//         onClick={() => setShowEmojiPicker((val) => !val)}
//         className="text-gray-500 hover:text-blue-500"
//       >
//         <FaSmile size={22} />
//       </button>

//       {/* Attach file */}
//       <label htmlFor="file-upload" className="text-gray-500 hover:text-blue-500 cursor-pointer">
//         <FaPaperclip size={22} />
//       </label>

//       {/* Camera */}
//       <button
//         type="button"
//         onClick={handleOpenCamera}
//         className="text-gray-500 hover:text-blue-500"
//       >
//         <FaCamera size={22} />
//       </button>
//     </div>

//     {/* Text Input */}
//     <div className="relative flex-1 mx-2">
//       <input
//         type="text"
//         placeholder="Type a message..."
//         className="w-full border px-4 py-2 focus:outline-none border-gray-300 rounded-full"
//         value={inputText}
//         onChange={(e) => setInputText(e.target.value)}
//       />

//       {/* Emoji Picker */}
//       {showEmojiPicker && (
//         <div className="absolute bottom-14 left-0 z-20">
//           <EmojiPicker onEmojiClick={handleEmojiClick} />
//         </div>
//       )}
//     </div>

//     {/* Right: Microphone or Send */}
//     {inputText.trim() === '' ? (
//       <button
//         onMouseDown={handleStartRecording}
//         onMouseUp={handleStopRecording}
//         className={`bg-${isRecording ? 'red' : 'blue'}-500 text-white p-3 rounded-full`}
//       >
//         <FaMicrophone />
//       </button>
//     ) : (
//       <button
//         onClick={handleSend}
//         className="bg-blue-500 text-white p-3 rounded-full"
//       >
//         <FaPaperPlane />
//       </button>
//     )}
    
//   </div>
//   );
// };

// export default ChatInput;
