# Backend Integration Prompt for Jitsi Video Calling

## Context
We have successfully integrated Jitsi Meet video calling on the frontend of our React chat application. The frontend is now ready and sends specific socket events for video calling functionality. We need to implement the corresponding backend socket event handlers.

## Current Backend Setup
- Backend runs on `http://localhost:4000`
- Uses Socket.IO for real-time communication
- Already handles: user authentication, messaging, group chats, file uploads
- Existing socket events: `userOnline`, `joinRoom`, `sendMessage`, `receiveMessage`, `joinGroup`, `sendGroupMessage`, etc.

## Required Implementation

### 1. Add these Socket.IO event handlers to your existing backend:

```javascript
// Add these to your existing socket.io connection handler
io.on('connection', (socket) => {
  // ... your existing events ...

  // ============ VIDEO CALL EVENTS ============
  
  // 1-on-1 Video Call Initiation
  socket.on('initiateVideoCall', (callData) => {
    console.log('Video call initiated:', callData);
    /*
    callData structure:
    {
      roomName: "call-uuid",
      callerId: "user_id", 
      callerName: "User Name",
      receiverId: "receiver_user_id",
      receiverName: "Receiver Name",
      isGroupCall: false,
      timestamp: "2025-08-06T..."
    }
    */
    
    // Find receiver's socket and send invitation
    const receiverSocketId = getUserSocketId(callData.receiverId); // You need to implement this
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('incomingVideoCall', {
        ...callData,
        callId: socket.id
      });
    }
  });

  // Video Call Acceptance
  socket.on('acceptVideoCall', (callData) => {
    console.log('Video call accepted:', callData);
    
    // Notify the caller
    const callerSocketId = getUserSocketId(callData.callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('videoCallAccepted', callData);
    }
  });

  // Video Call Rejection
  socket.on('rejectVideoCall', (callData) => {
    console.log('Video call rejected:', callData);
    
    // Notify the caller
    const callerSocketId = getUserSocketId(callData.callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('videoCallRejected', callData);
    }
  });

  // End Video Call
  socket.on('endVideoCall', (callData) => {
    console.log('Video call ended:', callData);
    
    if (callData.isGroupCall) {
      // For group calls, notify all group members
      socket.to(callData.groupId).emit('videoCallEnded', callData);
    } else {
      // For 1-on-1 calls, notify both participants
      const callerSocketId = getUserSocketId(callData.callerId);
      const receiverSocketId = getUserSocketId(callData.receiverId);
      
      if (callerSocketId) {
        io.to(callerSocketId).emit('videoCallEnded', callData);
      }
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('videoCallEnded', callData);
      }
    }
  });

  // Group Video Call Initiation
  socket.on('initiateGroupVideoCall', (callData) => {
    console.log('Group video call initiated:', callData);
    /*
    callData structure for group calls:
    {
      roomName: "call-uuid",
      callerId: "user_id",
      callerName: "User Name", 
      isGroupCall: true,
      groupId: "group_id",
      timestamp: "2025-08-06T..."
    }
    */
    
    // Debug: Show who's in the group room
    const groupRoom = io.sockets.adapter.rooms.get(callData.groupId);
    const membersInRoom = groupRoom ? Array.from(groupRoom) : [];
    console.log(`📊 Group ${callData.groupId} has ${membersInRoom.length} connected members:`, membersInRoom);
    
    // Send invitation to all group members except caller
    socket.to(callData.groupId).emit('incomingVideoCall', {
      ...callData,
      callId: socket.id
    });
    
    console.log(`📞 Group call invitation sent to ${membersInRoom.length - 1} members (excluding caller)`);
  });

  // Join user to their personal room for video calls
  socket.on('joinVideoRoom', (userData) => {
    socket.join(userData.userId);
    console.log(`User ${userData.userId} joined video room`);
  });

  // ... rest of your existing events ...
});
```

### 2. Implement User Socket Mapping + Auto Group Joining

You need a way to map user IDs to socket IDs AND automatically join users to their groups. Add this to your backend:

