const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 600000,
    cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

require('./modals/modal');  // Ensure these paths are correct
require('./modals/post');
require('./modals/Message');
require('./modals/conversation');
require('./modals/group');
require('./modals/groupmsg');

app.use(require('./routes/auth'));       // Ensure these paths are correct
app.use(require('./routes/createPost'));
app.use(require('./routes/user'));

const { mongoURL } = require('./keys');
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error);
  });

// Track online users
let onlineUsers = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('user_connected', (userId) => {
        onlineUsers[userId] = socket.id;
        io.emit('update_user_status', { userId, status: 'online' });
        console.log(`User ${userId} connected`);
    });

    socket.on('disconnect', () => {
        for (let userId in onlineUsers) {
            if (onlineUsers[userId] === socket.id) {
                delete onlineUsers[userId];
                io.emit('update_user_status', { userId, status: 'offline' });
                console.log(`User ${userId} disconnected`);
            }
        }
    });

    socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`User joined conversation: ${conversationId}`);
    });

    socket.on('send_message', (message) => {
        const { conversationId } = message;
        io.to(conversationId).emit('receive_message', message);
    });

    socket.on('typing', (data) => {
        const { conversationId, userName } = data;
        io.to(conversationId).emit('typing', { userName });
    });


    socket.on('CallUser', (data) => {
        io.to(data.userToCall).emit('CallUser', { signal: data.signalData, from: data.from, name: data.name });
    });

    socket.on('AcceptCall', (data) => {
        io.to(data.to).emit('CallAccepted', data.signal);
    });
});

// Define API routes here
const Conversation = require('./modals/conversation');
const Message = require('./modals/Message');
const User = require('./modals/modal');  // Ensure the correct path for the User model

// Example route to get a conversation by userId
app.get('/conversation/:userId', async (req, res) => {
    try {
        const conversations = await Conversation.find({ members: req.params.userId });
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Example route to get messages by conversationId
app.get('/message/:conversationId', async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.conversationId });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Example route to create a new message
app.post('/message', async (req, res) => {
    const newMessage = new Message(req.body);
    try {
        const savedMessage = await newMessage.save();
        res.status(200).json({ newMessage: savedMessage });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Example route to get user by userId
app.get('/user/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const frontendBuildPath = path.join(__dirname, 'frontend', 'build');
console.log('Frontend build path:', frontendBuildPath);

fs.readdir(frontendBuildPath, (err, files) => {
    if (err) {
        console.error('Error in reading directory:', err);
    } else {
        console.log('Files in frontend build directory:', files);
    }
});

app.use(express.static(frontendBuildPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(err.status || 500).send('Error: Unable to serve index.html');
        }
    });
});

server.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
});
