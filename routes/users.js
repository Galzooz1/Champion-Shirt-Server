const express = require('express');
const bcrypt = require("bcrypt");
const path = require("path");
const _ = require("lodash");
// const nodemailer = require('nodemailer');
const { UserModel, validUser, validLogin, genToken, validEdit, generateConfirmationCode } = require("../models/userModel");
const { authToken, authAdminToken } = require('../middlewares/auth');
const router = express.Router();
const { random } = require("lodash");
const { sendConfirmationEmail } = require('../config/sendEmail');


//WORK
//GET users listing, only by admin
router.get('/', authToken, authAdminToken, async (req, res) => {
  let perPage = (req.query.perPage) ? Number(req.query.perPage) : 4;
  let page = (req.query.page) ? Number(req.query.page) : 0;
  let sortQ = (req.query.sort) ? req.query.sort : "_id";
  let ifReverse = (req.query.reverse == "yes") ? -1 : 1;
  try {
    // let data = await UserModel.find({},{email:1,name:1})
    // הפרמטר השני בעצם פילטר איזה מאפיינים להציג
    //  0 -> רק לא להציג אותו
    // 1 -> רק להציג אותו
    let data = await UserModel.find({}, { password: 0 })
    .sort({[sortQ]:ifReverse})
    .limit(perPage)
    .skip(page * perPage)
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

//get number of Users in data base
router.get("/count", async(req, res) => {
  try {
    // filter -> זה השאילתא
    let data = await UserModel.countDocuments()
    res.json({ count: data });
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

//WORK
//get single user by _id
router.get("/single/:_id", authToken, authAdminToken, async (req, res) => {
  try {
    let data = await UserModel.findOne({ _id: req.params._id });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }

})

//WORK
//Checking if Logged user is an admin
router.post("/checkAdmin", authToken, authAdminToken, async (req, res) => {
  res.json({ auth: "success" })
})
//Checking if Logged user
router.post("/checkUser",authToken,async(req,res) => {
  res.json({auth:"success"})
})

//WORK
//Get Self Data about user
router.get("/myInfo", authToken, async (req, res) => {
  try {
    // req.userData -> נוצר בקובץ מידלווארי אוט
    let user = await UserModel.findOne({ _id: req.userData._id }, { password: 0 });
    res.json(user);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

//WORK
//Login to system and get Token
router.post("/login", async (req, res) => {
  let validBody = validLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    // קודם בודק שבכלל קיים יוזר עם האימייל הנל
    let user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ msg: "user or password invalid 1" });
    }
    let validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
      return res.status(400).json({ msg: "user or password invalid 2" });
    }
    if (user.status != "Active") {
      return res.status(401).json({ msg: "Pending Account. Please Verify Your Email!" })
    }
    let myToken = genToken(user._id);
    res.json({ token: myToken });
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

// let transporter = nodemailer.createTransport(
//   {
//     service: 'gmail', auth: { user: configEmail.myEmail, pass: configEmail.myPassword }
//   });

// const sendEmail = (_email, _confirmationCode, name) => {
//   let mailOptions = {
//     from: configEmail.myEmail, to: _email, subject: 'Sending Email using Node.js',
//     html: `<h1>Email Confirmation</h1>
//     <h2>Hello ${name}</h2>
//     <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
//         <a href=http://localhost:3005/confirm/${_confirmationCode}> Click here</a>`
//   };

//   transporter.sendMail(mailOptions, function (error, info) {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Email sent: ' + info.response);
//     }
//   });
// }

// tempCode = Number(tempCode);
// await UserModel.updateOne({_id:user._id},{ConfirmationCode:ConfirmationCode});

// await sendEmail(user.email, ConfirmationCode, user.firstName);
//WORK
// Sign up new user
router.post("/", async (req, res) => {
  let validBody = validUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = new UserModel(req.body);
    // אנחנו נרצה דבר ראשון להגדיר את רמת האבטחה
    let salt = await bcrypt.genSalt(10);
    // זה להגדיר שהסיסמא תיהיה מוצפנת לפי רמת האבטחה שקבענו
    user.password = await bcrypt.hash(user.password, salt);
    user.confirmationCode = await generateConfirmationCode();
    await user.save();

    sendConfirmationEmail(
      user.firstName,
      user.email,
      user.confirmationCode
    )
    // TODO: show to client just the email, _id, createedAt, name
    res.status(201).json(_.pick(user, ["_id", "email", "date_created", "firstName", "confirmationCode", "role"]))
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

router.get("/confirm/:id", async (req, res) => {
  try {
    let confirmationCode = await generateConfirmationCode();
    await UserModel.updateOne({ _id: req.params.id }, { confirmationCode: confirmationCode });
    let user = await UserModel.findOne({ _id: req.params.id });
    sendConfirmationEmail(
      user.firstName,
      user.email,
      user.confirmationCode
    )
    res.json(confirmationCode)
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

//Verify User
router.get("/confirm/:confirmationCode", async (req, res) => {
  try {
    let user = await UserModel.findOne({ confirmationCode: req.params.confirmationCode });
    // if (user.confirmationCode.match(/^[0-9a-fA-F]{24}$/)) {
    //   // Yes, it's a valid ObjectId, proceed with `findById` call.
    //   console.log("work")
    // } 
    console.log(user);
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
    if (user.status == "Active") {
      return res.json({ msg: "User is already Active!" })
    }
    user.status = "Active";
    await user.save();
    res.json("User Confirm succeed!");
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err)
  }
})

//WORK
//Edit existing user
router.put("/:editId", authToken, async (req, res) => {
  let editId = req.params.editId;
  let validBody = validEdit(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = await UserModel.findOne({ _id: req.userData._id })
    if (user.role == "admin" || user._id == editId) {
      if(req.body.password){
        let salt = await bcrypt.genSalt(10);
        // זה להגדיר שהסיסמא תיהיה מוצפנת לפי רמת האבטחה שקבענו
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }
        let data = await UserModel.updateOne({ _id: editId }, req.body);
      res.status(201).json(data);
    } else {
      return res.json({ msg: "Error! You must be an admin and you can't change emails" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err)
  }
})

//upload file on edit product
router.put("/upload/:editId", authToken, async(req, res) => {
  if (req.files.fileSend) {
    let fileInfo = req.files.fileSend;
    // אוסף סיומת
    fileInfo.ext = path.extname(fileInfo.name);
    // מגדיר את המיקום של הקובץ למסד נתונים ולהעלאה
    let filePath = "/users_avatar_images/"+req.params.editId+fileInfo.ext;
    let allowExt_ar = [".jpg", ".png", ".gif", ".svg", ".jpeg"];
    if (fileInfo.size >= 5 * 1024 * 1024) {
      // ...prod -> מעבירים את המידע של הפרוד כי רק הקובץ לא עלה
      return res.status(400).json({ err: "The file is too big, you can send to 5 mb" });
    }
    else if (!allowExt_ar.includes(fileInfo.ext)) {
      return res.status(400).json({ err: "Error: stupid! You allowed to upload just images!" });
    }
    
    // מיטודה שמעלה את הקובץ
    fileInfo.mv("public"+filePath , async function(err){
      if(err){  return res.status(400).json({msg:"Error: there problem try again later , or send files just in english charts only"});}

      
    })
    // update the db with the new file
    let data = await UserModel.updateOne({ _id: req.params.editId }, {avatar_img:filePath});
    console.log(data);
    res.json(data);
  }
  else{
    res.status(400).json({msg:"need to send file if image"})
  }
})

//WORK
//Delete existing user, only by admin
router.delete("/:idDel", authToken, authAdminToken, async (req, res) => {
  let idDel = req.params.idDel;
  try {
    let data = await UserModel.deleteOne({ _id: idDel });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err)
  }
})

//WORK
//Change the role of the User, only by admin
router.patch("/changeRole/:userId", authToken, authAdminToken, async (req, res) => {
  let userId = req.params.userId;
  // check that user not change itself
  if (userId == req.userData._id) {
    return res.json({ msg: "You can't change your own role" });
  }
  // get data if admin or regular
  try {
    let userInfo = await UserModel.findOne({ _id: userId });
    let whatToChange = (userInfo.role == "admin") ? "regular" : "admin";
    let data = await UserModel.updateOne({ _id: userId }, { role: whatToChange });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

module.exports = router;