```javascript
// At the top of your server file
const userSocketMap = new Map(); // userId -> socketId

// In your connection handler
io.on('connection', (socket) => {
  
  // When user comes online (you probably already have this)
  socket.on('userOnline', async (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} mapped to socket ${socket.id}`);
    
    // 🚀 CRITICAL: Auto-join user to ALL their groups for video calls
    try {
      // Fetch all groups this user belongs to
      const userGroups = await getUserGroups(userId); // You need to implement this
      
      for (const group of userGroups) {
        socket.join(group._id);
        console.log(`🏠 User ${userId} auto-joined group ${group._id} (${group.name})`);
      }
      
      console.log(`✅ User ${userId} joined ${userGroups.length} group rooms for video calls`);
    } catch (error) {
      console.error(`❌ Failed to auto-join groups for user ${userId}:`, error);
    }
    
    // ... your existing userOnline logic
  });

  // When user disconnects
  socket.on('disconnect', () => {
    // Remove user from socket map
    for (let [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`User ${userId} removed from socket map`);
        break;
      }
    }
  });

  // Helper function to get socket ID by user ID
  function getUserSocketId(userId) {
    return userSocketMap.get(userId);
  }

  // Helper function to get user's groups (implement this based on your DB)
  async function getUserGroups(userId) {
    // Example implementation - adjust based on your database structure
    try {
      // Replace this with your actual database query
      const groups = await Group.find({ members: userId }); // MongoDB example
      // OR for SQL: SELECT * FROM groups JOIN group_members ON groups.id = group_members.group_id WHERE group_members.user_id = ?
      return groups;
    } catch (error) {
      console.error('Failed to fetch user groups:', error);
      return [];
    }
  }

  // ... your video call events here using getUserSocketId helper
});
```

### 3. Enhanced Group Room Management

Now your group management becomes automatic:

```javascript
// When user manually joins a group (this is now redundant but keep for compatibility)
socket.on('joinGroup', (groupId) => {
  socket.join(groupId);
  console.log(`Socket ${socket.id} manually joined group ${groupId}`);
  // ... your existing joinGroup logic
});

// Optional: When user leaves a group, remove them from the room
socket.on('leaveGroup', (groupId) => {
  socket.leave(groupId);
  console.log(`Socket ${socket.id} left group ${groupId}`);
});

// Optional: When a new group is created, add all members to the room
socket.on('groupCreated', async (groupData) => {
  const { groupId, memberIds } = groupData;
  
  // Add all online members to the new group room
  for (const memberId of memberIds) {
    const memberSocketId = getUserSocketId(memberId);
    if (memberSocketId) {
      const memberSocket = io.sockets.sockets.get(memberSocketId);
      if (memberSocket) {
        memberSocket.join(groupId);
        console.log(`Added user ${memberId} to new group ${groupId}`);
      }
    }
  }
});
```

## Testing the Integration

### Frontend Events Being Sent:
- `initiateVideoCall` - When user clicks "Video Call" in 1-on-1 chat
- `initiateGroupVideoCall` - When user clicks "Video Call" in group chat  
- `acceptVideoCall` - When user accepts incoming call
- `rejectVideoCall` - When user rejects incoming call
- `endVideoCall` - When user ends active call

### Backend Events to Emit:
- `incomingVideoCall` - Send to receiver when call is initiated
- `videoCallAccepted` - Send to caller when call is accepted
- `videoCallRejected` - Send to caller when call is rejected  
- `videoCallEnded` - Send to participants when call ends

## Implementation Steps:

1. **Locate your Socket.IO server file** (probably `server.js`, `index.js`, or similar)

2. **Find your existing `io.on('connection', (socket) => {` block**

3. **Add the user socket mapping logic** with auto-group joining at the top

4. **Implement the `getUserGroups(userId)` function** based on your database structure:
   ```javascript
   // For MongoDB/Mongoose:
   async function getUserGroups(userId) {
     return await Group.find({ members: userId });
   }
   
   // For SQL/MySQL:
   async function getUserGroups(userId) {
     const query = `
       SELECT g.* FROM groups g 
       JOIN group_members gm ON g.id = gm.group_id 
       WHERE gm.user_id = ?
     `;
     return await db.query(query, [userId]);
   }
   ```

5. **Add all the video call event handlers** inside the connection block

6. **Test with frontend** - Now group video calls should work even if users haven't opened the group chat!

## Expected Backend Logs After Fix:
```
User 6860e2e85547033af89987ba mapped to socket boOlzVHQ_dz4lX0PAAAF
🏠 User 6860e2e85547033af89987ba auto-joined group 507f1f77bcf86cd799439011 (Project Team)
🏠 User 6860e2e85547033af89987ba auto-joined group 507f1f77bcf86cd799439012 (Family Chat)
✅ User 6860e2e85547033af89987ba joined 2 group rooms for video calls
Group video call initiated: { groupId: '507f1f77bcf86cd799439011', callerId: '6860e2e85547033af89987ba' }
📞 Sending group call invitation to all members in room 507f1f77bcf86cd799439011
```

## No Database Changes Required
- Video calls are real-time only
- No need to store call history (unless you want to)
- All handled through Socket.IO events

## Security Considerations (Optional Enhancements)
```javascript
// Add user verification to video call events
socket.on('initiateVideoCall', async (callData) => {
  // Verify caller is authenticated
  const userId = getUserIdFromSocket(socket); // implement this
  if (userId !== callData.callerId) {
    socket.emit('error', { message: 'Unauthorized call attempt' });
    return;
  }
  
  // Verify receiver exists and is online
  const receiverExists = await checkUserExists(callData.receiverId);
  if (!receiverExists) {
    socket.emit('videoCallFailed', { message: 'User not found' });
    return;
  }
  
  // Continue with call logic...
});
```

## Expected Result
After implementing this backend code:
- Users can initiate video calls from chat headers
- Receivers get call invitations in real-time
- Video calls open in Jitsi Meet modal
- Both 1-on-1 and group calls work
- Call rejection/ending works properly

The frontend is already complete and waiting for these backend events!
