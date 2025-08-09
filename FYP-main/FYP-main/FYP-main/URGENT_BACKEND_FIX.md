# URGENT: Backend Video Call Fix

## Problem
- Video call button works (opens Jitsi)
- But receiver doesn't get call notification
- Backend missing socket event handlers

## Quick Fix for Backend Developer

Add this code to your Socket.IO server file:

```javascript
// ADD THIS TO YOUR EXISTING SOCKET.IO SERVER

// At the top of your server file (outside connection handler)
const userSocketMap = new Map(); // Store userId -> socketId mapping

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // MODIFY your existing userOnline event to include socket mapping
  socket.on('userOnline', (userId) => {
    // Add this line to your existing userOnline handler
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} mapped to socket ${socket.id}`);
    
    // ... your existing userOnline code
  });

  // ADD these new video call event handlers
  socket.on('initiateVideoCall', (callData) => {
    console.log('🔥 Video call initiated:', callData);
    
    const receiverSocketId = userSocketMap.get(callData.receiverId);
    console.log(`📞 Looking for receiver ${callData.receiverId}, found socket: ${receiverSocketId}`);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('incomingVideoCall', {
        ...callData,
        callId: socket.id
      });
      console.log('✅ Call invitation sent to receiver');
    } else {
      console.log('❌ Receiver not found or offline');
    }
  });

  socket.on('acceptVideoCall', (callData) => {
    console.log('✅ Video call accepted:', callData);
    const callerSocketId = userSocketMap.get(callData.callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('videoCallAccepted', callData);
    }
  });

  socket.on('rejectVideoCall', (callData) => {
    console.log('❌ Video call rejected:', callData);
    const callerSocketId = userSocketMap.get(callData.callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('videoCallRejected', callData);
    }
  });

  socket.on('endVideoCall', (callData) => {
    console.log('📞 Video call ended:', callData);
    const callerSocketId = userSocketMap.get(callData.callerId);
    const receiverSocketId = userSocketMap.get(callData.receiverId);
    
    if (callerSocketId) {
      io.to(callerSocketId).emit('videoCallEnded', callData);
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('videoCallEnded', callData);
    }
  });

  // MODIFY your existing disconnect handler
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    
    // Add this to remove user from socket mapping
    for (let [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`User ${userId} removed from socket map`);
        break;
      }
    }
    
    // ... your existing disconnect code
  });

  // ... rest of your existing events
});
```

## Test Steps:
1. Add above code to backend
2. Restart backend server
3. Refresh both browser windows
4. Login with both users
5. Try video call again

## Expected Result:
- Caller: Jitsi opens
- Receiver: Gets call invitation popup
- Both can join the same Jitsi room

## Debug Tips:
Check backend console for these logs:
- "🔥 Video call initiated"
- "📞 Looking for receiver"
- "✅ Call invitation sent to receiver"
