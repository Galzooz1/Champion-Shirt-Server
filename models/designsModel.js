const mongoose = require("mongoose");
const Joi = require("joi");
const {random} = require("lodash");

const designSchema = new mongoose.Schema({
    s_id:Number,
    name:String,
    image:String,
    price:{type:Number, default:0},
    info:String,
    width:Number,
    height:Number,
    likes:{
        type:Number, default:0
    },
    date_created:{
        type:Date, default:Date.now
      },
    user_id:String
})

exports.DesignModel = mongoose.model("designs",designSchema);

exports.validDesign = (_bodyData) => {
    let joiSchema = Joi.object({
        name:Joi.string().min(2).max(50).required(),
        image:Joi.string().max(500).allow(null, ''),
        width:Joi.number().required(),
        height:Joi.number().required(),
        info:Joi.string().min(2).max(500).allow(null, ''),
        likes:Joi.number().min(1).max(9999999).allow(null, ''),
        price:Joi.number().min(1).max(9999999).allow(null, ''),
    })

    return joiSchema.validate(_bodyData);
}

// פונקציה שמייצרת מספר רנדומלי עד 6 ספרות
// בשביל לייצר איידי קצר
exports.generateShortId = async () => {
    let rnd;
    // משתנה בוליאן שבודק אם המספר הרנדומלי לא קיים לאף מוצר אחר
    let okFlag = false;
    
    // while(okFlag == false){
    while(!okFlag){
      rnd = random(1,999999);
      let data = await this.DesignModel.findOne({s_id:rnd});
      // במידה והדאטא לא נמצא זה אומר שאין איי די כזה לאף
      // מוצר והוא יצא המלופ ויחזיר את המספר הרנדומלי
      if(!data){
        okFlag = true;
      }
    }
    return rnd;
  }