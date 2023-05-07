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
    if (newUser.referredBy) {
      const referringUser = await User.findOne({
        referral: newUser.referredBy,
      }).exec();
      if (referringUser) {
        referringUser.pontos += referalPoints;
        referringUser.moedas += referalCoins;
        await referringUser.save();
        newUser.pontos += referalPoints;
        newUser.moedas += referalCoins;
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
      // Verificar se o nome de usuário foi fornecido
      if (!req.body.nome) {
        errors["nome"] = "Indique um nome de utilizador";
      }
      // Verificar se a senha foi fornecida
      if (!req.body.password) {
        errors["password"] = "Indique uma palavra-passe";
      }
   
      // Verificar se o email foi fornecido
      if (!req.body.email) {
        errors["email"] = "Indique um email";
      }
      const existingUser = await User.findOne({ email: req.body.email }).exec();
      if (existingUser) {
        errors["email duplicado"] = "Email já existe";
      }
      res.status(400).json({ success: false, message: errors });
    } else {
      res.status(500).json({
        success: false,
        message:
          err.message || "Some error occurred while creating the tutorial",
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
