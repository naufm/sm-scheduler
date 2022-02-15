const igPost = require('../models/instagram');
const User = require('../models/user');
const { cloudinary } = require('../cloudinary');
const fetch = require('node-fetch');
const agenda = require('../agenda/agenda')

const positiveOffset = (targetDate, zoneOffset) => {
    return new Date(targetDate.setHours(targetDate.getHours() - -zoneOffset)).toISOString();
};
const negativeOffset = (targetDate, zoneOffset) => {
    return new Date(targetDate.setHours(targetDate.getHours() - zoneOffset)).toISOString();
};

module.exports.index = async (req, res) => {
    const posts = await igPost.find({ author: req.user._id });
    const fbURL = 'https://graph.facebook.com/v12.0/'
    let allMedia;
    const allCookies = req.cookies;
    const user = await User.findById(req.user._id);
    if (allCookies.stat === "connected" && user.fbKey && user.instaID) {
        const getMedia = await fetch(`${fbURL}${user.instaID}/media?fields=id,caption,media_url,media_type&access_token=${user.fbKey}`);
        allMedia = await getMedia.json();
    } else if (allCookies.stat === "connected" && !user.fbKey) {
        const shortAuk = await req.cookies.auk;
        const getAuk = await fetch(`${fbURL}oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FB_APP_ID}&client_secret=${process.env.FB_SECRET}&fb_exchange_token=${shortAuk}`)
        const auk = await getAuk.json();
        const getPages = await fetch(`${fbURL}me/accounts?access_token=${auk.access_token}`);
        const pageID = await getPages.json();
        const getAcc = await fetch(`${fbURL}${pageID.data[0].id}?fields=instagram_business_account&access_token=${auk.access_token}`);
        const accID = await getAcc.json();
        await User.findOneAndUpdate(req.user.id, { $set: { fbKey: auk.access_token, instaID: accID.instagram_business_account.id } }, { runValidators: true, new: true });
        const getMedia = await fetch(`${fbURL}${accID.instagram_business_account.id}/media?fields=id,caption,media_url,media_type&access_token=${auk.access_token}`);
        allMedia = await getMedia.json();
    }
    res.render('instagram/index', { posts, allMedia, allCookies });
}

module.exports.newPostForm = (req, res) => {
    res.render('instagram/new');
}

module.exports.createPost = async (req, res, next) => {
    const newPost = new igPost(req.body.post);
    newPost.media = req.file;
    newPost.author = req.user._id;
    const userZone = req.user.timezone;
    newPost.publishAt = negativeOffset(newPost.publishAt, userZone);
    await newPost.save();
    if(newPost.media.path.slice(-3) === 'mp4') {
        await agenda.schedule(newPost.publishAt, 'schedule instagram video post', {postID: newPost._id, mediaPath: newPost.media.path, userID: req.user._id, caption: newPost.caption });
    } else {
        await agenda.schedule(newPost.publishAt, 'schedule instagram image post', {postID: newPost._id, mediaPath: newPost.media.path, userID: req.user._id, caption: newPost.caption });
    }
    req.flash('success', 'Your post has been scheduled.');
    res.redirect(`instagram/${newPost._id}`);
}

module.exports.showPost = async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findById(id);
    if (!post) {
        req.flash('error', 'That post does not exist!');
        return res.redirect('/instagram');
    }
    const userZone = req.user.timezone;
    positiveOffset(post.publishAt, userZone);
    positiveOffset(post.updatedAt, userZone);
    res.render('instagram/show', { post });
}

module.exports.editPostForm = async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findById(id);
    if (!post) {
        req.flash('error', 'That post does not exist!');
        return res.redirect('/instagram');
    };
    const userZone = req.user.timezone;
    positiveOffset(post.publishAt, userZone);
    res.render('instagram/edit', { post });
}

module.exports.updatePost = async (req, res) => {
    const { id } = req.params;
    const userZone = req.user.timezone;
    const newPublish = new Date(req.body.post.publishAt);
    req.body.post.publishAt = new Date(newPublish.setHours(newPublish.getHours() - userZone));
    const post = await igPost.findByIdAndUpdate(id, { ...req.body.post }, { runValidators: true, new: true });
    if (req.file) {
        await cloudinary.uploader.destroy(post.media.filename);
        post.media = req.file;
    };
    await post.save();
    await agenda.cancel({data: {postID: post._id}});
    if(post.media.path.slice(-3) === 'mp4') {
        await agenda.schedule(post.publishAt, 'schedule instagram video post', {postID: post._id, mediaPath: post.media.path, userID: req.user._id, caption: post.caption });
    } else {
        await agenda.schedule(post.publishAt, 'schedule instagram image post', {postID: post._id, mediaPath: post.media.path, userID: req.user._id, caption: post.caption });
    }
    req.flash('success', 'Your post has been updated.');
    res.redirect(`/instagram/${post._id}`);
}

module.exports.deletePost = async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findById(id);
    // const jobs = await agenda.jobs({})
    // console.log(jobs);
    // const jobs2 = await agenda.jobs({name: 'schedule instagram image post'})
    // console.log(jobs2);
    const count = await agenda.cancel({ data: [{ postID: post._id }]});
    console.log(count);
    
    // const jobs2 = await agenda.jobs({data: {}})
    // console.log(jobs2);
    // for (let job of jobs) {
    //     job.remove();
    // };
    await cloudinary.uploader.destroy(post.media.filename);
    await igPost.findByIdAndDelete(id);
    req.flash('success', 'Your post has been deleted.');
    res.redirect(`/instagram`);
}