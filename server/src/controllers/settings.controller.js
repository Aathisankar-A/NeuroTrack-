import SettingsService from '../services/settings.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';

class SettingsController {
    /**
     * Get current user settings.
     */
    static getSettings = asyncHandler(async (req, res) => {
        const settings = await SettingsService.getSettings(req.user.id);
        res.json(ApiResponse.success(settings, 'Settings fetched successfully'));
    });

    /**
     * Update user settings.
     */
    static updateSettings = asyncHandler(async (req, res) => {
        const settings = await SettingsService.updateSettings(req.user.id, req.body);
        res.json(ApiResponse.success(settings, 'Settings updated successfully'));
    });
}

export default SettingsController;
