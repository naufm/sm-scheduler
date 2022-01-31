const igPost = require('../models/instagram');
const { cloudinary } = require('../cloudinary');

const viewDate = (targetDate, zoneOffset) => {
    return new Date(targetDate.setHours(targetDate.getHours() + zoneOffset)).toISOString().slice(0, 16);
};
const amendDate = (targetDate, zoneOffset) => {
    return new Date(targetDate.setHours(targetDate.getHours() - zoneOffset)).toISOString();
};

module.exports.index = async (req, res) => {
    const posts = await igPost.find({ author: req.user._id });
    res.render('instagram/index', { posts });
}

module.exports.newPostForm = (req, res) => {
    res.render('instagram/new');
}

module.exports.createPost = async (req, res, next) => {
    const newPost = new igPost(req.body.post);
    newPost.media = req.file;
    newPost.author = req.user._id;
    const userZone = req.user.timezone;
    newPost.publishAt = amendDate(newPost.publishAt, userZone);
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
    const postTime = viewDate(post.publishAt, userZone);
    const updatedTime = viewDate(post.updatedAt, userZone);
    res.render('instagram/show', { post, postTime, updatedTime });
}

module.exports.editPostForm = async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findById(id);
    if (!post) {
        req.flash('error', 'That post does not exist!');
        return res.redirect('/instagram');
    };
    const userZone = req.user.timezone;
    const postTime = viewDate(post.publishAt, userZone);
    res.render('instagram/edit', { post, postTime });
}

module.exports.updatePost = async (req, res) => {
    const { id } = req.params;
    const currentPost = await igPost.findById(id);
    const post = await igPost.findByIdAndUpdate(id, { ...req.body.post }, { runValidators: true, new: true });
    if (req.file) {
        await cloudinary.uploader.destroy(post.media.filename);
        post.media = req.file;
    };
    const userZone = req.user.timezone;
    if (currentPost.publishAt !== post.publishAt) {
        post.publishAt = amendDate(post.publishAt, userZone);
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