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
    let igContainerUrl = `https://graph.facebook.com/${user[0].instaID}/media?image_url=${data.mediaPath}&caption=${data.caption}&access_token=${user[0].fbKey}`;
    igContainerUrl = encodeURIComponent(igContainerUrl);
    console.log(igContainerUrl);
    const getContainerID = await fetch(igContainerUrl, { method: 'POST' });
    const container = await getContainerID.json()
    console.log(container);
    const igPublish = `https://graph.facebook.com/${user[0].instaID}/media_publish?creation_id=${container.id}&access_token=${user[0].fbKey}`;
    await fetch(igPublish, { method: 'POST' });
    // console.log(data, user, user[0].instaID, caption);
});

agenda.define('schedule instagram video post', async job => {
    const { data } = job.attrs;
    const user = await User.find({ _id: data.userID });
    let igContainerUrl = `https://graph.facebook.com/${user[0].instaID}/media?media_type=VIDEO&video_url=${data.mediaPath}&caption=${data.caption}&access_token=${user[0].fbKey}`;
    igContainerUrl = encodeURIComponent(igContainerUrl);
    console.log(igContainerUrl);
    const getContainerID = await fetch(igContainerUrl, { method: 'POST' });
    const container = await getContainerID.json()
    console.log(container);
    const igPublish = `https://graph.facebook.com/${user[0].instaID}/media_publish?creation_id=${container.id}&access_token=${user[0].fbKey}`;
    await fetch(igPublish, { method: 'POST' });
    // console.log(data, user, user[0].instaID, caption);
});


(async function () {
    await agenda.start(); // Start Agenda instance

})();

module.exports = agenda;