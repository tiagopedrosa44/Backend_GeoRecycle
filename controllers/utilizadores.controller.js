const db = require("../models");
const User = db.users;
// Create and Save a new Tutorial: use object.save()
exports.create = async (req, res) => {
  const user = new User({
    title: req.body.title,
    description: req.body.description,
    published: req.body.published,
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