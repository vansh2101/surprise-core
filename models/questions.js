const mongoose = require('mongoose');

let quesSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    question: String,
    answer: String,
    manual: String,
    score: Number,
    number: Number,
});

module.exports=mongoose.model('questions', quesSchema)