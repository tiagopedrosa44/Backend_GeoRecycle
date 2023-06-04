const db = require("../models");
const Ecoponto = db.ecopontos;
const User = db.users;
const config = require("../config/db.config.js");

//VER ECOPONTOS
exports.findAll = async (req, res) => {
  try {
    let data = await Ecoponto.find({ecopontoAprovado:true}, { morada: 1, coordenadas: 1, _id: 1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Ocorreu um erro ao encontrar os ecopontos.",
    });
  }
};

//VER ECOPONTO POR ID
exports.getEcoponto = async (req, res) => {
  try {
    let ecoponto = await Ecoponto.findById(req.params.id);
    if (!ecoponto)
      return res.status(404).json({
        success: false,
        msg: "Ecoponto não encontrado",
      });
    res.status(200).json({
      success: true,
      ecoponto: ecoponto,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Algo correu mal, tente novamente mais tarde.",
    });
  }
};

//CRIAR NOVO ECOPONTO
exports.createEcoponto = async (req, res) => {
  try {
    let ecopontos = await Ecoponto.findOne({ morada: req.body.morada });
    if (ecopontos) {
      return res.status(400).json({
        success: false,
        msg: "Já existe um ecoponto com esta morada.",
      });
    }
    if (!req.body.coordenadas) {
      return res.status(400).json({
        success: false,
        error: "Indique uma localização.",
      });
    }

    if (!req.body.foto) {
      return res.status(400).json({
        success: false,
        error: "Coloque uma foto.",
      });
    }
    let currentDate = new Date();
    let newEcoponto = new Ecoponto({
      userId: req.loggedUserId,
      morada: req.body.morada,
      coordenadas: req.body.coordenadas,
      dataCriacao: currentDate,
      foto: req.body.foto,
    });
    await newEcoponto.save();
    res.status(200).json({ message: "Ecoponto criado com sucesso!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// rota validar ecoponto
exports.validarEcoponto = async (req, res) => {
  try {
    if (req.loggedUserType !== "admin")
      return res.status(401).json({
        success: false,
        msg: "Tem que estar autenticado como admin",
      });

    let idEcoponto = req.params.id;
    if (!idEcoponto) {
      return res.status(400).json({
        success: false,
        error: "Indique um id de um ecoponto.",
      });
    }

    if (!req.body.ecopontoAprovado) {
      //apagar ecoponto
      await Ecoponto.findByIdAndDelete(idEcoponto);
      return res.status(200).json({
        success: true,
        msg: "Ecoponto apagado com sucesso ",
      });
    }

    let ecoponto = await Ecoponto.findById(idEcoponto);
    if (!ecoponto) {
      return res.status(404).json({
        success: false,
        error: "Ecoponto não encontrado.",
      });
    }

    ecoponto.vistoAdmin = true
    ecoponto.ecopontoAprovado = req.body.ecopontoAprovado;
    await ecoponto.save();

    if (ecoponto.ecopontoAprovado) {
      const user = await User.findById(ecoponto.userId);
      if (user) {
        user.pontos += 500;
        user.moedas += 2000;
        user.ecopontosRegistados += 1;
        await user.save();
      }
    }
    res.status(200).json({
      success: true,
      msg: "Ecoponto aceite com sucesso ",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Algo correu mal, tente novamente mais tarde.",
    });
  }
};


// rota para ver ecopontos por validar
exports.getEcopontosPorValidar = async (req, res) => {
  try {
    if (req.loggedUserType !== "admin")
      return res.status(401).json({
        success: false,
        msg: "Tem que estar autenticado como admin",
      });

    let ecopontos = await Ecoponto.find({ vistoAdmin: false });
    
    if (ecopontos.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Não existem ecopontos por validar.",
      });
    }
    res.status(200).json({
      success: true,
      ecopontos: ecopontos,
    });
  }
  catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Algo correu mal, tente novamente mais tarde.",
    });
  }
};
