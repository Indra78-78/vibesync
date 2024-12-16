const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    members: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "USER",
        validate: [arrayLimit, '{PATH} exceeds the limit of 500']
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true
    },
}, { timestamps: true });

function arrayLimit(val) {
    return val.length <= 500;
}

mongoose.model("GROUP", groupSchema);
