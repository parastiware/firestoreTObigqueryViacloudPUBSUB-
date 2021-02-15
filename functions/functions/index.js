const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp()

// const db = admin.firestore()

// exports.answerSubmit = functions.https.onCall((data, context) => {
//     var userDoc = admin.firestore().collection('users').doc(context.auth.token.user_id)
//     db.collection('questions').doc(data.question.questionId).collection('correctAnswer').get().then((result) => {
//         var correctAnswer = result.docs[0].data()
//         console.log(`correct answer given? ${correctAnswer.answer} === ${data.answer}: ${correctAnswer.answer === data.answer}`)
//         data.isAnswerCorrect = correctAnswer.answer === data.answer
//         userDoc.set(context.auth.token)
//         userDoc.collection('answers').doc().set(data)
//         return data
//     }).catch((err) => {
//         console.error(`An error occurred: ${err}`)
//     })

//     return {
//         message: 'Your answer has been recorded.'
//     }
// })
const { PubSub } = require('@google-cloud/pubsub');
const grpc = require('grpc');
const pubsubClient = new PubSub({ grpc });
// Publish a message to Cloud Pub/Sub topic
// https://firebase.google.com/docs/functions/firestore-events
exports.publishMessageToTopic = functions.firestore.document('childern/{childernId}').onCreate((snap, context) => {
    //add the userId to the object
    let childrenDocument = Object.assign({}, snap.data());

    // convert the answerDocument to data buffer
    const childrenDocumentString = JSON.stringify(childrenDocument);
    console.log(`answerDocumentString=${childrenDocumentString}`);
    const dataBuffer = Buffer.from(childrenDocumentString);

    // The name for the new topic
    const topicName = 'publishMessage';

    // Creates the new topic
    return pubsubClient.topic(topicName).publish(dataBuffer)
        .then(messageId => {
            console.log(`Message ${messageId} published.`);
            return messageId;
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
});


const pubsubClient1 = new PubSub({ grpc });

exports.publishMessageToTopic1 = functions.firestore.document('childern/{childernId}/intervenetion_form/{intervenetion_formId}').onCreate((snap, context) => {
    //add the userId to the object
    let childrenDocument1 = Object.assign({}, snap.data());

    // convert the answerDocument to data buffer
    const childrenDocumentString1 = JSON.stringify(childrenDocument1);
    console.log(`answerDocumentString=${childrenDocumentString}`);
    const dataBuffer1 = Buffer.from(childrenDocumentString1);

    // The name for the new topic
    const topicName1 = 'publishMessage1';

    // Creates the new topic
    return pubsubClient1.topic(topicName1).publish(dataBuffer1)
        .then(messageId => {
            console.log(`Message ${messageId} published.`);
            return messageId;
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
});
