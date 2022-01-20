const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tiktokSchema = new Schema({
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
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},
    { timestamps: true }
);



module.exports = mongoose.model('ttPost', tiktokSchema);