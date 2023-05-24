const express = require("express");
let router = express.Router();
const ecopontosController = require("../controllers/ecopontos.controller");
const authController = require("../controllers/auth.controller");

// middleware for all routes related with ecopontos
router.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    // finish event is emitted once the response is sent to the client
    const diffSeconds = (Date.now() - start) / 1000; // figure out how many seconds elapsed
    console.log(
      `${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`
    );
  });
  next();
});
// ROUTES
router
  .route("/")
  .get(authController.verifyToken, ecopontosController.findAll)
  .post(authController.verifyToken, ecopontosController.createEcoponto);

router
  .route("/pendentes")
  .get(authController.verifyToken, ecopontosController.getEcopontosPorValidar);

router
  .route("/:id")
  .get(authController.verifyToken, ecopontosController.getEcoponto)
  .put(authController.verifyToken, ecopontosController.validarEcoponto);

router.all("*", function (req, res) {
  res.status(404).json({ message: "Users: what???" });
});
// EXPORT ROUTES (required by APP)
module.exports = router;
