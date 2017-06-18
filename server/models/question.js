const mongoose = require('mongoose');

let QuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        maxlength: 140,
    },
    answer: {
        type: String,
        default: null
    },
    answered: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Number,
        default: new Date().getTime()
    },
    answeredAt: {
        type: Number,
        default: null
    }
});

let Question = mongoose.model('Question', QuestionSchema);

module.exports = {
    Question
};