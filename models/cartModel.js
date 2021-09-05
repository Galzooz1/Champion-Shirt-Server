const mongoose = require("mongoose");
const Joi = require("joi");

const cartSchema = new mongoose.Schema({
    user_id:String,
    carts_ar:[String],
    totalprice:Number,
    status:{
        type:String, default:"pending"
    },
    invoice_id:String,
    comments:String,
    user_design:String,
    date_created:{
        type:Date, default:Date.now
    }
})

exports.CartModel = mongoose.model("carts", cartSchema);

exports.validCart = (_bodyData) => {
    let joiSchema = Joi.object({
        carts_ar:Joi.array().items(Joi.string()).min(2).max(99999).required(),
        totalprice:Joi.number().min(1).required(),
        comments:Joi.string().min(2).max(500).allow(null, ''),
        user_design:Joi.string().max(2000).allow(null, '')
    })

    return joiSchema.validate(_bodyData);
}