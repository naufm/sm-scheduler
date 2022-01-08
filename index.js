const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const igPost = require('./models/igSchema.js');
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


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/myposts', async (req, res) => {
    const posts = await igPost.find({});
    res.render('myposts/index', { posts });
})

// CREATE NEW OBJECT
app.get('/myposts/new', (req, res) => {
    res.render('myposts/new');
})

app.post('/myposts', async (req, res) => {
    const newPost = new igPost(req.body.post);
    await newPost.save();
    res.redirect(`myposts/${newPost._id}`)
})

// SHOW OBJECT DETAILS
app.get('/myposts/:id', async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findById(id);
    res.render('myposts/show', { post });
})

// EDIT OBJECTS
app.get('/myposts/:id/edit', async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findById(id);
    res.render('myposts/edit', { post });
})

// PUT replaces the object with a new object. PATCH updates parts of the object.
app.put('/myposts/:id', async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findByIdAndUpdate(id, {...req.body.post}, { runValidators: true, new: true });
    res.redirect(`/myposts/${post._id}`);
})

// DELETE OBJECTS
app.delete('/myposts/:id', async (req, res) => {
    const { id } = req.params;
    await igPost.findByIdAndDelete(id);
    res.redirect(`/myposts`);
})

app.listen(3000, () => {
    console.log("Serving on Port 3000.");
})