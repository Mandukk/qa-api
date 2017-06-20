const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Question} = require('./../../models/question');
const {User} = require('./../../models/user');


const questionOneId = new ObjectID();
const questionTwoId = new ObjectID();
const userOneId = new ObjectID();
const userTwoId = new ObjectID();
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

let users = [
    {
        _id: userOneId,
        username: 'Luiz',
        email: 'mandukk@example.com',
        password: 'userOnePass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.SECRET).toString()
        }]
    },
    {
        _id: userTwoId,
        username: 'Carlos',
        email: 'mandukk2@example.com',
        password: 'userTwoPass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.SECRET).toString()
        }]
    }
];

let populateUsers = (done) => {
    User.remove({}).then(() => {
        let userOne = new User(users[0]).save();
        let userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports = {
    questions,
    populateQuestions,
    users,
    populateUsers
};