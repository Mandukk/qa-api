require('./config/config.js');

const app = require('express')();
const bodyParser = require('body-parser');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

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
        console.log(e);
        res.status(400).send();
    })
});

app.get('/ask', (req, res) => {
    Question.find({}).then(questions => {
        if (!questions) {
            return res.status(404).send();
        }
        res.send(questions);
    }).catch(e => {
        console.log(e);
        res.status(404).send();
    })
});

app.get('/ask/:id', (req, res) => {
    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(400).send();
    }
    Question.findOne({_id: id}).then(question => {
        if (!question) {
            return res.status(404).send();
        }
        res.send(question);
    }).catch(e => {
        console.log(e);
        res.status(404).send();
    })
});

app.delete('/ask/:id', (req, res) => {
    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(400).send();
    }

    Question.findOneAndRemove({_id: id}).then(question => {
        if (!question) {
            return res.status(404).send();
        }
        res.send(question);
    }).catch(e => {
        console.log(e);
        res.status(404).send();
    });
});

app.patch('/ask/:id', (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['answer']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if (!body.answer) {
        return res.status(400).send();
    } else {
        body.answered = true;
        body.answeredAt = new Date().getTime();
    }

    Question.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then(question => {
        if (!question) {
            return res.status(404).send();
        }
        res.send(question);
    }).catch(e => {
        res.send(404).send();
    })
});

app.listen(port, () => {
    console.log(`Started on port ${port}!`);
});