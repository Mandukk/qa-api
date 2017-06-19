const {ObjectID} = require('mongodb');

const {Question} = require('./../../models/question');


const questionOneId = new ObjectID();
const questionTwoId = new ObjectID();
let questions = [
    {
        _id: questionOneId,
        question: 'How are you?'
    },
    {
        _id: questionTwoId,
        question: 'Are you fine?',
        answer: 'Yes I am',
        answered: true,
        answeredAt: 777
    }
];

let populateQuestions = (done) => {
    Question.remove({}).then(() => {
        return Question.insertMany(questions);
    }).then(() => done());
};

module.exports = {
    questions,
    populateQuestions
}