const express = require("express");
const router = express.Router();
const {
  registrarUsuario,
  loginUsuario,
  refreshAccessToken,
  logoutUsuario,
} = require("../controllers/authController");
const validate = require("../middlewares/validator");
const { registerSchema, loginSchema } = require("../validators/authValidator");

router.post("/registrar", validate(registerSchema), registrarUsuario);
router.post("/login", validate(loginSchema), loginUsuario);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUsuario);

module.exports = router;
