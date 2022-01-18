const express = require('express');
const router = express.Router();
const {smSchema} = require('../joiSchemas')
const catchAsync = require('../utilities/catchAsync')
const ExpressError = require('../utilities/ExpressError')
const igPost = require('../models/instagram');


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
    const posts = await igPost.find({});
    res.render('instagram/index', { posts });
}));

// CREATE NEW OBJECT
router.get('/new', (req, res) => {
    res.render('instagram/new');
});

router.post('/', validatePosts, catchAsync(async (req, res, next) => {
    const newPost = new igPost(req.body.post);
    await newPost.save();
    req.flash('success', 'Your post has been scheduled.')
    res.redirect(`instagram/${newPost._id}`)
}));

// SHOW OBJECT DETAILS
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findById(id);
    if(!post) {
        req.flash('error', 'That post does not exist!');
        return res.redirect('/instagram');
    }
    res.render('instagram/show', { post });
}));

// EDIT OBJECTS
router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findById(id);
    if(!post) {
        req.flash('error', 'That post does not exist!');
        return res.redirect('/instagram');
    }
    res.render('instagram/edit', { post });
}));

// PUT replaces the object with a new object. PATCH updates parts of the object.
router.put('/:id', validatePosts, catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findByIdAndUpdate(id, { ...req.body.post }, { runValidators: true, new: true });
    req.flash('success', 'Your post has been updated.')
    res.redirect(`/instagram/${post._id}`);
}));

// DELETE OBJECTS
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await igPost.findByIdAndDelete(id);
    req.flash('success', 'Your post has been deleted.')
    res.redirect(`/instagram`);
}));

module.exports = router;