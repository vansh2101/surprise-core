const mongoose = require('mongoose');

let logSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: String,
    question: Number,
    ans: String,
    status: String
});

module.exports=mongoose.model('logs', logSchema)