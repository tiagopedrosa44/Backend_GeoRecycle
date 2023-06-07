const db = require("../models");
const Utilizacao = db.utilizacaos;
const User = db.users;
const Ecoponto = db.ecopontos;
const config = require("../config/db.config.js");

// Registar utilização de ecoponto
exports.registarUtilizacao = async (req, res) => {
  try {
    let utilizacao_imgage = null;
    if (req.file) {
      utilizacao_imgage = await cloudinary.uploader.upload(req.file.path);
    }
    let idEcoponto = req.params.id;
    if (!idEcoponto) {
      return res.status(400).json({
        success: false,
        error: "Indique o id do ecoponto.",
      });
    }
    if (!req.body.foto) {
      return res.status(400).json({
        success: false,
        error: "Coloque uma foto.",
      });
    }
    let newUtilizacao = new Utilizacao({
      idUser: req.body.idUser,
      idEcoponto: idEcoponto,
      foto: utilizacao_imgage ? utilizacao_imgage.url : null,
      cloudinary_id: utilizacao_imgage ? utilizacao_imgage.public_id : null,
      data: Date.now(),
    });
    await newUtilizacao.save();
    res.status(200).json({
      success: true,
      msg: "Utilização registada com sucesso.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Algo correu mal, tente novamente mais tarde.",
    });
  }
};

// Rota validar utilização
exports.validarUtilizacao = async (req, res) => {
  try {
    if (req.loggedUserType !== "admin")
      return res.status(401).json({
        success: false,
        msg: "Tem que estar autenticado como admin",
      });

    if (req.body.vistoAdmin == true) {
      return res.status(400).json({
        success: false,
        error: "Utilização já foi validada.",
      });
    }

    let idUtilizacao = req.params.id;
    if (!idUtilizacao) {
      return res.status(400).json({
        success: false,
        error: "Indique um id de utilização.",
      });
    }

    if (!req.body.utilizacaoAprovada) {
      //apagar utilização
      await Utilizacao.findByIdAndDelete(idUtilizacao);
      return res.status(200).json({
        success: true,
        msg: "Utilização apagada com sucesso ",
      });
    }

    let utilizacao = await Utilizacao.findById(idUtilizacao);
    if (!utilizacao) {
      return res.status(404).json({
        success: false,
        error: "Utilização não encontrada.",
      });
    }

    utilizacao.vistoAdmin = true;
    utilizacao.utilizacaoAprovada = req.body.utilizacaoAprovada;
    await utilizacao.save();

    if (utilizacao.utilizacaoAprovada) {
      const ecoponto = await Ecoponto.findById(utilizacao.idEcoponto);
      const user = await User.findById(utilizacao.idUser);
      if (user && ecoponto) {
        user.pontos += 300;
        user.moedas += 1000;
        user.numUsoEcopontos += 1;
        ecoponto.utilizacoes += 1;
        await user.save();
        await ecoponto.save();
      }
    }
    res.status(200).json({
      success: true,
      msg: "Utilização validada com sucesso.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Algo correu mal, tente novamente mais tarde.",
    });
  }
};

// ver utilizações por veirificar
exports.getUtilizacoesPendentes = async (req, res) => {
  try {
    if (req.loggedUserType !== "admin")
      return res.status(401).json({
        success: false,
        msg: "Tem que estar autenticado como admin",
      });
    let utilizacoes = await Utilizacao.find({ vistoAdmin: false });

    if (utilizacoes.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Não existe nenhuma utilização por verificar!",
      });
    }
    res.status(200).json({
      success: true,
      utilizacoes: utilizacoes,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Algo correu mal, tente novamente mais tarde.",
    });
  }
};

exports.getUtilizaçoesByUser = async (req, res) => {
  try{
    let user = await User.findById(req.params.idUser);
    let utilizacoes = await Utilizacao.find({
      idUser: user,
      vistoAdmin: true,
      utilizacaoAprovada: true,
    },
    {foto:1,_id:0 }
    );
    if(req.loggedUserId !== req.params.idUser){
      return res.status(403).json({
        success: false,
        msg: "Não tenho premissão para ver estas utilizações.",
      });
    }
    if(utilizacoes.length === 0){
      return res.status(404).json({
        success: false,
        error: "Não existe nenhuma utilização!",
      });
    }
    res.status(200).json({
      success: true,
      utilizacoes: utilizacoes,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Algo correu mal, tente novamente mais tarde.",
    });
  }
}


