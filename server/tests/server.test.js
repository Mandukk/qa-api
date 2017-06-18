const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Question} = require('./../models/question');

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
        console.log(questionText.length);
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

