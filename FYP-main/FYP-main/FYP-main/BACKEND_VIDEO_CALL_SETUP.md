# Backend Socket Events for Video Calling

## Required Socket Events to Add to Your Backend

Add these socket event handlers to your existing Socket.IO server at `http://localhost:4000`:

```javascript
// Add these event handlers to your existing socket.io server

// 1-on-1 Video Call Events
socket.on('initiateVideoCall', (callData) => {
  console.log('Video call initiated:', callData);
  
  // Send call invitation to the receiver
  io.to(callData.receiverId).emit('incomingVideoCall', {
    ...callData,
    callId: socket.id
  });
});

socket.on('acceptVideoCall', (callData) => {
  console.log('Video call accepted:', callData);
  
  // Notify the caller that call was accepted
  io.to(callData.callerId).emit('videoCallAccepted', callData);
});

socket.on('rejectVideoCall', (callData) => {
  console.log('Video call rejected:', callData);
  
  // Notify the caller that call was rejected
  io.to(callData.callerId).emit('videoCallRejected', callData);
});

socket.on('endVideoCall', (callData) => {
  console.log('Video call ended:', callData);
  
  // Notify all participants that call ended
  if (callData.isGroupCall) {
    socket.to(callData.groupId).emit('videoCallEnded', callData);
  } else {
    io.to(callData.callerId).emit('videoCallEnded', callData);
    io.to(callData.receiverId).emit('videoCallEnded', callData);
  }
});

// Group Video Call Events
socket.on('initiateGroupVideoCall', (callData) => {
  console.log('Group video call initiated:', callData);
  
  // Send call invitation to all group members
  socket.to(callData.groupId).emit('incomingVideoCall', {
    ...callData,
    callId: socket.id
  });
});

// User room management for video calls
socket.on('joinVideoRoom', (roomData) => {
  socket.join(roomData.userId);
  console.log(`User ${roomData.userId} joined video room`);
});

socket.on('leaveVideoRoom', (roomData) => {
  socket.leave(roomData.userId);
  console.log(`User ${roomData.userId} left video room`);
});
```

## Instructions:

1. **Open your backend server file** (likely `server.js` or `index.js`)

2. **Find your existing Socket.IO event handlers** (where you handle 'sendMessage', 'joinRoom', etc.)

3. **Add the above event handlers** alongside your existing ones

4. **No database changes required** - video calls are handled in real-time

5. **No new API endpoints needed** - everything is handled via Socket.IO

## Example Integration:

If your current backend socket code looks like this:

```javascript
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Your existing events
  socket.on('userOnline', (userId) => {
    // existing code...
  });

  socket.on('sendMessage', (messageData) => {
    // existing code...
  });

  // ADD THE NEW VIDEO CALL EVENTS HERE
  socket.on('initiateVideoCall', (callData) => {
    // ... video call code from above
  });
  
  // ... rest of video call events
});
```

## Testing:

1. Start your backend server
2. Start your frontend (`npm run dev`)
3. Login with two different users in two browser windows
4. Try clicking the "Video Call" button in a chat

The video call should open Jitsi Meet in a modal window!
