const express = require("express");
const path = require("path");
const { authToken, authAdminToken } = require("../middlewares/auth");
const { validReadyProduct, readyProductsModel, generateShortId } = require("../models/readyProductsModel");

const router = express.Router();

//get all ready products
router.get("/", async(req, res) => {
    let perPage = (req.query.perPage) ? Number(req.query.perPage) : 4;
    let page = (req.query.page) ? Number(req.query.page) : 0;
    let sortQ = (req.query.sort) ? req.query.sort : "_id";
    let ifReverse = (req.query.reverse == "yes") ? -1 : 1;

    let filterCat = (req.query.category) ? { category_s_id: req.query.category } : {};
    try{
        let data = await readyProductsModel.find(filterCat)
        .sort({[sortQ]:ifReverse})
        .limit(perPage)
        .skip(page * perPage)
        res.json(data);
    }catch(err){
        console.log(err);
        res.status(400).json(err)
    }
})

//get number of products in data base
router.get("/count", async(req, res) => {
    let filterCat = (req.query.category) ? { category_s_id: req.query.category } : {};
    try {
      // filter -> זה השאילתא
      let data = await readyProductsModel.countDocuments(filterCat)
      res.json({ count: data });
    }
    catch (err) {
      console.log(err);
      res.status(400).json(err);
    }
  })

//get single by s_id
router.get("/single/:s_id",authToken, async(req, res) => {
    try{
        let data = await readyProductsModel.findOne({s_id: req.params.s_id})
        res.json(data);
    }catch(err){
        console.log(err);
        res.status(400).json(err)
    }
})

//get by userID
router.get("/:user_id",authToken, async(req, res) => {
    try{
        let data = await readyProductsModel.find({user_id:req.params.user_id})
        res.json(data);
    }catch(err){
        console.log(err);
        res.status(400).json(err)
    }
})

//Add new ready product
router.post("/", authToken, async(req, res) => {
    let validBody = validReadyProduct(req.body);
    if (validBody.error) {
      return res.status(400).json(validBody.error.details);
    }
    try {
      let prod = new readyProductsModel(req.body);
      prod.user_id = req.userData._id;
      prod.s_id = await generateShortId()
      await prod.save();
      console.log(prod);
      res.status(201).json(prod);
    }
    catch (err) {
      console.log(err);
      res.status(400).send(err)
    }
  })

  //Edit existing product by s_id
  router.put("/:editId", authToken, async (req, res) => {
    let editId = req.params.editId;
    let validBody = validReadyProduct(req.body);
    if (validBody.error) {
      return res.status(400).json(validBody.error.details);
    }
    try {
      // מכיוון שכל אדמין יכול לערוך , אז נרצה לעדכן את האיי די
      // של היוזר האדמין האחרון שנגע במוצר
      req.body.user_id = req.userData._id;
      let data = await readyProductsModel.updateOne({ s_id: editId }, req.body)
      res.status(201).json(data);
    }
    catch (err) {
      console.log(err);
      res.status(400).send(err)
    }
  })

  //upload file on edit product
  router.put("/upload/:editId", authToken, async(req, res) => {
    if (req.files.fileSend) {
      let fileInfo = req.files.fileSend;
      // אוסף סיומת
      fileInfo.ext = path.extname(fileInfo.name);
      // מגדיר את המיקום של הקובץ למסד נתונים ולהעלאה
      let filePath = "/ready_prods_images/"+req.params.editId+fileInfo.ext;
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
      let data = await readyProductsModel.updateOne({ s_id: req.params.editId }, $or[{image:filePath},{$elemMatch:{"design.$.front.$.costume.$.image":filePath}},{$elemMatch:{"design.$.back.$.costume.$.image":filePath}}]);
      console.log(data);
      res.json(data);
    }
    else{
      res.status(400).json({msg:"need to send file if image"})
    }
  })

    //Delete existing product by s_id
    router.delete("/:idDel", authToken,authAdminToken, async(req, res) => {
        let idDel = req.params.idDel;
        try {
          let data = await readyProductsModel.deleteOne({ s_id: idDel });
          res.json(data);
        }
        catch (err) {
          console.log(err);
          res.status(400).send(err)
        }
      })

module.exports = router;
