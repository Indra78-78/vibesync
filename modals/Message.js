mongoose = require('mongoose');

const MsgSchema = new mongoose.Schema({
    conversationId: {
        type: String,  // It should be a string, not an array
        required: true
    },
    senderId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Msg = mongoose.model("MSG", MsgSchema);
module.exports = Msg;