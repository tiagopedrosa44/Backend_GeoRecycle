const db = require("../models");
const User = db.users;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/db.config.js");

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
    const existingUser = await User.findOne({
      referral: code
    }).exec();
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
      const existingUser = await User.findOne({
        email: req.body.email
      }).exec();
      if (existingUser) {
        errors["email duplicado"] = "Email já existe";
      }
      res.status(400).json({
        success: false,
        message: errors
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || "Some error occurred while creating the tutorial",
      });
    }
  }
};


exports.login = async (req, res) => {
  try {
    if (!req.body || !req.body.nome || !req.body.password)
      return res.status(400).json({
        success: false,
        message: "Tens de fornecer o nome e a password"
      });

    let user = await User.findOne({
      nome: req.body.nome
    }).exec();
    if (!user) return res.status(404).json({
      success: false,
      message: "Utilizador não encontrado"
    });


    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) return res.status(401).json({
      success: false,
      acessToken: null,
      message: "Password inválida"
    });

    const token = jwt.sign({
        id: user._id,
        tipo: user.tipo
      },
      config.SECRET, {
        expiresIn: '24h'
      });
    return res.status(200).json({
      success: true,
      accessToken: token,
      message: "Login efetuado com sucesso"
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      let errors = {};
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
      res.status(400).json({
        success: false,
        message: errors
      });
    } else {
      res.status(500).json({
        success: false,
        message: err.message || "Some error occurred while creating the tutorial",
      });
    }
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    if (req.loggedUserType !== "admin")
      return res.status(403).json({
        success: false,
        msg: "This request requires ADMIN role!"
      });
    // do not expose users' sensitive data
    let users = await User.find({},
      "-password")
    res.status(200).json({
      success: true,
      users: users
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Some error occurred while retrieving all users."
    });
  };
};





exports.updateUserById = async (req, res) => {
  const userId = req.params.id;
  const { nome, email, password, biografia, foto } = req.body;

  // Verifica se o ID do usuário na solicitação corresponde ao ID do usuário autenticado
  if (userId !== req.loggedUserId) {
    return res.status(403).json({ message: 'Não autorizado' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado!" });
    }
    user.nome = nome;
    user.email = email;
    user.password = bcrypt.hashSync(password, 10);
    user.biografia = biografia;
    user.foto = foto;

    await user.save();
    res.status(200).json({ message: "Utilizador atualizado com sucesso!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};