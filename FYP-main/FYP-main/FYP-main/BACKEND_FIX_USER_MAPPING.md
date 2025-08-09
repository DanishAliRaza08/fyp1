# BACKEND FIX - User Socket Mapping Issue

## Problem Found in Logs:
```
Video call initiated: { callerId: '6860e2e85547033af89987ba', receiverId: '6873ce1ceda4f9360559903f' }
Video call failed - receiver 6873ce1ceda4f9360559903f is offline
```

The backend receives video call events but can't find the receiver's socket.

## Fix Required in Backend:

### 1. Add User Socket Mapping

Add this at the top of your server file (outside connection handler):

```javascript
// Add this at the top of your index.js file
const userSocketMap = new Map(); // Store userId -> socketId mapping

console.log('User Socket Map initialized'); // Debug log
```

### 2. Update your existing userOnline event handler:

```javascript
// MODIFY your existing userOnline event handler
socket.on('userOnline', (userId) => {
  // Add this line to map user to socket
  userSocketMap.set(userId, socket.id);
  console.log(`🟢 User ${userId} mapped to socket ${socket.id}`);
  console.log(`📊 Total online users: ${userSocketMap.size}`);
  
  // ... your existing userOnline code for status updates
});
```

### 3. Update your video call handler:

```javascript
// MODIFY your existing initiateVideoCall handler
socket.on('initiateVideoCall', (callData) => {
  console.log('Video call initiated:', callData);
  
  // Debug: Show all mapped users
  console.log('📋 Current user socket mapping:', Array.from(userSocketMap.entries()));
  
  const receiverSocketId = userSocketMap.get(callData.receiverId);
  console.log(`🔍 Looking for receiver ${callData.receiverId}`);
  console.log(`📍 Found socket ID: ${receiverSocketId}`);
  
  if (receiverSocketId) {
    io.to(receiverSocketId).emit('incomingVideoCall', {
      ...callData,
      callId: socket.id
    });
    console.log('✅ Video call invitation sent successfully');
  } else {
    console.log('❌ Video call failed - receiver not found in socket map');
    console.log('💡 Make sure receiver called userOnline event');
  }
});
```

### 4. Update disconnect handler:

```javascript
// MODIFY your existing disconnect handler
socket.on('disconnect', () => {
  console.log('Socket disconnected:', socket.id);
  
  // Remove user from socket mapping
  for (let [userId, socketId] of userSocketMap.entries()) {
    if (socketId === socket.id) {
      userSocketMap.delete(userId);
      console.log(`🔴 User ${userId} removed from socket map`);
      break;
    }
  }
  
  console.log(`📊 Remaining online users: ${userSocketMap.size}`);
  
  // ... your existing disconnect code
});
```

## 5. Frontend Check - Make sure this runs:

Verify in your frontend (ChatMain.jsx) this code is running:

```javascript
useEffect(() => {
  const userId = localStorage.getItem("Cuserid");
  if (userId) {
    socket.emit("userOnline", userId); // This must be called!
    console.log('Frontend sent userOnline for:', userId);
  }
}, []);
```

## Test Steps:

1. **Add the above code to backend**
2. **Restart backend server**
3. **Open two browser windows**
4. **Login with different users in each**
5. **Check backend logs for**:
   ```
   🟢 User 6860e2e85547033af89987ba mapped to socket YPgqGysSGsU-R7PWAAAB
   🟢 User 6873ce1ceda4f9360559903f mapped to socket ohwirLeLPqCuTyX4AAAD
   📊 Total online users: 2
   ```
6. **Try video call again**

## Expected Backend Logs After Fix:
```
🟢 User 6860e2e85547033af89987ba mapped to socket YPgqGysSGsU-R7PWAAAB
🟢 User 6873ce1ceda4f9360559903f mapped to socket ohwirLeLPqCuTyX4AAAD
Video call initiated: { callerId: '6860e2e85547033af89987ba', receiverId: '6873ce1ceda4f9360559903f' }
🔍 Looking for receiver 6873ce1ceda4f9360559903f
📍 Found socket ID: ohwirLeLPqCuTyX4AAAD
✅ Video call invitation sent successfully
```

## If Still Not Working:

Check frontend console for:
- "Frontend sent userOnline for: [user_id]"
- Any socket connection errors

The issue is definitely in the user socket mapping - once that's fixed, the video calls will work perfectly!
