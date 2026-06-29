import express from 'express';
import {
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    getFriends,
    getFriendRequests
} from '../controllers/social.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/search', searchUsers);
router.get('/friends', getFriends);
router.get('/requests', getFriendRequests);

router.post('/request', sendFriendRequest);
router.post('/accept', acceptFriendRequest);
router.post('/decline', declineFriendRequest);

export default router;
