const jwt = require("jsonwebtoken");
const {UserModel} = require("../models/userModel");
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

exports.authToken = (req,res,next) => {
  let token = req.header("auth-token");
  if(!token){
    return res.status(400).json({msg:"you must send token in this url to get data"});
  }
  try{
    // קידוד הפוך לאובייקט שאנחנו נוכל לדבר איתו
    // שהיה שמור בהצפנה ש הטוקן
    let decodeToken = jwt.verify(token,secretKey);
    // מייצר מאפיין חדש עם המידע של היוזר בעיקר
    // האיי די שלו 
    // הסיבה שיצרנו אותו בתור מאפיין
    // כדי שהפונקציה הבאה בתור בשרשור תכיר את המאפיין
    req.userData = decodeToken;
    // יש הצלחה ועוברים לפונקציה הבאה בשרשור של הראוט
    next();
  }
  catch (err) {
    if(err instanceof jwt.JsonWebTokenError && err.message === 'jwt malformed') {
      console.log(err);
      res.status(400).json({msg:"Hey, It's Gal, JWT is malformed!"});
    } else {
      console.error('JWT verification error:', err)
    }
    console.log(err);
    res.status(400).json({msg:"token invalid or expired"});
  }
}

exports.authAdminToken = async(req,res,next) => {
  try{
    let user = await UserModel.findOne({_id:req.userData._id})
    if(user.role != "admin"){
     return res.status(401).json({msg:"You must be admin user to send here data"})
    }
    next();
  }
  catch (err) {
    console.log(err);
    res.status(401).json({msg:"err in admin"});
  }
}