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
    const user = await User.find(data.author);
    // const igContainer = `https://graph.facebook.com/${user.instaID}/media
    // ?image_url=${data.media.path}
    // &caption=${data.caption}`;
    // const containerID = await fetch(igContainer, { method: 'POST' });
    // const igPublish = `graph.facebook.com/${user.instaID}/media_publish?creation_id=${containerID}`;
    // await fetch(igPublish, { method: 'POST' });
    console.log(data, user.instaID);
});

agenda.define('schedule instagram video post', async job => {
    const { data } = job.attrs;
    const user = await User.find(data.author);
    // const igContainer = `https://graph.facebook.com/${user.instaID}/media
    // ?media_type=VIDEO
    // &video_url=${data.media.path}
    // &caption=${data.caption}`;
    // const containerID = await fetch(igContainer, { method: 'POST' });
    // const igPublish = `graph.facebook.com/${user.instaID}/media_publish?creation_id=${containerID}`;
    // await fetch(igPublish, { method: 'POST' });
    console.log(data, user.instaID);
});


(async function () {
    await agenda.start(); // Start Agenda instance

})();

module.exports = agenda;