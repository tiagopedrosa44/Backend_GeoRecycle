const express = require("express");

const ecopontosController = require("../controllers/ecopontos.controller");
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
  .post(multerUploads,authController.verifyToken, ecopontosController.createEcoponto);

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
