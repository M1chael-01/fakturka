const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// User registration route
// POST /create-account
router.post("/create-account", authController.register);

// User login route
// POST /login
router.post("/login", authController.login);

// User logout route
// POST /logout
router.post("/logout", authController.logout);

// Get logged-in user info
// GET /getUserInfo
router.get("/getUserInfo", authController.getUserInfo);

// Change user password
// POST /changePassword
router.post("/changePassword", authController.updatePassword);

// Check if user is currently logged in (session/token validation)
// POST /isUserLogged
router.post("/isUserLogged", authController.isLogin);

// Update user profile information
// POST /updateUserInfo
router.post("/updateUserInfo", authController.saveUserInfo);

// Get currently logged-in user's ID
// GET /getUserID
router.get("/getUserID", authController.getUserId);


router.get("/getUserEmail" , authController.getUserEmail)

// Example of a protected route
// Middleware ensures user is authenticated before access
// GET /protected
router.get("/protected", authController.isAuthenticated, (req, res) => {
  res.json({ message: "This is a protected page", user: req.session.user });
});

module.exports = router;
