"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const require_verified_email_1 = require("../middleware/require-verified-email");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
// All user routes require authentication and verified email
router.use(auth_1.authenticate);
router.use(require_verified_email_1.requireVerifiedEmail);
// Get current user profile
router.get('/me', user_controller_1.UserController.getCurrentUser);
// Update user profile
router.put('/profile', user_controller_1.UserController.updateProfile);
// Change password
router.put('/change-password', user_controller_1.UserController.changePassword);
// Upload profile picture
router.post('/profile-picture', upload_1.upload.single('image'), user_controller_1.UserController.uploadProfilePicture);
// Delete profile picture
router.delete('/profile-picture', user_controller_1.UserController.deleteProfilePicture);
// Delete account
router.delete('/account', user_controller_1.UserController.deleteAccount);
exports.default = router;
