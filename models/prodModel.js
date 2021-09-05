const mongoose = require("mongoose");
const Joi = require("joi");
const { random } = require("lodash");
const { number, string } = require("joi");

// const colorSchema = new mongoose.Schema({
//   colors:[{
//         color:String,
//         amount_of_size:{
//           XS: {type: Number, default: 0},
//           S: {type: Number, default: 0},
//           M: {type: Number, default: 0},
//           L: {type: Number, default: 0},
//           XL:{type: Number, default: 0},
//           XXL: {type: Number, default: 0},
//           XXXL: {type: Number, default: 0}
//         }
//   }]
// })

const prodSchema = new mongoose.Schema({
  name: String,
  info: String,
  image: String,
  price: Number,
  category_s_id: Number,
  // New one:
  isClean: {
    type: Boolean,
    default: false
  },
  quantity_sold: {
    type: Number, default: 0
  },
  properties: [{
    color: String,
    amount: {
      XS: { type: Number, default: 0 },
      S: { type: Number, default: 0 },
      M: { type: Number, default: 0 },
      L: { type: Number, default: 0 },
      XL: { type: Number, default: 0 },
      XXL: { type: Number, default: 0 },
      XXXL: { type: Number, default: 0 }
    },
    frontImg: String,
    sizeOfCanvasFront: {
      width: Number,
      height: Number
    },
    positionOfCanvasFront: {
      x: Number,
      y: Number
    },
    backImg: String,
    sizeOfCanvasBack: {
      width: Number,
      height: Number
    },
    positionOfCanvasBack: {
      x: Number,
      y: Number
    }
  }],
  // stock:[
  //  {color: string, size: string, amount:number}
  // ],
  sale: {
    onSale: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    timeInHours: { type: Number, default: 0 }
  },
  // tags:{
  //     Vshirt: {type: Number, default: 0},
  //     PoloShirt: {type: Number, default: 0},
  //     Basic: {type: Number, default: 0},
  //     OverSize: {type: Number, default: 0},
  //     Cotton:{type: Number, default: 0},
  //     Vest: {type: Number, default: 0},
  //     LongSleeves: {type: Number, default: 0},
  //     Buttoned: {type: Number, default: 0},
  //     Jacket: {type: Number, default: 0},
  //     Hoodie: {type: Number, default: 0},
  //     American: {type: Number, default: 0}
  // },
  s_id: Number,
  date_created: {
    type: Date, default: Date.now
  },
  user_id: String,
})

exports.ProdModel = mongoose.model("products", prodSchema);

// exports.validColor = (_colorData) => {
// let joiSchema = Joi.object({
//       color:Joi.string().allow(null, ''),
//       amount_of_size:Joi.object().keys({
//         XS:Joi.number().allow(null, ''),
//         S:Joi.number().allow(null, ''),
//         M:Joi.number().allow(null, ''),
//         L:Joi.number().allow(null, ''),
//         XL:Joi.number().allow(null, ''),
//         XXL:Joi.number().allow(null, ''),
//         XXXL:Joi.number().allow(null, '')
//       })
//   })

//   return joiSchema.validate(_colorData);
// }


exports.validProd = (_bodyData) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    info: Joi.string().min(2).max(500).required(),
    image: Joi.string().max(500).allow(null, ''),
    price: Joi.number().min(1).max(999999).required(),
    quantity_sold: Joi.number().min(1).max(999999).allow(null, ''),
    isClean:Joi.boolean().allow(null, ''),
    sale: Joi.object().keys({
      onSale: Joi.boolean().allow(null, ''),
      amount: Joi.number().allow(null, ''),
      timeInHours: Joi.number().allow(null, '')
    }).allow(null, ''),
    category_s_id: Joi.number().min(1).max(500).required(),
    properties: Joi.array().items({
      color: Joi.string().allow(null, ''),
      amount: Joi.object().keys({
        XS: Joi.number().allow(null, ''),
        S: Joi.number().allow(null, ''),
        M: Joi.number().allow(null, ''),
        L: Joi.number().allow(null, ''),
        XL: Joi.number().allow(null, ''),
        XXL: Joi.number().allow(null, ''),
        XXXL: Joi.number().allow(null, '')
      }),
      frontImg: Joi.string().allow(null, ''),
      sizeOfCanvasFront: Joi.object().keys({
        width: Joi.number().allow(null, ''),
        height: Joi.number().allow(null, ''),
      }),
      positionOfCanvasFront: Joi.object().keys({
        x: Joi.number().allow(null, ''),
        y: Joi.number().allow(null, '')
      }),
      backImg: Joi.string().allow(null, ''),
      sizeOfCanvasBack: Joi.object().keys({
        width: Joi.number().allow(null, ''),
        height: Joi.number().allow(null, ''),
      }),
      positionOfCanvasBack: Joi.object().keys({
        x: Joi.number().allow(null, ''),
        y: Joi.number().allow(null, '')
      })
      // tags:Joi.array().items(Joi.string()).max(500).allow(null, ''),
      // sizes_available:Joi.object().keys({
      //   XS:Joi.number().allow(null, ''),
      //   S:Joi.number().allow(null, ''),
      //   M:Joi.number().allow(null, ''),
      //   L:Joi.number().allow(null, ''),
      //   XL:Joi.number().allow(null, ''),
      //   XXL:Joi.number().allow(null, ''),
      //   XXXL:Joi.number().allow(null, '')
      // }).required()
    })
  })
  return joiSchema.validate(_bodyData);
}

// פונקציה שמייצרת מספר רנדומלי עד 6 ספרות
// בשביל לייצר איידי קצר
exports.generateShortId = async () => {
  let rnd;
  // משתנה בוליאן שבודק אם המספר הרנדומלי לא קיים לאף מוצר אחר
  let okFlag = false;
  while (!okFlag) {
    rnd = random(1, 999999);
    let data = await this.ProdModel.findOne({ s_id: rnd });
    // במידה והדאטא לא נמצא זה אומר שאין איי די כזה לאף
    // מוצר והוא יצא המלופ ויחזיר את המספר הרנדומלי
    if (!data) {
      okFlag = true;
    }
  }
  return rnd;
}