const mongoose = require("mongoose");
const { random } = require("lodash");
const Joi = require("joi");


const categorySchema = new mongoose.Schema({
  s_id:Number,
  name:String,
  info:String,
  date_created:{
    type:Date, default:Date.now
  }
})

exports.CategoryModel = mongoose.model("categories",categorySchema);

exports.validCategory = (_bodyData) => {
  let joiSchema = Joi.object({
    name:Joi.string().min(2).max(100).required(),
    info:Joi.string().min(2).max(500).allow(null, ''),
  })
  return joiSchema.validate(_bodyData);
}

exports.generateShortId = async () => {
  let rnd;
  // משתנה בוליאן שבודק אם המספר הרנדומלי לא קיים לאף מוצר אחר
  let okFlag = false;
  while (!okFlag) {
    rnd = random(1, 99);
    let data = await this.CategoryModel.findOne({ s_id: rnd });
    // במידה והדאטא לא נמצא זה אומר שאין איי די כזה לאף
    // מוצר והוא יצא המלופ ויחזיר את המספר הרנדומלי
    if (!data) {
      okFlag = true;
    }
  }
  return rnd;
}