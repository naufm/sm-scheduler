const User = require('../models/user');

module.exports.registerForm = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res) => {
    try {
        const { email, username, password, timezone } = req.body;
        const user = new User({ email, username, timezone });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to SM Scheduler!');
            return res.redirect('/dashboard');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }

}

module.exports.loginForm = (req, res) => {
    res.render('users/login');
}

module.exports.login = async (req, res) => {
    const query = { username: req.body.username };
    const userZone = await User.findOneAndUpdate(query, { timezone: req.body.timezone }, { runValidators: true, new: true });
    await userZone.save();
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/dashboard'
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You have been logged out');
    res.redirect('/');
}