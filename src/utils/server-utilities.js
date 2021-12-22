const mongodb = require("mongodb");
const bcrypt = require("bcryptjs");
const async = require("hbs/lib/async");
let time = 0;

//adding new customer in database
const addCustomer = function (username, email, password, db, callback) {
  db.collection("users").findOne(
    {
      //checking presence of provided email with provided type
      email: email,
      type: "customer",
    },
    function (error, user) {
      if (error) {
        //error while accessing database
        console.log("error while accessing");
        var status = "error";
        var problem = "err";
        callback(status, problem);
      } else if (user != null) {
        //if a customer already exist with the provided email
        console.log("Customer " + user.name + " already present in database .");
        var status = "exist";
        var problem =
          "A customer is already registered with the provided email address.<br> <h3><a href='/signup'>Sign up</a> with another email.</h3>";
        callback(status, problem);
      }

      //making new entry in database if no customer is registered with this email
      else if (user == null) {
        //hashing password
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function (saltError, salt) {
          if (saltError) {
            var status = "error";
            var problem = "err";
            callback(status, problem);
            throw saltError;
          } else {
            bcrypt.hash(password, salt, function (hashError, hashed_password) {
              if (hashError) {
                var status = "error";
                var problem = "err";
                callback(status, problem);
                throw hashError;
              } else {
                //storing customer in user collection with hashed password
                db.collection("users").insertOne(
                  {
                    username: username,
                    email: email,
                    password: hashed_password,
                    type: "customer",
                  },
                  function (error, user) {
                    if (error) {
                      console.log("Unable to add User");
                      var status = "error";
                      var problem = "err";
                      n;
                      callback(status, problem);
                    } else {
                      const success = "success";
                      console.log(user);
                      callback(success);
                    }
                  }
                );
              }
            });
          }
        });
      }
    }
  );
};

//adding new restaurant in database
const addRestaurant = function (
  restaurant,
  username,
  email,
  password,
  address,
  db,
  callback
) {
  db.collection("users").findOne(
    {
      //checking presence of provided email with provided type
      email: email,
      type: "manager",
    },
    function (error, user) {
      if (error) {
        //error while accessing database
        console.log("error while accessing");
        var status = "error";
        var problem = "err";
        callback(status, problem);
      } else if (user != null) {
        //if a restaurant already exist with the provided email
        console.log(
          "Restaurant " + user.restaurant + " already present in database."
        );
        var status = "exist";
        var problem =
          "A restaurant is already registered with the provided email address.<br> <h3><a href='/add_restaurant'>Click here</a> to add with another email.</h3>";
        callback(status, problem);
      }

      //making new entry in database if no restaurant registered with this email
      else if (user == null) {
        //hashing a password
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function (saltError, salt) {
          if (saltError) {
            var status = "error";
            var problem = "err";
            callback(status, problem);
            throw saltError;
          } else {
            bcrypt.hash(password, salt, function (hashError, hashed_password) {
              if (hashError) {
                var status = "error";
                var problem = "err";
                callback(status, problem);
                throw hashError;
              } else {
                //storing restaurant with manager details and hashed password in user collections
                db.collection("users").insertOne(
                  {
                    username: username,
                    email: email,
                    password: hashed_password,
                    type: "manager",
                    restaurant: restaurant,
                    address: address,
                  },
                  function (error, user) {
                    if (error) {
                      console.log("Unable to add User");
                      var status = "error";
                      var problem = "err";
                      callback(status, problem);
                    } else {
                      const success = "success";
                      console.log(user);
                      callback(success, user);
                    }
                  }
                );
              }
            });
          }
        });
      }
    }
  );
};

//verifing user details while logging in
const loginUser = function (email, password, type, db, callback) {
  var hashed_password;

  db.collection("users").findOne(
    {
      //checking presence of provided email with provided type
      email: email,
      type: type,
    },
    function (error, user) {
      if (error) {
        //error while accessing database
        console.log("error while accessing");
        var status = "error";
        var problem = "err";
        callback(status, problem);
      } else if (user == null) {
        //email with provided type not found in database
        console.log("[-] No Such User Exists");
        var status = "error";
        if (type == "customer") {
          var problem =
            "No customer with this email is signed up. <a href='/signup'>Click here</a> to sign up now.";
        } else if (type == "manager") {
          var problem =
            "No manager with this email is signed up. <a href='/add_restaurant'>Click here</a> to add your restaurant now.";
        } else if (type == "staff") {
          var problem = "No staff with this email is registered :( ";
        }

        callback(status, problem);
      } else {
        //email with provided type found in database
        hashed_password = user.password;

        //decrypting hashed password
        bcrypt.compare(password, hashed_password, function (error, isMatch) {
          if (error) {
            //error while decrypting

            const status = "error";
            const problem = "err";
            callback(status, problem);
            throw error;
          } else if (!isMatch) {
            //decrypted successfully but didn't matched
            const status = "error";
            const problem =
              "Password doesn't matches.  <a href='/login'>Try again</a>";
            callback(status, problem);
          } else {
            //decrypted password mached with provided password
            const status = "success";
            callback(status, user);
          }
        });
      }
    }
  );
};

