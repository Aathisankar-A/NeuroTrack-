import express from 'express';
import {
    createRoom,
    getRooms,
    getMyRooms,
    getRoomDetails,
    joinRoom,
    leaveRoom,
    updateRoom,
    deleteRoom,
    askAiFacilitator,
    getDiscussionPrompt,
} from '../controllers/room.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All room routes require authentication
router.use(protect);

router.route('/')
    .post(createRoom)
    .get(getRooms);

router.get('/mine', getMyRooms);

router.route('/:id')
    .get(getRoomDetails)
    .patch(updateRoom)
    .delete(deleteRoom);

router.post('/:id/join', joinRoom);
router.post('/:id/leave', leaveRoom);

export default router;
