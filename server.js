// Requiring express npm module
const express = require("express");
const server = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

//support parsing of application/ form data
server.use(express.json());
server.use(cookieParser());
server.use(
  express.urlencoded({
    extended: true,
  })
);

// Calling the server-utilities.js file
const utils = require("./src/utils/server-utilities.js");

//setting database using mongoose module
const dbname = "Project";
mongoose.connect("mongodb://localhost:27017/" + dbname, function (err) {
  if (err) {
    console.log(err);
  } else {
    global.db = mongoose.connection.db;
  }
});

// Serving up HTML,CSS and Js static content
const path = require("path");
const dirPath = path.join(__dirname, "/public");
server.use(express.static(dirPath));

// Configuring the Server to use hbs Template Engine
server.set("view engine", "hbs");

// Configuring the Server to serve dynamic HTML Pages
server.get("/", checkPresence, function (req, res) {
  res.render(__dirname + "/views/frontpage");
});

server.get("/login", checkPresence, function (req, res) {
  res.render(__dirname + "/views/loginpage");
});

server.get("/signup", checkPresence, function (req, res) {
  res.render(__dirname + "/views/signupPage");
});

server.get("/addRestaurant", function (req, res) {
  res.render(__dirname + "/views/add_restaurant");
});

server.get("/manager", verifyToken, function (req, res) {
  if (req.user.type === "manager") {
    res.render(__dirname + "/views/manager");
  } else res.render(__dirname + "/views/errorPage");
});

server.get("/staff", verifyToken, function (req, res) {
  if (req.user.type === "staff") {
    res.render(__dirname + "/views/staff");
  } else res.render(__dirname + "/views/errorPage");
});

server.get("/food_items_manager", verifyToken, function (req, res) {
  if (req.user.type === "manager") {
    res.render(__dirname + "/views/food_items_manager");
  } else res.render(__dirname + "/views/errorPage");
});

server.get("/addItem", verifyToken, function (req, res) {
  if (req.user.type === "manager") {
    res.render(__dirname + "/views/add_food_item");
  } else res.render(__dirname + "/views/errorPage");
});

server.get("/addStaff", verifyToken, function (req, res) {
  if (req.user.type === "manager") {
    res.render(__dirname + "/views/add_staff");
  } else res.render(__dirname + "/views/errorPage");
});

server.get("/editFood", verifyToken, function (req, res) {
  if (req.user.type === "manager") {
    res.render(__dirname + "/views/edit_food");
  } else res.render(__dirname + "/views/errorPage");
});

server.get("/orders", verifyToken, function (req, res) {
  if (req.user.type === "manager" || req.user.type === "staff") {
    res.render(__dirname + "/views/orders");
  } else res.render(__dirname + "/views/errorPage");
});

server.get("/staffDetails", verifyToken, function (req, res) {
  if (req.user.type === "manager") {
    res.render(__dirname + "/views/staff_details");
  } else res.render(__dirname + "/views/errorPage");
});

server.get("/editFoodItem", verifyToken, function (req, res) {
  if (req.user.type === "manager") {
    res.render(__dirname + "/views/edit_food_item");
  } else res.render(__dirname + "/views/errorPage");
});

server.get("/restaurant", verifyToken, function (req, res) {
  if (req.user.type === "customer") {
    res.render(__dirname + "/views/Restaurant");
  } else res.render(__dirname + "/views/errorPage");
});

server.get("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("restaurant");
  res.render(__dirname + "/views/logout");
});

server.post("/signup", function (req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const pw_confirmation = req.body.password_check;
  if (password == pw_confirmation) {
    utils.addCustomer(name, email, password, db, function (status, value) {
      if (status === "success") {
        console.log(name + " added in user collection as a customer");
        res.render(__dirname + "/views/signupSuccess");
      } else if (status === "exist") {
        res.send(value);
      } else {
        res.render(__dirname + "/views/errorPage");
      }
    });
  } else {
    res.render(__dirname + "/views/pwError_suPage");
  }
});

server.post("/add_restaurant", function (req, res) {
  const restaurant = req.body.restaurant;
  const manager = req.body.manager;
  const email = req.body.email;
  const password = req.body.password;
  const pw_confirmation = req.body.password_check;
  const address = req.body.address;
  if (password == pw_confirmation) {
    utils.addRestaurant(
      restaurant,
      manager,
      email,
      password,
      address,
      db,
      function (status, value) {
        if (status === "success") {
          console.log(manager + "added in user collection as a customer");
          res.render(__dirname + "/views/addRestaurantSuccess");
        } else if (status === "exist") {
          res.send(value);
        } else {
          res.render(__dirname + "/views/errorPage");
        }
      }
    );
  } else {
    res.render(__dirname + "/views/pwError_add_Res");
  }
});

