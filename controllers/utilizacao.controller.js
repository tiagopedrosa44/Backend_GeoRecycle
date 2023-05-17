const db = require("../models");
const Utilizacao = db.utilizacaos;
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
