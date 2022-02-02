const igPost = require('../models/instagram');
const { cloudinary } = require('../cloudinary');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const positiveOffset = (targetDate, zoneOffset) => {
    return new Date(targetDate.setHours(targetDate.getHours() - -zoneOffset)).toISOString();
};
const negativeOffset = (targetDate, zoneOffset) => {
    return new Date(targetDate.setHours(targetDate.getHours() - zoneOffset)).toISOString();
};

module.exports.index = async (req, res) => {
    const posts = await igPost.find({ author: req.user._id });
    let allMedia;
    const allCookies = req.cookies;
    console.log(req.cookies);
    if (allCookies.status === "connected") {
        const shortAuk = await req.cookies.auk;
        const getAuk = await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.FB_SECRET}&access_token=${shortAuk}`)
        const auk = await getAuk.json().access_token;
        const getPages = await fetch(`https://graph.facebook.com/v12.0/me/accounts?access_token=${auk}`);
        const pageID = await getPages.json().data.id;
        const getAcc = await fetch(`https://graph.facebook.com/v12.0/${pageID}?fields=instagram_business_account&access_token=${auk}`);
        const accID = await getAcc.json().instagram_business_account.id;
        const getMedia = await fetch(`https://graph.facebook.com/v12.0/${accID}/media?fields=id,caption,media_url&access_token=${auk}`);
        allMedia = await getMedia.json().data;
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
    req.flash('success', 'Your post has been scheduled.')
    res.redirect(`instagram/${newPost._id}`)
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
    req.flash('success', 'Your post has been updated.')
    res.redirect(`/instagram/${post._id}`);
}

module.exports.deletePost = async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findById(id)
    await cloudinary.uploader.destroy(post.media.filename);
    await igPost.findByIdAndDelete(id);
    req.flash('success', 'Your post has been deleted.')
    res.redirect(`/instagram`);
}