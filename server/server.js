require('./config/config.js');

const app = require('express')();
const bodyParser = require('body-parser');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {Question} = require('./models/question');

const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/ask', (req, res) => {
    let body = _.pick(req.body, ['text', 'answer']);
    let question = new Question(body);

    question.save().then((questionRes) => {
        res.send(questionRes);
    }).catch(e => {
        res.status(400).send(e);
    })
});

app.listen(port, () => {
    console.log(`Started on port ${port}!`);
});