const express = require('express');
const router = express.Router();
const {smSchema} = require('../joiSchemas')
const catchAsync = require('../utilities/catchAsync')
const ExpressError = require('../utilities/ExpressError')
const ttPost = require('../models/tiktok');


const validatePosts = (req, res, next) => {
    const { error } = smSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


router.get('/', catchAsync(async (req, res) => {
    const posts = await ttPost.find({});
    res.render('tiktok/index', { posts });
}));

// CREATE NEW OBJECT
router.get('/new', (req, res) => {
    res.render('tiktok/new');
});

router.post('/', validatePosts, catchAsync(async (req, res, next) => {
    const newPost = new ttPost(req.body.post);
    await newPost.save();
    req.flash('success', 'Your post has been scheduled.')
    res.redirect(`tiktok/${newPost._id}`)
}));

// SHOW OBJECT DETAILS
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await ttPost.findById(id);
    if(!post) {
        req.flash('error', 'That post does not exist!');
        return res.redirect('/instagram');
    }
    res.render('tiktok/show', { post });
}));

// EDIT OBJECTS
router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await ttPost.findById(id);
    if(!post) {
        req.flash('error', 'That post does not exist!');
        return res.redirect('/instagram');
    }
    res.render('tiktok/edit', { post });
}));

// PUT replaces the object with a new object. PATCH updates parts of the object.
router.put('/:id', validatePosts, catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await ttPost.findByIdAndUpdate(id, { ...req.body.post }, { runValidators: true, new: true });
    req.flash('success', 'Your post has been updated.')
    res.redirect(`/tiktok/${post._id}`);
}));

// DELETE OBJECTS
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await ttPost.findByIdAndDelete(id);
    req.flash('success', 'Your post has been deleted.')
    res.redirect(`/tiktok`);
}));

module.exports = router;