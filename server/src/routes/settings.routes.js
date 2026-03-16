import express from 'express';
import SettingsController from '../controllers/settings.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(SettingsController.getSettings)
    .patch(SettingsController.updateSettings);

export default router;
