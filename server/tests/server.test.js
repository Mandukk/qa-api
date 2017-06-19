const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Question} = require('./../models/question');
const {questions, populateQuestions} = require('./seed/seed');

beforeEach(populateQuestions);

describe('POST /ask', () => {
    it('should create a new question', (done) => {
        const questionText = 'This is a test question';

        request(app)
            .post('/ask')
            .send({question: questionText})
            .expect(200)
            .expect(res => {
                expect(res.body.question).toBe(questionText);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Question.findOne({_id: res.body._id}).then(question => {
                    expect(question.question).toBe(questionText);
                    expect(question.answer).toBe(null);
                    expect(question.answeredAt).toBe(null);
                    expect(question.answered).toBe(false);
                    done();
                }).catch(e => done(e));
            });
    });
    it('should not create a new question if send an empty body', (done) => {
        request(app)
            .post('/ask')
            .send({})
            .expect(400)
            .expect(res => {
                expect(res.body.question).toNotExist();
            })
            .end(done);
    });
    it('should not create a new question if send a question with more than 140 chars', (done) => {
        let questionText;
        for (let i = 0; i < 141; i++) {
            questionText += 'a';
        }
        request(app)
            .post('/ask')
            .send({question: questionText})
            .expect(400)
            .expect(res => {
                expect(res.body.question).toNotExist();
            })
            .end(done);
    });
});

describe ('GET /ask', () => {
    it ('should return all the questions', (done) => {
        request(app)
            .get('/ask')
            .expect(200)
            .expect(res => {
                expect(res.body.questions.length).toBe(2);
                for (let i = 0; i < res.body.questions.length; i++){
                    expect(res.body.questions[i]._id).toBe(questions[i]._id.toHexString());
                    expect(res.body.questions[i].question).toBe(questions[i].question);
                }
            })
            .end(done);
    });
});

describe ('GET /ask/:id', () => {
    it('should return the question with the correct id', (done) => {
        request(app)
            .get(`/ask/${questions[0]._id.toHexString()}`)
            .expect(200)
            .expect(res => {
                expect(res.body.question.question).toBe(questions[0].question);
            })
            .end(done);
    });
    it ('should dont return the question with the wrong id', (done) => {
        let wrongId = new ObjectID().toHexString();
        request(app)
            .get(`/ask/${wrongId}`)
            .expect(404)
            .expect(res => {
                expect(res.body.question).toNotExist()
            })
            .end(done);
    });
    it('should not return the question with invalid id', (done) => {
        let invalidId = '123';
        request(app)
            .get(`/ask/${invalidId}`)
            .expect(404)
            .expect(res => {
                expect(res.body.question).toNotExist();
            })
            .end(done);
    });
});

describe('DELETE /ask/:id', () => {
    it('should delete the question passing the correct id', (done) => {
        request(app)
            .delete(`/ask/${questions[0]._id.toHexString()}`)
            .expect(200)
            .expect(res => {
                expect(res.body.question._id).toBe(questions[0]._id.toHexString());
                expect(res.body.question.question).toBe(questions[0].question);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Question.findById(questions[0]._id).then((question) => {
                    expect(question).toNotExist();
                    done();
                }).catch((e) => done(e));
            });
    });
    it('should return 404 if question not found', (done) => {
        let wrongId = new ObjectID().toHexString();
        request(app)
            .delete(`/ask/${wrongId}`)
            .expect(404)
            .expect(res => {
                expect(res.body.question).toNotExist();
            })
            .end(done);
    });
    it('should return 404 if send invalid id', (done) => {
        let invalidId = '123';
        request(app)
            .delete(`/ask/${invalidId}`)
            .expect(404)
            .expect(res => {
                expect(res.body.question).toNotExist();
            })
            .end(done);
    })
})

