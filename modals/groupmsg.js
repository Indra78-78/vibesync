const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GROUP",
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true });

mongoose.model("GROUPMSG", groupMessageSchema);
