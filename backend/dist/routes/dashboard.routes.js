"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const require_verified_email_1 = require("../middleware/require-verified-email");
const router = express_1.default.Router();
// All dashboard routes require verified email
router.use(require_verified_email_1.requireVerifiedEmail);
// Get dashboard statistics
router.get('/stats', dashboard_controller_1.dashboardController.getStats);
// Get recent activity feed
router.get('/activity', dashboard_controller_1.dashboardController.getRecentActivity);
// Get upcoming games
router.get('/upcoming-games', dashboard_controller_1.dashboardController.getUpcomingGames);
exports.default = router;
