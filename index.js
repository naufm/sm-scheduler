const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const {instaSchema} = require('./joiSchemas')
const catchAsync = require('./utilities/catchAsync')
const ExpressError = require('./utilities/ExpressError')
const methodOverride = require('method-override');
const igPost = require('./models/igSchema');
const morgan = require('morgan');

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(morgan('dev'));


mongoose.connect('mongodb://localhost:27017/sm-scheduler', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Database Connected")
    })
    .catch(err => {
        console.log("Database Connection Error")
        console.log(err)
    })


const validatePosts = (req, res, next) => {
    const { error } = instaSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


app.get('/', (req, res) => {
    res.render('home')
});

app.get('/myposts', catchAsync(async (req, res) => {
    const posts = await igPost.find({});
    res.render('myposts/index', { posts });
}));

// CREATE NEW OBJECT
app.get('/myposts/new', (req, res) => {
    res.render('myposts/new');
});

app.post('/myposts', validatePosts, catchAsync(async (req, res, next) => {
    const newPost = new igPost(req.body.post);
    await newPost.save();
    res.redirect(`myposts/${newPost._id}`)
}));

// SHOW OBJECT DETAILS
app.get('/myposts/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findById(id);
    res.render('myposts/show', { post });
}));

// EDIT OBJECTS
app.get('/myposts/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findById(id);
    res.render('myposts/edit', { post });
}));

// PUT replaces the object with a new object. PATCH updates parts of the object.
app.put('/myposts/:id', validatePosts, catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findByIdAndUpdate(id, { ...req.body.post }, { runValidators: true, new: true });
    res.redirect(`/myposts/${post._id}`);
}));

// DELETE OBJECTS
app.delete('/myposts/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await igPost.findByIdAndDelete(id);
    res.redirect(`/myposts`);
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = 'Something went wrong!'
    }
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log("Serving on Port 3000.");
});