const db = require("../models");
const Ecoponto = db.ecopontos;
const config = require("../config/db.config.js");

//VER ECOPONTOS
exports.findAll = async (req, res) => {
    try {
        let data = await Ecoponto.find({}, { morada: 1, coordenadas: 1, _id: 0 });
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
        let ecoponto = await Ecoponto.findById(req.params.id)
        if (!ecoponto) return res.status(404).json({
            success: false,
            msg: "Ecoponto não encontrado"
        });
        res.status(200).json({
            success: true,
            ecoponto: ecoponto
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: err.message || "Algo correu mal, tente novamente mais tarde."
        });
    };
}