import express from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { requireVerifiedEmail } from '../middleware/require-verified-email';

const router = express.Router();

// All dashboard routes require verified email
router.use(requireVerifiedEmail);

// Get dashboard statistics
router.get('/stats', dashboardController.getStats);

// Get recent activity feed
router.get('/activity', dashboardController.getRecentActivity);

// Get upcoming games
router.get('/upcoming-games', dashboardController.getUpcomingGames);

export default router; 