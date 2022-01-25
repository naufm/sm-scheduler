const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InstagramSchema = new Schema({
    publishAt: {
        type: Date,
        required: true
    },
    media: {
        path: String,
        filename: String
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
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},
    { timestamps: true }
);



module.exports = mongoose.model('igPost', InstagramSchema);