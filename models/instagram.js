const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MediaSchema = new Schema({
    path: String,
    filename: String
});

MediaSchema.virtual('thumbnail').get(function(){
    return this.path.replace('/upload', '/upload/w_400,h_400,c_fit');
})

const InstagramSchema = new Schema({
    publishAt: {
        type: Date,
        required: true
    },
    media: MediaSchema,
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