const Agenda = require("agenda");
const User = require('../models/user');
const fetch = require('node-fetch');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/sm-scheduler';

const agenda = new Agenda({
    db: { address: dbUrl, collection: "agendaJobs" },
    processEvery: '1 minute',
    useUnifiedTopology: true
});


agenda.define('schedule instagram image post', async job => {
    const { data } = job.attrs;
    const user = await User.find({ _id: data.userID });
    let igContainer = `https://graph.facebook.com/${user[0].instaID}/media?image_url=${data.mediaPath}&caption=${caption}`;
    igContainer = encodeURIComponent(igContainer);
    console.log(igContainer);
    const containerID = await fetch(igContainer, { method: 'POST' });
    const igPublish = `graph.facebook.com/${user[0].instaID}/media_publish?creation_id=${containerID}`;
    await fetch(igPublish, { method: 'POST' });
    // console.log(data, user, user[0].instaID, caption);
});

agenda.define('schedule instagram video post', async job => {
    const { data } = job.attrs;
    const user = await User.find({ _id: data.userID });
    let igContainer = `https://graph.facebook.com/${user[0].instaID}/media?media_type=VIDEO&video_url=${data.mediaPath}&caption=${caption}`;
    igContainer = encodeURIComponent(igContainer);
    const containerID = await fetch(igContainer, { method: 'POST' });
    const igPublish = `graph.facebook.com/${user[0].instaID}/media_publish?creation_id=${containerID}`;
    await fetch(igPublish, { method: 'POST' });
    // console.log(data, user, user[0].instaID, caption);
});


(async function () {
    await agenda.start(); // Start Agenda instance

})();

module.exports = agenda;