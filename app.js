const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const eventRoutes = require("./routes/event");
const userRoutes = require("./routes/user");



var app = express();

mongoose
  .connect(
    "mongodb+srv://antra1018:antra1018@cluster0.0n0zy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
  )
  .then((res) => {
    console.log(`connected to database: ${res}`);
  })
  .catch((err) => {
    console.log(`failed to connect to the database: ${err}`);
  });

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/event", eventRoutes);
app.use("/api/user", userRoutes);
module.exports = app;
