require('./config/config.js');

const app = require('express')();
const bodyParser = require('body-parser');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {Question} = require('./models/question');

const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/ask', (req, res) => {
    let body = _.pick(req.body, ['question']);
    let question = new Question(body);

    question.save().then((questionRes) => {
        res.send(questionRes);
    }).catch(e => {
        res.status(400).send();
        console.log(e);
    })
});

app.get('/ask', (req, res) => {
    Question.find({}).then(questions => {
        res.send(questions);
    }).catch(e => {
        res.status(404).send();
    })
});

app.listen(port, () => {
    console.log(`Started on port ${port}!`);
});