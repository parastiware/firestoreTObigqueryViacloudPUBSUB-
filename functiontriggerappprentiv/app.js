const functions = require('firebase-functions');
const { PubSub } = require('@google-cloud/pubsub');
const admin = require('firebase-admin');
const grpc = require('grpc');
const pubsubClient = new PubSub({ grpc });
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
// Publish a message to Cloud Pub/Sub topic
// https://firebase.google.com/docs/functions/firestore-events
db.collection("children").doc("")
exports.publishInterFormsToTopic = functions.firestore
    .document('children/{childrenId}/intervention_forms/{intervention_formsId}')
    .onCreate((snap, context) => {
        let children_id = context.params.childrenId;
        console.log(children_id);
        let formDocument = Object.assign({}, snap.data());
        let newformDocument = formDocument;
        const tempid = formDocument.template_id;
        const updated_by_id = formDocument.record.updated_by;
        return db.collection('form_templates').doc(tempid).get().then(sanpShot => {
            const data = Object.assign({}, sanpShot.data());
            newformDocument.record.labels = [];
            newformDocument.record.values = [];
            newformDocument.record.records = {};
            newformDocument.record.records.labels = [];
            newformDocument.record.records.values = [];

            for (i in data.template) {
                const val_id = data.template[i].id;

                if (formDocument.record.hasOwnProperty(val_id)) {

                    for (j in data.template.template) {

                        const val_id_t = data.template[i].template[j].id;

                        if (formDocument.record.val_id.hasOwnProperty(val_id_t)) {

                            newformDocument.record.records.labels.push(data.template[i].template[j].label || data.template[i].template[j].title);
                            newformDocument.record.records.values.push(formDocument.record[val_id].val_id_t);
                            newformDocument.record.title = formDocument.record[val_id].title;
                            delete (newformDocument.record[val_id].val_id_t);

                        }
                    }



                    newformDocument.record.labels.push(data.template[i].label);
                    newformDocument.record.values.push(formDocument.record[val_id]);
                    delete (newformDocument.record[val_id]);

                }


            }
            console.log(newformDocument);
            return db.collection('children').doc(children_id).get().then(childrenData => {
                const child_data = Object.assign({}, childrenData.data());
                newformDocument.child_name = child_data.name;
                newformDocument.dob = child_data.dob;
                newformDocument.gender = child_data.gender;

                return db.collection('users').doc(updated_by_id).get().then(userdata => {
                    const user_data = Object.assign({}, userdata.data());
                    newformDocument.record.updated_by = user_data.display_name || user_data.full_name;
                    newformDocument.record.role = user_data.role || user_data.user_role;
                    newformDocument.record.email = user_data.email;
                    console.log(newformDocument);
                    const topicName = 'publishInterFormsToBQ';
                    var formDocumentString = JSON.stringify(newformDocument);
                    console.log(`formDocumentString=${formDocumentString}`);
                    const dataBuffer = Buffer.from(formDocumentString);
                    return pubsubClient.topic(topicName).publish(dataBuffer)
                        .then(messageId => {
                            console.log(`Message ${messageId} published.`);
                            return messageId;


                        }).catch(err => {
                            console.error('ERROR: IN PUBLISHING MESSAGE', err);
                        });




                }).catch(err => {
                    console.error('ERROR: IN RETRIVING USER INFORMATION', err);
                });




            }).catch(err => {
                console.error('ERROR: IN RETRIVING CHILDREN INFORMATION', err);
            });


        }).catch(err => {
            console.error('ERROR: IN RETRIVING FORM_TEMPLATE DATA', err);
        });


    })



