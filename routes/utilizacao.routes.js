const express = require("express");

const utilizacaoController = require("../controllers/utilizacao.controller");
const authController = require("../controllers/auth.controller");



// NEW MULTER
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
}); // save the file to memory first

const multerUploads = multer({ storage }).single('image'); // specifies the field name multer should go to when it’s looking for the file


let router = express.Router();
// middleware for all routes related with utilizacao
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
    .route("/pendentes")
    .get(authController.verifyToken, utilizacaoController.getUtilizacoesPendentes) 
router
    .route("/:id")
    .post(multerUploads,authController.verifyToken, utilizacaoController.registarUtilizacao)
    .put(authController.verifyToken, utilizacaoController.validarUtilizacao)
router
    .route("/:idUser")
    .get(authController.verifyToken, utilizacaoController.getUtilizaçoesByUser)

router.all("*", function (req, res) {
  res.status(404).json({ message: "Users: what???" });
});
// EXPORT ROUTES (required by APP)
module.exports = router;
