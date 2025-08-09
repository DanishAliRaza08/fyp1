 
import ChatHeader from './ChatHeader';
import { useEffect, useRef, useState } from 'react';
// import socket from '../socket';
import axios from 'axios';
import socket, { URL } from '../constant/utils';
import { FaDownload, FaMicrophone, FaPaperclip, FaPaperPlane, FaRegCopy, FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { useParams } from 'react-router-dom';
 import { format, isToday, isYesterday, formatDistanceToNow, parseISO } from 'date-fns';
 
const ChatWindow = ({ userId, user }) => {
   

  
  const inputRef = useRef(null);
  const [messages, setMessages] = useState([]);
  console.log(messages, "messages DAtABASE");
  
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState('');
    
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const [voiceBlob, setVoiceBlob] = useState(null);
console.log(voiceBlob,"plplplppllpl");

const [recording, setRecording] = useState(false);
const [stream, setStream] = useState(null);


  const senderId = localStorage.getItem('Cuserid');
  // const receiverId = localStorage.getItem('recevierID');
// voice start
const [mediaRecorder, setMediaRecorder] = useState(null);
const [audioChunks, setAudioChunks] = useState([]);

const toggleRecording = async () => {
  if (!recording) {
    // Start Recording
    const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(userStream);
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      setVoiceBlob(audioBlob);
      setStream(null); // clear stream
    };

    recorder.start();
    setMediaRecorder(recorder);
    setAudioChunks(chunks);
    setStream(userStream);
    setRecording(true);
  } else {
    // Stop Recording
    mediaRecorder.stop();
    stream.getTracks().forEach(track => track.stop()); // stop mic access
    setRecording(false);
  }
};



  // voice END
const  receiverId= userId
  useEffect(() => {
    if (!senderId || !receiverId) return;

    // Join socket room
    socket.emit('joinRoom', { senderId, receiverId });

    // Load previous messages
    axios.get(`${URL}/api/messages?senderId=${senderId}&receiverId=${receiverId}`)
      .then(res => setMessages(res.data));

    // Set up socket listener for incoming messages
    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [receiverId]);

  const handleEmojiClick = (emojiData) => {
    setInputText((prevInput) => prevInput + emojiData.emoji);
    setShowEmojiPicker(false);
      setTimeout(() => {
    inputRef.current?.focus();
  }, 0);
  };

   
const handleSend = async () => {
  // if (!inputText.trim() && !file) return;
if (!inputText.trim() && !file && !voiceBlob) return; 
  const formData = new FormData();
  formData.append('senderId', senderId);
  formData.append('receiverId', receiverId);
  formData.append('content', inputText);
  if (file) {
    formData.append('file', file);
  }
if (voiceBlob) formData.append('voice', voiceBlob);

  try {
    const res = await axios.post(`${URL}/api/messages`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    socket.emit('sendMessage', res.data);
    // socket.emit('sendMessage', res.data);
    // setMessages(prev => [...prev, res.data]); 
    setInputText('');
    setFile(null);
    setVoiceBlob(null);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

  const handleAttachFile = (event) => {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    setFile(selectedFile);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100)
    // setInputText(`[File attached: ${selectedFile.name}]`);
  }
};
const formatDateLabel = (date) => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy'); // e.g. June 28, 2025
};

let lastMessageDate = null;


const handleCopy = async (value) => {
  try {
    await navigator.clipboard.writeText(value);
    alert('Copied!');
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

 const copyImageToClipboard = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const data = [new ClipboardItem({ [blob.type]: blob })];
    await navigator.clipboard.write(data);
    alert('Image copied to clipboard!');
  } catch (error) {
    console.error('Copy failed', error);
    alert('Copy failed');
  }
};


  return (
    <div className="flex flex-col h-full">
      <ChatHeader userId={userId} isGroupChat={false} />
       
      <div className="flex-1 overflow-y-auto p-4">
    {messages.map((m, i) => {
      const isMe = m.senderId === senderId;
      const messageDate = new Date(m.timestamp);
      const showDateLabel =
        !lastMessageDate || format(messageDate, 'yyyy-MM-dd') !== format(lastMessageDate, 'yyyy-MM-dd');

      lastMessageDate = messageDate;

      return (
        <div key={i}>
          {/* Centered Date Label */}
          {showDateLabel && (
            <div className="flex justify-center my-4">
              <span className="bg-gray-300 text-gray-800 px-3 py-1 rounded-full text-sm shadow">
                {formatDateLabel(messageDate)}
              </span>
            </div>
          )}

          {/* Chat bubble */}
          <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
            <span
              className={`px-3 py-2 rounded-lg max-w-sm break-words ${
                isMe ? 'bg-blue-400 text-white' : 'bg-gray-200 text-black'
              }`}
            >
              {/* If image exists */}
              {/* {m.file && (
                <div className="mt-2 max-w-[300px]">
                  <img src={m.file} alt="sent media" className="rounded-md" />
                </div>
              )} */}
              {/* Other file types (e.g. PDF, ZIP, DOC, etc.) */}
{m.file && m.file.match(/\.(jpe?g|png|gif|bmp|svg)$/i) && (
  <div className="mt-2 relative group">
    <img src={m.file} alt="sent media" className="rounded-md max-w-[200px]" />

    {/* Download button */}
    <a
      href={m.file}
      download
      className="absolute bottom-1 left-1 bg-white rounded-full p-1 shadow-md group-hover:block"
      title="Download image"
    >
      <FaDownload />
    </a>

    {/* Copy actual image */}
    {/* <button
      onClick={() => copyImageToClipboard(m.file)}
      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hidden group-hover:block"
      title="Copy image"
    >
      <FaRegCopy />
    </button> */}
  </div>
)}


{m.file && !m.file.endsWith('.webm') && !m.file.match(/\.(jpe?g|png|gif|bmp|svg)$/i) && (
  <div className="mt-2">
    <a
      href={m.file}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline text-sm"
    >
      <FaDownload /> Download {m.file.split('/').pop()}
    </a>
  </div>
)}


              {/* Message content */}
              {/* {m.content} */}
              {m.content && (
  <div className="flex items-center space-x-1">
    <span>{m.content}</span>
    <button
      onClick={() => handleCopy(m.content)}
      className="ml-1 text-white text-xs hover:text-yellow-300"
      title="Copy text"
    >
      <FaRegCopy />
    </button>
  </div>
)}

            
  


              {/* Voice message */}
              {m.voice && (
                <div className="mt-2">
                  <audio controls className="max-w-xs">
                    <source src={m.voice} type="audio/webm" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {/* Timestamp (time only) */}
              <div className="text-[10px]  text-black mt-1 text-right">
                {format(messageDate, 'hh:mm a')}
              </div>
            </span>
          </div>
        </div>
      );
    })}
  </div>

      <div className="flex items-center p-3 border-t border-gray-200 bg-white relative">
        {/* Hidden File Input */}
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleAttachFile}
        />

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

    

<div className="relative flex-1 mx-2">

{/* {file && (
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
  )} */}


  <div className="flex items-center space-x-2">
 {file && (
  <div className="absolute -top-14 -left-5 z-10 bg-white bg-opacity-90 p-1 rounded shadow flex items-center max-w-[80%]">
    {file.type && file.type.startsWith("image/") ? (
      <img
        src={window.URL.createObjectURL(file)}
        alt="preview"
        className="w-14 h-14 object-cover rounded"
      />
    ) : (
      <div className="flex flex-col text-sm text-gray-700 truncate max-w-[200px]">
        <span className="font-medium">{file.name}</span>
        <span className="text-xs text-gray-500">{file.type || "Unknown file type"}</span>
      </div>
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

</div>


  <textarea
   ref={inputRef}
    placeholder="Type a message..."
    className="overflow-y-auto w-full border px-4 py-1.5 focus:outline-none flex items-center border-gray-300 rounded-2xl resize-none"
    value={inputText}
    onChange={(e) => setInputText(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }}
    rows={2} 
  />

  
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
      Your browser does not support the audio element.
    </audio>
    <button
      onClick={() => setVoiceBlob(null)}
      className="text-red-500 hover:text-red-700"
    >
      ✖
    </button>
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
          className="bg-blue-500 text-white p-3 rounded-full"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
