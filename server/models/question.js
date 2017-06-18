const mongoose = require('mongoose');

let QuestionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        maxlength: 140,
    },
    answer: {
        type: String,
        required: true
    }
});

let Question = mongoose.model('Question', QuestionSchema);

module.exports = {
    Question
};