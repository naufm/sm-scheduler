const igPost = require('./models/instagram');
const { smSchema } = require('./joiSchemas');
const ExpressError = require('./utilities/ExpressError');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You are not signed in');
        return res.redirect('/login');
    }
    next()
}

module.exports.validatePosts = (req, res, next) => {
    const { error } = smSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const post = await igPost.findById(id);
    if (!post.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect('/instagram');
    }
    next();
}