const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InstagramSchema = new Schema({
    publishAt: {
        type: Date,
        required: true
    },
    imageURL: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        required: true
    },
    tags: [{
        username: String,
        x: {
            type: Number,
            default: 0
        },
        y: {
            type: Number,
            default: 0
        }
    }]
},
    { timestamps: true }
);



module.exports = mongoose.model('igPost', InstagramSchema);