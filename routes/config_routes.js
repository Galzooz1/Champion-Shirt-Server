const indexR = require("./index");
const usersR = require("./users");
const prodsR = require("./products");
const designR = require("./designs");
const cartsR = require("./carts");
const categoriesR  = require("./categories");
const readyProductsR = require("./readyProducts");
const uploadR = require("./upload");


exports.corsAccessControl = (app) => {
  app.all('*', function (req, res, next) {
    if (!req.get('Origin')) return next();
    res.set('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
    res.set('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,auth-token');
    next();
  });
}

exports.routesInit = (app) => {
  app.use("/", indexR);
  app.use("/users", usersR);
  app.use("/products", prodsR);
  app.use("/designs", designR);
  app.use("/carts", cartsR);
  app.use("/categories", categoriesR);
  app.use("/readyProducts", readyProductsR);
  app.use("/upload", uploadR);

  app.use((req,res) => {
    res.status(404).json({msg:"404 url page not found"})
  })
}