//setting login post request
server.post("/login", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const type = req.body.type;
  utils.loginUser(email, password, type, db, function (status, value) {
    if (status === "success") {
      const user = value;
      const token_data = {
        name: user.username,
        email: email,
        password: password,
        type: type,
      };
      const accessToken = generateAccessToken(token_data);
      res.cookie("accessToken", accessToken);
      if (user.type === "customer") {
        res.redirect("/restaurant");
      } else if (user.type === "manager") {
        res.redirect("/manager");
      } else if (user.type === "staff") {
        res.redirect("/staff");
      }
    } else {
      if (value === "err") {
        res.render(__dirname + "/views/errorPage");
      } else {
        res.send(value);
      }
    }
  });
});


// Setting up JSON HTTP Endpoints

server.post("/api/currentOrders", verifyToken, function (req, res) {
  utils.addOrder(
    req.query.customerName,
    req.query.foodName,
    req.query.restaurent,
    db,
    function (customerName, foodName, time, restaurent, db) {
      // console.log("****TimeToMakeFood*****:   ", time);
      db.collection("current-orders").insertOne(
        {
          customerName: customerName,
          foodName: foodName,
          count: 0,
          start: false,
          done: false,
          time: time,
          restaurent: restaurent,
        },
        function (error, result) {
          if (error) {
            return console.log("[-] Unable to process the order");
          }
          // Updating Current-Orders Table
          utils.updateOrders(foodName, restaurent, db);

          // Updating catalog table to increase no. of times food is ordered
          db.collection("catalog")
            .updateMany(
              {
                foodName: foodName,
                restaurent: restaurent,
              },
              {
                $inc: {
                  numberOfTimesOrdered: 1,
                },
              }
            )
            .then(function (result) {
              //console.log(result);
            })
            .catch(function (error) {
              //console.log(error);
            });
        }
      );
    }
  );
  res.send("[+] Order Placed!!");
});

server.post("/addFood", verifyToken, function (req, res, ) {
  const { cookies } = req;
  const restaurant = cookies.restaurant;
  utils.addFood(
    req.body.foodName,
    req.body.time,
    req.body.imageUrl,
    req.body.price,
    req.body.tags,
    req.body.method,
    req.body.ingredients,
    restaurant,
    db, function(status, value) {
      // console.log("checkPoint 3");
      if (status === "error"){
        res.send(`<h2 style="color: red; text-align: center">${value}</h2><h1 style="color: blue; text-align: center"><a href="/addItem">Try again</a></h1>
        `);
      }
      else 
        res.render(__dirname + "/views/addItemSuccess");
    }
  )
});

server.get("/api/deleteItem", function (req, res) {
  //console.log(req.query.foodName, req.query.restaurent);
  utils.deleteFoodItem(req.query.foodName, req.query.restaurent, db);
  res.send("[-] Food Deleted");
});

server.get("/api/foodDetails", function (req, res) {
  utils.extractFoodDetails(
    req.query.foodName,
    req.query.restaurent,
    db,
    function (foodData) {
      res.send(foodData);
    }
  );
});

// HTTP Endpoint to get Restaurent's Food Data
server.get("/api/getFoodData", function (req, res) {
  const foodItems = utils.getrestaurantFood(
    req.query.restaurent,
    db,
    function (foodItems) {
      res.send(foodItems);
    }
  );
});

server.get("/api/userdata", verifyToken, (req, res) => {
  const { cookies } = req;
  const token = cookies.accessToken;
  if (token == null) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    db.collection("users").findOne(
      {
        email: user.email,
        type: user.type,
      },
      function (err, user) {
        if (err) {
          res.render(__dirname + "/views/errorPage");
        }
        if (user.type === "manager" || user.type === "staff") {
          const userData = {
            name: user.username,
            email: user.email,
            restaurant: user.restaurant,
          };
          res.send(userData);
        } else {
          const userData = {
            name: user.username,
            email: user.email,
          };
          res.send(userData);
        }
      }
    );
  });
});

//token related functions

//for getting a token
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "2hr" });
}

//for checking previous token presence
function checkPresence(req, res, next) {
  const { cookies } = req;
  const token = cookies.accessToken;
  if (token == null || typeof token == undefined) {
    return next();
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return next();
    } else {
      const type = user.type;
      if (type === "manager") {
        res.redirect("/manager");
      } else if (type === "staff") {
        res.redirect("/staff");
      } else {
        res.redirect("/restaurant");
      }
    }
  });
}

//for verifying token
function verifyToken(req, res, next) {
  const { cookies } = req;
  token = cookies.accessToken;
  if (token == null) {
    return res.render(__dirname + "/views/errorPage");
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.render(__dirname + "/views/errorPage");
    }
    // res.send(user)
    req.user = user;
    next();
  });
}

//page checking paths

// Starting the server at port 3000
server.listen(3000, function () {
  console.log(`[+] Server Started at Port: 3000`);
});

// Modification ---> restaurent wise count and numberOfTimesOrdered
