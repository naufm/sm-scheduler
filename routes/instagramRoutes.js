const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const igPost = require('../models/instagram');
const { isLoggedIn, validatePosts, isAuthor } = require('../middleware');


router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    const posts = await igPost.find({author: req.user._id});
    res.render('instagram/index', { posts });
}));

// CREATE NEW OBJECT
router.get('/new', isLoggedIn, (req, res) => {
    res.render('instagram/new');
});

router.post('/', isLoggedIn, validatePosts, catchAsync(async (req, res, next) => {
    const newPost = new igPost(req.body.post);
    newPost.author = req.user._id;
    await newPost.save();
    req.flash('success', 'Your post has been scheduled.')
    res.redirect(`instagram/${newPost._id}`)
}));

// SHOW OBJECT DETAILS
router.get('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findById(id);
    if (!post) {
        req.flash('error', 'That post does not exist!');
        return res.redirect('/instagram');
    }
    res.render('instagram/show', { post });
}));

// EDIT OBJECTS
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findById(id);
    if (!post) {
        req.flash('error', 'That post does not exist!');
        return res.redirect('/instagram');
    }
    res.render('instagram/edit', { post });
}));

// PUT replaces the object with a new object. PATCH updates parts of the object.
router.put('/:id', isLoggedIn, isAuthor, validatePosts, catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findByIdAndUpdate(id, { ...req.body.post }, { runValidators: true, new: true });
    req.flash('success', 'Your post has been updated.')
    res.redirect(`/instagram/${post._id}`);
}));

// DELETE OBJECTS
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await igPost.findByIdAndDelete(id);
    req.flash('success', 'Your post has been deleted.')
    res.redirect(`/instagram`);
}));

module.exports = router;