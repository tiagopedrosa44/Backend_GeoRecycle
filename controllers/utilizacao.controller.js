const db = require("../models");
const Utilizacao = db.utilizacaos;
const User = db.users;
const config = require("../config/db.config.js");



// Registrar utilização de ecoponto
exports.registarUtilizacao = async (req, res) => {
    try {
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
            idUser: req.loggedUserId,
            idEcoponto: idEcoponto,
            foto: req.body.foto,
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
        return res.status(403).json({
          success: false,
          msg: "Tem que estar autenticado como admin"
        });

        let idUtilizacao = req.params.id;
        if (!idUtilizacao) {
            return res.status(400).json({
                success: false,
                error: "Indique um id de utilização.",
            });
        }

        if (!req.body.vistoAdmin  || !req.body.ecopontoAprovado) {
            return res.status(400).json({ error: 'Campos por preencher.' });
        }

        let utilizacao = await Utilizacao.findById(idUtilizacao);
        if (!utilizacao) {
            return res.status(404).json({
                success: false,
                error: "Utilização não encontrada.",
            });
        }

        utilizacao.vistoAdmin = req.body.vistoAdmin;
        utilizacao.ecopontoAprovado = req.body.ecopontoAprovado;
        await utilizacao.save();

        if(utilizacao.ecopontoAprovado) {
            const user = await User.findById(utilizacao.userId);
            if(user) {
                user.pontos += 100;
                await user.save();
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
}
