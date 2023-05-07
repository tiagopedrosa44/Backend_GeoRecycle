const db = require("../models");
const User = db.users;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Create and Save a new User: use object.save()
exports.create = async (req, res) => {
  const referalPoints = 100;
  const referalCoins = 100;
  let referralCode;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  while (!referralCode) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const existingUser = await User.findOne({ referral: code }).exec();
    if (!existingUser) {
      referralCode = code;
    }
  }
  const user = new User({
    nome: req.body.nome,
    password: bcrypt.hashSync(req.body.password, 10),
    email: req.body.email,
    referral: referralCode,
    referredBy: req.body.referredBy,
  });
  try {
    let newUser = await user.save();
    if (req.body.referredBy) {
      const referringUser = await User.findOne({
        referral: req.body.referredBy,
      }).exec();
      if (referringUser) {
        referringUser.pontos += referalPoints;
        referringUser.moedas += referalCoins;
        await referringUser.save();
        newUser.pontos += referalPoints;
        newUser.moedas += referalCoins;
        newUser.referredBy = referringUser._id;
        await newUser.save();
      }
    }
    res.status(201).json({
      sucess: true,
      message: "New user created",
      URL: "/utilizadores/" + newUser._id,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      let errors = {};
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
      res.status(400).json({ sucess: false, message: errors });
    } else {
      res.status(500).json({
        sucess: false,
        message: err.message || "Ocorreu um erro ao criar o utilizador.",
      });
    }
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
