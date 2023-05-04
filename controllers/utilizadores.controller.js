const db = require("../models");
const User = db.users;
// Create and Save a new Tutorial: use object.save()
exports.create = async (req, res) => {
  const user = new User({
    nome: req.body.nome,
    password: req.body.password,
    email: req.body.email,
  });
  try {
    let newUser = await user.save();
    res.status(201).json({
      sucess: true,
      message: "New user created",
      URL: "/users/" + newUser._id,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      let errors = {};
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
    }
    res.status(500).json({
      sucess: false,
      message: err.message || "Some error occurred while creating the tutorial",
    });
  }
};

/* // get all users
exports.findAll = async (req, res) => {
  try {
    let data = await User.find({});
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      sucess: false,
      message: err.message || "Some error occurred while retrieving users",
    });
  }
} */