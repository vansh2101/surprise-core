const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    school: String,
    password: String,
    leaderboard: {type: Boolean, default: 'yes'},
    score: {type: Number, default: 0},
    admin: Boolean
});

module.exports=mongoose.model('users', userSchema)