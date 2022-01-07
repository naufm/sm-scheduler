const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const igPost = require('./models/igSchema.js')

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));


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

app.get('/myposts/:id', async (req, res) => {
    const { id } = req.params;
    const post = await igPost.findById(id);
    res.render('myposts/show', { post });
})

// app.get('/myposts/new', (req, res) => {
//     res.render('myposts/new');
// })

app.listen(3000, () => {
    console.log("Serving on Port 3000.");
})