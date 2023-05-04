const db = require("../models");
const User = db.users;
// Create and Save a new Tutorial: use object.save()
exports.create = async (req, res) => {
  let referralCode = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    referralCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  const user = new User({
    nome: req.body.nome,
    password: req.body.password,
    email: req.body.email,
    referral: referralCode,
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