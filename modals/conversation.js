const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    members: {
        type: Array,
        required: true
    }
}, { timestamps: true });

const Conversation = mongoose.model("CONVERSATION", ConversationSchema);
module.exports = Conversation;