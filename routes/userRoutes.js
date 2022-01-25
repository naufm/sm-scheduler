const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync')
const users = require('../controllers/usersCtrl');
const passport = require('passport');

// User Registration
router.route('/register')
    .get(users.registerForm)
    .post(catchAsync(users.register));

// User Login
router.route('/login')
    .get(users.loginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

// User Logout
router.get('/logout', users.logout);


module.exports = router;