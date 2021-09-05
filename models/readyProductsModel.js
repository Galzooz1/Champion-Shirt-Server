const mongoose = require("mongoose");
const Joi = require("joi");
const {random} = require("lodash");
const { number } = require("joi");

const readyProductsSchema = new mongoose.Schema({
    name: String,
    info:String,
    price:Number,
    images:{
        frontImage:{
        image:String,
        width: Number,
        height: Number,
        x: Number,
        y: Number
        },
        backImage:{
        image:String,
        width: Number,
        height: Number,
        x: Number,
        y: Number
        },
    },
    product_s_id:Number,
    product_name:String,
    category_s_id:Number,
    category_name:String,
    color:String,
    size:String,
    isCart:{
        type:Boolean,
        default:false
    },
    isWish:{
        type:Boolean,
        default:false
    },
    isClean:{
        type:Boolean,
        default:false
    },
    sideToDesign:String,
    shirtDesigns:{
        front:[{
            design:{
                is_design:Boolean,
                design_s_id:Number,
                design_price:{
                    type:Number,
                    default:0
                },
                designImage:String,
                sizeOfDesign:{
                    width:Number,
                    height:Number
                },
                positionOfDesign:{
                    x:Number,
                    y:Number,
                    rotation:Number
                }
            },
            costume:{
                is_costume:Boolean,
                costumeImage:String,
                sizeOfCostume:{
                    width:Number,
                    height:Number
                },
                positionOfCostume:{
                    x:Number,
                    y:Number,
                    rotation:Number
                }
            },
        }],
        back:[{
            design:{
                is_design:Boolean,
                design_s_id:Number,
                design_price:{
                    type:Number,
                    default:0
                },
                designImage:String,
                sizeOfDesign:{
                    width:Number,
                    height:Number
                },
                positionOfDesign:{
                    x:Number,
                    y:Number,
                    rotation:Number
                }
            },
            costume:{
                is_costume:Boolean,
                costumeImage:String,
                sizeOfCostume:{
                    width:Number,
                    height:Number
                },
                positionOfCostume:{
                    x:Number,
                    y:Number,
                    rotation:Number
                }
            },
        }]
    },
    s_id: Number,
    date_created: {
        type: Date, default: Date.now
      },
      user_id: String,
})

exports.readyProductsModel = mongoose.model("ready_products", readyProductsSchema);

exports.validReadyProduct = (_bodyData) => {
    let joiSchema = Joi.object({
        name: Joi.string().min(2).max(100).allow(null, ''),
        info: Joi.string().min(2).max(500).allow(null, ''),
        price: Joi.number().min(1).max(999999).required(),
        images:Joi.object().keys({
            frontImage:Joi.object().keys({
                image: Joi.string().allow(null, ''),
                width: Joi.number().allow(null, ''),
                height: Joi.number().allow(null, ''),
                x: Joi.number().allow(null, ''),
                y: Joi.number().allow(null, ''),
            }),
            backImage:Joi.object().keys({
                image: Joi.string().allow(null, ''),
                width: Joi.number().allow(null, ''),
                height: Joi.number().allow(null, ''),
                x: Joi.number().allow(null, ''),
                y: Joi.number().allow(null, ''),
            }),
        }),
        product_s_id: Joi.number().required(),
        product_name: Joi.string().required(),
        category_s_id: Joi.number().required(),
        category_name: Joi.string().required(),
        color: Joi.string().required(),
        size:Joi.string().required(),
        isCart:Joi.boolean().allow(null, ''),
        isWish:Joi.boolean().allow(null, ''),
        isClean:Joi.boolean().required(),
        sideToDesign:Joi.string().allow(null, ''),
        shirtDesigns:Joi.object().keys({
            front:Joi.array().items({
                design:Joi.object().keys({
                    is_design:Joi.boolean().allow(null, ''),
                    design_s_id:Joi.number().allow(null, ''),
                    design_price:Joi.number().allow(null, ''),
                    designImage:Joi.string().allow(null, ''),
                    sizeOfDesign:Joi.object().keys({
                        width:Joi.number().allow(null, ''),
                        height: Joi.number().allow(null, ''),
                    }),
                    positionOfDesign:Joi.object().keys({
                        x: Joi.number().allow(null, ''),
                        y: Joi.number().allow(null, ''),
                        rotation: Joi.number().allow(null, ''),
                    })
                }),
                costume:Joi.object().keys({
                    is_costume:Joi.boolean().allow(null, ''),
                    costumeImage:Joi.string().allow(null, ''),
                    sizeOfCostume:Joi.object().keys({
                        width:Joi.number().allow(null, ''),
                        height: Joi.number().allow(null, ''),
                    }),
                    positionOfCostume:Joi.object().keys({
                        x: Joi.number().allow(null, ''),
                        y: Joi.number().allow(null, ''),
                        rotation: Joi.number().allow(null, ''),
                    })
                }),
            }),
            back:Joi.array().items({
                design:Joi.object().keys({
                    is_design:Joi.boolean().allow(null, ''),
                    design_s_id:Joi.number().allow(null, ''),
                    design_price:Joi.number().allow(null, ''),
                    designImage:Joi.string().allow(null, ''),
                    sizeOfDesign:Joi.object().keys({
                        width:Joi.number().allow(null, ''),
                        height: Joi.number().allow(null, ''),
                    }),
                    positionOfDesign:Joi.object().keys({
                        x: Joi.number().allow(null, ''),
                        y: Joi.number().allow(null, ''),
                        rotation: Joi.number().allow(null, ''),
                    })
                }),
                costume:Joi.object().keys({
                    is_costume:Joi.boolean().allow(null, ''),
                    costumeImage:Joi.string().allow(null, ''),
                    sizeOfCostume:Joi.object().keys({
                        width:Joi.number().allow(null, ''),
                        height: Joi.number().allow(null, ''),
                    }),
                    positionOfCostume:Joi.object().keys({
                        x: Joi.number().allow(null, ''),
                        y: Joi.number().allow(null, ''),
                        rotation: Joi.number().allow(null, ''),
                    })
                }),
            }),
        })
    })
    return joiSchema.validate(_bodyData);
}

exports.generateShortId = async () => {
    let rnd;
    let okFlag = false;
    while (!okFlag) {
      rnd = random(1, 999999);
      let data = await this.readyProductsModel.findOne({ s_id: rnd });
      if (!data) {
        okFlag = true;
      }
    }
    return rnd;
  }