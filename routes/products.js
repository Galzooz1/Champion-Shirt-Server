const express = require("express");
const path = require("path");
const { authToken, authAdminToken } = require("../middlewares/auth");
const { ProdModel, validProd, generateShortId } = require("../models/prodModel");

const router = express.Router();

//Get list of products per page, and sorted by
//by categories if mentioned.
router.get("/", async(req, res) => {
    let perPage = (req.query.perPage) ? Number(req.query.perPage) : 4;
    let page = (req.query.page) ? Number(req.query.page) : 0;
    let sortQ = (req.query.sort) ? req.query.sort : "_id";
    let ifReverse = (req.query.reverse == "yes") ? -1 : 1;

    // בודק אם נשלח קווארי סטרינג של קטגוריה ואם לא יהיה ריק אם כן יעשה פילטר של קטגוריה
    // ?category=
  let filterCat = (req.query.category) ? { category_s_id: req.query.category } : {};
    try{
        let data = await ProdModel.find(filterCat)
        .sort({[sortQ]:ifReverse})
        .limit(perPage)
        .skip(page * perPage)
        res.json(data);
    }catch(err){
        console.log(err);
        res.status(400).json(err);
    }
})

//get number of products in data base
router.get("/count", async(req, res) => {
  let filterCat = (req.query.category) ? { category_s_id: req.query.category } : {};
  try {
    // filter -> זה השאילתא
    let data = await ProdModel.countDocuments(filterCat)
    res.json({ count: data });
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

//get single product by s_id
router.get("/single/:s_id", async(req, res) => {
  // let filterClean = (req.query.clean) ? { clean: req.query.clean } : {};
    try{
    let data = await ProdModel.findOne({ s_id: req.params.s_id /*filterClean */})
    res.json(data);
    }catch(err){
    console.log(err);
    res.status(400).json(err);
    }
})

// for (let i = 0; i < data.length; i++) {
//   for (let j = 0; j < data[i].properties.length; j++) {
//     if(data[i].properties[j].color === "black"){
//       filtered.push(data[i]);
//     }
//   }
// }
// router.post("/filter", async(req, res) => {
//   let filterCat = (req.query.category) ? { category_s_id: req.query.category } : {};
//   let filtered = [];
//   try {
//   let data = await ProdModel.find(filterCat,/*{$or:[{price:{$elemMatch: req.body.price}}*/{properties: { $elemMatch: {color:req.body.color, amount:req.body.amount.XS > 0}}})
//   filtered.push(data);
//   console.log(req.body.color)
//   res.json({filtered})
//   }
//   catch (err) {
//   console.log(err);
//   res.status(400).json(err);
// }
// })

//Search for products by name, info, tags or category
router.get("/search", async(req,res) => {
    let searchQ = req.query.q;
    let searchRegExp = new RegExp(searchQ,"i");
    try {
        let data = await ProdModel.find({$or:[{name:searchRegExp},{info:searchRegExp}]})
        .limit(20);
        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
})

//Add new product
router.post("/", authToken,authAdminToken, async(req, res) => {
    let validBody = validProd(req.body);
    if (validBody.error) {
      return res.status(400).json(validBody.error.details);
    }
    try {
      let prod = new ProdModel(req.body);
      prod.user_id = req.userData._id;
      prod.s_id = await generateShortId()
      await prod.save();
      res.status(201).json(prod);
    }
    catch (err) {
      console.log(err);
      res.status(400).send(err)
    }
  })

  //Edit existing product by s_id
  router.put("/:editId", authToken, authAdminToken, async (req, res) => {
    let editId = req.params.editId;
    let validBody = validProd(req.body);
    if (validBody.error) {
      return res.status(400).json(validBody.error.details);
    }
    try {
      // מכיוון שכל אדמין יכול לערוך , אז נרצה לעדכן את האיי די
      // של היוזר האדמין האחרון שנגע במוצר
      req.body.user_id = req.userData._id;
      let data = await ProdModel.updateOne({ s_id: editId }, req.body)
      res.status(201).json(data);
    }
    catch (err) {
      console.log(err);
      res.status(400).send(err)
    }
  })

  //upload file on edit product
  router.put("/upload/:editId", authToken, authAdminToken, async(req, res) => {
    if (req.files.fileSend) {
      let fileInfo = req.files.fileSend;
      // אוסף סיומת
      fileInfo.ext = path.extname(fileInfo.name);
      // מגדיר את המיקום של הקובץ למסד נתונים ולהעלאה
      let filePath = "/prods_images/"+req.params.editId+fileInfo.ext;
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
      let data = await ProdModel.updateOne({ s_id: req.params.editId }, {image:filePath});
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
      let data = await ProdModel.deleteOne({ s_id: idDel });
      res.json(data);
    }
    catch (err) {
      console.log(err);
      res.status(400).send(err)
    }
  })

module.exports = router;