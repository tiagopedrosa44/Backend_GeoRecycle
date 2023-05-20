const db = require("../models");
const Items = db.items;
const config = require("../config/db.config.js");

//Ver todos os items da loja
exports.getStoreItems = async (req, res) => {
  try {
    if (req.loggedUserType !== "admin")
      return res.status(403).json({
        success: false,
        msg: "Tem que estar autenticado como admin",
      });
    let items = await Items.find({});
    console.log(items);
    res.status(200).json({
      success: true,
      msg: "Items retornados com sucesso",
      items: items,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message || "Algo correu mal, tente novamente mais tarde.",
    });
  }
};
