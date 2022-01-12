const Joi = require('joi');

module.exports.instaSchema = Joi.object({
    post: Joi.object({
        publishAt: Joi.date().required(),
        imageURL: Joi.string().required(),
        caption: Joi.string().required()
    }).required()
});