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