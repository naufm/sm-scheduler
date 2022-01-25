const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const instagramCtrl = require('../controllers/instagramCtrl');
const { isLoggedIn, validatePosts, isAuthor } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(isLoggedIn, catchAsync(instagramCtrl.index))
    .post(isLoggedIn, upload.single('media'), validatePosts, catchAsync(instagramCtrl.createPost));

router.get('/new', isLoggedIn, instagramCtrl.newPostForm);

router.route('/:id')
    .get(isLoggedIn, isAuthor, catchAsync(instagramCtrl.showPost))
    .put(isLoggedIn, isAuthor, upload.single('media'), validatePosts, catchAsync(instagramCtrl.updatePost))
    .delete(isLoggedIn, isAuthor, catchAsync(instagramCtrl.deletePost));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(instagramCtrl.editPostForm));


module.exports = router;