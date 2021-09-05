const express = require("express");
const path = require("path");
const http = require("http");
const fileUpload = require("express-fileupload");
const {routesInit , corsAccessControl} = require("./routes/config_routes");
const mongoConnect = require("./db/mongoConnect");

const app = express();
//מגביל של גודל קובץ ל5 מגה בייט
app.use(fileUpload({
    limits:{ fileSize: 5*1024*1024}
}))
// דואג שכל מידע משתקבל או יוצא בברירת מחדל יהיה בפורמט ג'ייסון
app.use(express.json());
// להגדיר את תקיית פאבליק כתקייה של צד לקוח בשביל שנוכל לשים שם תמונות, ודברים של צד לקוח
app.use(express.static(path.join(__dirname,"public")));

//test
// מטפל בבעיית קורס של בקשה שמגיעה משרת אחר
corsAccessControl(app);
// מגדיר את כל הראוטים של האפליקציה כגון יוזר , בית , מוצרים...
routesInit(app);

// מייצר סרבר שמשתמש באפ של האקספרס
const server = http.createServer(app);
let port = process.env.PORT || "3005";
// מאזין או לפורט של השרת שאנחנו נמצאים בו או 3000
server.listen(port);