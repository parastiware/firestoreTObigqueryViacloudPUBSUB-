
const { PubSub } = require('@google-cloud/pubsub');
const functions = require('firebase-functions');
exports.Messagepublish = functions.database.ref('/messages/{messagesId}/newmsg/{newmsgId}').onCreate((sanpshot, event) => {
    topicName = 'YOUR_TOPIC_NAME';
    const messagedata = snapsot.val();
    const data = JSON.stringify(messagedata);
    const pubSubClient = new PubSub();
    async function publishMessage() {
        const dataBuffer = Buffer.from(data);

        const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
        console.log(`Message ${messageId} published.`);
    }

    publishMessage().catch(console.error);
    // [END pubsub_publish]
    // [END pubsub_quickstart_publisher]
});