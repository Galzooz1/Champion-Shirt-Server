const express = require("express");
const { authToken, authAdminToken } = require("../middlewares/auth");
const { CategoryModel, validCategory, generateShortId } = require("../models/categoryModel");

const router = express.Router();

router.get("/", async(req,res) => {
  let perPage = (req.query.perPage) ? Number(req.query.perPage) : 4;
  let page = (req.query.page) ? Number(req.query.page) : 0;
  let sortQ = (req.query.sort) ? req.query.sort : "_id";
  let ifReverse = (req.query.reverse == "yes") ? -1 : 1;
  try{
    let data = await CategoryModel.find({})
    .sort({[sortQ]:ifReverse})
    .limit(perPage)
    .skip(page * perPage)
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
    let data = await CategoryModel.countDocuments()
    res.json({ count: data });
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

// get info about single category like name and info
router.get("/single/:idCategory", async(req,res) => {
  let idCategory = req.params.idCategory;
  try{

    let data = await CategoryModel.findOne({s_id:idCategory}).sort({_id:-1});
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

//Add new category
router.post("/", authToken, async(req,res) => {
  let validBody = validCategory(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    let category = new CategoryModel(req.body);
    category.s_id = await generateShortId();
    await category.save();
    res.status(201).json(category);
  } 
  catch(err){
    console.log(err);
    res.status(400).send(err)
  } 
})

//Edit category
router.put("/:editId", authToken,authAdminToken, async(req,res) => {
  let editId = req.params.editId;
  let validBody = validCategory(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    let data = await CategoryModel.updateOne({s_id:editId},req.body)
    res.status(201).json(data);
  } 
  catch(err){
    console.log(err);
    res.status(400).send(err)
  } 
})

//Delete Category
router.delete("/:idDel", authToken , authAdminToken, async(req,res) => {
  let idDel = req.params.idDel;
  try{
    let data = await CategoryModel.deleteOne({s_id:idDel});
    res.json(data);
    //TODO: delete all prods with the id of the category
  }
  catch(err){
    console.log(err);
    res.status(400).send(err)
  } 
})

module.exports = router;