const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Question} = require('./../models/question');
const {User} = require('./../models/user');
const {questions, populateQuestions, users, populateUsers} = require('./seed/seed');

beforeEach(populateQuestions);
beforeEach(populateUsers);

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
    });
});

describe('PATCH /ask/:id', () => {
    it('should update the question', (done) => {
        let id = questions[0]._id.toHexString();
        let answer = 'I am fine, thanks!';

        request(app)
            .patch(`/ask/${id}`)
            .send({answer})
            .expect(200)
            .expect(res => {
                expect(res.body.question._id).toBe(id);
                expect(res.body.question.question).toBe(questions[0].question);
                expect(res.body.question.answer).toBe(answer);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Question.findById(id).then(question => {
                    expect(question.answer).toBe(answer);
                    expect(question.answered).toBe(true);
                    expect(question.answeredAt).toNotBe(null);
                    done();
                }).catch(e => done(e));
            });
    });
    it('should return 400 if answer does not exist', (done) => {
        let id = questions[0]._id.toHexString();

        request(app)
            .patch(`/ask/${id}`)
            .expect(400)
            .expect(res => {
                expect(res.body.question).toNotExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Question.findById(id).then(question => {
                    expect(question.answer).toBe(null);
                    expect(question.answered).toBe(false);
                    expect(question.answeredAt).toBe(null);
                    done();
                }).catch(e => done(e));
            });
    });
    it('should return 404 if pass invalid id', (done) => {
        let id = '123';

        request(app)
            .patch(`/ask/${id}`)
            .expect(404)
            .expect(res => {
                expect(res.body.question).toNotExist();
            })
            .end(done);
    });
    it('should return 404 if pass wrong id', (done) => {
        let id = new ObjectID().toHexString();
        let answer = 'I am fine, thanks!';

        request(app)
            .patch(`/ask/${id}`)
            .send({answer})
            .expect(404)
            .expect(res => {
                expect(res.body.question).toNotExist();
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should return 200 and create a new user', (done) => {
        let email = 'example@example.com';
        let password = '123456';
        let username = 'example';

        request(app)
            .post('/users')
            .send({email, password, username})
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
                expect(res.body.username).toBe(username);
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                }

                User.findOne({email}).then(user => {
                    expect(user.email).toBe(email);
                    expect(user.username).toBe(username);
                    expect(user.password).toNotBe(password);
                    done();
                }).catch(e => done(e));
            });
    });
});

