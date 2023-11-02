const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY;

let userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  phone: String,
  address: String,
  avatar_img: String,
  favourite_designs_ids: [Number],
  self_designs_ids: [Number],
  products_bought_ids: [Number],
  date_created: {
    type: Date, default: Date.now
  },
  role: {
    type: String, default: "regular"
  },
  status: {
    type: String,
    enum: ['Pending', 'Active'],
    default: 'Pending'
  },
  confirmationCode:String
})

exports.UserModel = mongoose.model("users", userSchema);

exports.genToken = (_id) => {
  let token = jwt.sign({ _id }, secretKey, { expiresIn: "60mins" });
  return token;
}

exports.generateConfirmationCode = () => {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let confirmationCode = '';
  for (let i = 0; i < 25; i++) {
    confirmationCode += characters[Math.floor(Math.random() * characters.length)];
  }
  return confirmationCode;
}

exports.validUser = (_bodyUser) => {
  // סכמה של הצד השרת ובעצם תתבצע בדיקה בצד שרת
  // שהמידע תקין לפני שנבצע עליו שאילתא במסד נתונים
  let joiSchema = Joi.object({
    firstName: Joi.string().min(2).max(100).required(),
    lastName: Joi.string().min(2).max(100).required(),
    email: Joi.string().min(2).max(100).email().required(),
    password: Joi.string().min(2).max(100).required(),
    phone: Joi.string().min(9).max(20).allow(null, ''),
    address: Joi.string().min(2).max(200).allow(null, ''),
    avatar_img: Joi.string().min(2).max(200).allow(null, ''),
    favourite_designs_ids: Joi.array().items(Joi.number()).allow(null, ''),
    self_designs_ids: Joi.array().items(Joi.number()).allow(null, ''),
    products_bought_ids: Joi.array().items(Joi.number()).allow(null, ''),
    confirmationCode: Joi.string().allow(null, '')
  })
  // אם יש טעות יחזיר מאפיין שיש בו אירור
  return joiSchema.validate(_bodyUser);
}

exports.validEdit = (_bodyUser) => {
  let joiSchema = Joi.object({
    firstName: Joi.string().min(2).max(100).allow(null, ''),
    lastName: Joi.string().min(2).max(100).allow(null, ''),
    password: Joi.string().min(2).max(100).allow(null, ''),
    phone: Joi.string().min(9).max(20).allow(null, ''),
    address: Joi.string().min(2).max(200).allow(null, ''),
    avatar_img: Joi.string().min(2).max(200).allow(null, '')
  })
  return joiSchema.validate(_bodyUser);
}

exports.validLogin = (_bodyUser) => {
  // בדיקה בצד שרת בשביל הלוג אין שיש אימייל ופאס
  // בPAYLOAD מהצד לקוח
  let joiSchema = Joi.object({
    email: Joi.string().min(2).max(100).email().required(),
    password: Joi.string().min(2).max(100).required()
  })
  // אם יש טעות יחזיר מאפיין שיש בו אירור
  return joiSchema.validate(_bodyUser);
}