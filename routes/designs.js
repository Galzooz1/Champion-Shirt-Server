const express = require("express");
const path = require("path");
const { authToken, authAdminToken } = require("../middlewares/auth");
const { DesignModel, validDesign, generateShortId } = require("../models/designsModel");

const router = express.Router();

//Get all designs
router.get("/", async(req, res) => {
    // let perPage = (req.query.perPage) ? Number(req.query.perPage) : 10;
    // let page = (req.query.page) ? Number(req.query.page) : 0;
    // let sortQ = (req.query.sort) ? req.query.sort : "_id";
    // let ifReverse = (req.query.reverse == "yes") ? -1 : 1;
    try {
    let data = await DesignModel.find({})
    // .sort({[sortQ]:ifReverse})
    // .limit(perPage)
    // .skip(page * perPage)
    res.json(data);
    }
    catch (err) {
    console.log(err);
    res.status(400).json(err);
}
})

//get number of Users in data base
router.get("/count", async(req, res) => {
    try {
      // filter -> זה השאילתא
      let data = await DesignModel.countDocuments()
      res.json({ count: data });
    }
    catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
  })
  

//get single Design by s_id
router.get("/single/:s_id", async(req, res) => {
    try{
    let data = await DesignModel.findOne({ s_id: req.params.s_id });
    res.json(data);
    }catch(err){
    console.log(err);
    res.status(400).json(err);
    }
})

//WORK
//Add new Design
router.post("/", authToken, authAdminToken, async(req, res) => {
    let validBody = validDesign(req.body);
    if(validBody.error){
        return res.status(400).json(validBody.error.details);
    }
    try {
        let design = new DesignModel(req.body);
        design.user_id = req.userData._id;
        design.s_id = await generateShortId();
        await design.save();
        res.status(201).json(design);
    } catch (err) {
        
    }
})

//WORK
//Edit existing design by s_id
router.put("/:editId", authToken, authAdminToken, async(req, res) => {
    let editId = req.params.editId;
    let validBody = validDesign(req.body);
    if(validBody.error){
        return res.status(400).json(validBody.error.details);
    }
    try {
        req.body.user_id = req.userData._id;
        let data = await DesignModel.updateOne({s_id:editId}, req.body)
        res.status(201).json(data);
    } catch (err) {
        console.log(err);
        res.status(400).json(err)
    }
})

  //upload file on edit product
  router.put("/upload/:editId", authToken, authAdminToken, async(req, res) => {
    if (req.files.fileSend) {
      let fileInfo = req.files.fileSend;
      // אוסף סיומת
      fileInfo.ext = path.extname(fileInfo.name);
      // מגדיר את המיקום של הקובץ למסד נתונים ולהעלאה
      let filePath = "/designs_images/"+req.params.editId+fileInfo.ext;
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
      let data = await DesignModel.updateOne({ s_id: req.params.editId }, {image:filePath});
      console.log(data);
      res.json(data);
    }
    else{
      res.status(400).json({msg:"need to send file if image"})
    }
  })

//WORK
//Delete existing product by s_id
router.delete("/:idDel", authToken, authAdminToken, async(req, res) => {
 let idDel = req.params.idDel;
try {
    let data = await DesignModel.deleteOne({ s_id: idDel });
    res.json(data);
 }
 catch (err) {
  console.log(err);
  res.status(400).send(err)
    }
  })


module.exports = router;