const updateOrders = function (foodName, restaurant, db) {
  db.collection("current-orders")
    .find({
      foodName: foodName,
      restaurant: restaurant,
    })
    .toArray(function (error, result) {
      if (result) {
        //console.log("**********Result*********\n", result);
        db.collection("current-orders").updateMany(
          {
            foodName: foodName,
            restaurant: restaurant,
          },
          {
            $set: {
              count: result.length,
            },
          }
        );
      }
    });
};

let foodCheck = 5;


const addFood = function (
  foodName,
  timeToPreapare,
  imageUrl,
  price,
  tags,
  preaparation,
  ingredients,
  restaurant,
  db,
  callback
) {
  db.collection("catalog").findOne(
    {
      foodName: foodName,
      restaurant: restaurant,
    },
    function (error, data) {
      if (error) {
        console.log("[-] Unable To Access Database");

        console.log(error);
        const status = "error";
        const value = "Unable to add the Item";
        callback(status, value);
      } else if (!data) {
        db.collection("catalog").insertOne(
          {
            foodName: foodName,
            timeToPreapare: timeToPreapare,
            imageUrl: imageUrl,
            price: price,
            discount: 0,
            rating: 0,
            numberOfTimesOrdered: 0,
            tags: tags,
            preaparation: preaparation,
            ingredients: ingredients,
            restaurant: restaurant,
          },
          function (err, data) {
            if (err) {
              console.log(
                "Unable to add the Item in database (database side error)"
              );
              const status = "error";
              const value = "Unable to add the Item";
              callback(status, value);
            } else {
              const status = "success";
              const value = `${data.foodName} has been added in restaurant ${data.restaurant}`;
              callback(status, value);
            }
          }
        );
      } else {
        console.log("Item already present");
        const status = "error";
        const value = `An item with name ${foodName} is already present in menu of ${restaurant}.`;
        callback(status, value);
      }
    }
  );
};

const addOrder = function (customerName, foodName, restaurant, db, callback) {
  // Fetching Time To Preapare Food From Database
  db.collection("catalog").findOne(
    {
      foodName: foodName,
    },
    function (error, food) {
      if (error) {
        return console.log("[-] Unable to fetch Time To Preapare Food");
      }

      time = food.timeToPreapare;
      // console.log("******Food********\n", food);
      // console.log("******FoodPrepTime********* ----> ", time);
      callback(customerName, foodName, time, restaurant, db);
    }
  );
};

const deleteFoodItem = function (foodName, restaurant, db) {
  db.collection("catalog")
    .deleteOne({
      foodName: foodName,
      restaurant: restaurant,
    })
    .then(function (result) {
      console.log("The Result is --->\n", result);
    })
    .catch(function (error) {
      console.log("The error is --->\n", error);
    });
};

const getrestaurantFood = function (restaurant, db, callback) {
  db.collection("catalog")
    .find({
      restaurant: restaurant,
    })
    .toArray(function (error, foodItems) {
      if (error) {
        return console.log("Unable to fetch data");
      }
      callback(foodItems);
    });
};

const extractFoodDetails = function (foodName, restaurant, db, callback) {
  db.collection("catalog").findOne(
    {
      foodName: foodName,
      restaurant: restaurant,
    },
    function (error, foodData) {
      if (error) {
        return console.log("Unable To Fetch FoodDetails");
      }

      callback(foodData);
    }
  );
};

module.exports = {
  addCustomer: addCustomer,
  addRestaurant: addRestaurant,
  loginUser: loginUser,
  addOrder: addOrder,
  updateOrders: updateOrders,
  addFood: addFood,
  deleteFoodItem: deleteFoodItem,
  getrestaurantFood: getrestaurantFood,
  extractFoodDetails: extractFoodDetails,
};
