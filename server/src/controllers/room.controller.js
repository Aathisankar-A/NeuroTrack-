import Room from '../models/Room.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import GeminiService from '../services/gemini.service.js';

export const createRoom = asyncHandler(async (req, res) => {
    const { name, description, type, mode, maxParticipants, tags } = req.body;

    const room = await Room.create({
        name,
        description,
        host: req.user._id,
        type,
        mode,
        maxParticipants,
        tags,
        participants: [{ user: req.user._id, role: 'host' }],
    });

    // Populate host details
    await room.populate('host', 'name email avatar');

    res.status(201).json(ApiResponse.success(room, 'Room created successfully'));
});

export const getRooms = asyncHandler(async (req, res) => {
    // Only fetch public and active rooms
    const rooms = await Room.find({ type: 'public', isActive: true })
        .populate('host', 'name avatar')
        .populate('participants.user', 'name avatar')
        .sort('-createdAt')
        .limit(20);

    res.json(ApiResponse.success(rooms, 'Public rooms fetched successfully'));
});

export const getMyRooms = asyncHandler(async (req, res) => {
    const rooms = await Room.find({
        isActive: true,
        'participants.user': req.user._id,
    })
        .populate('host', 'name avatar')
        .populate('participants.user', 'name avatar')
        .sort('-createdAt');

    res.json(ApiResponse.success(rooms, 'My rooms fetched successfully'));
});

export const getRoomDetails = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id)
        .populate('host', 'name avatar')
        .populate('participants.user', 'name avatar');

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    res.json(ApiResponse.success(room, 'Room details fetched successfully'));
});

export const joinRoom = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { inviteCode } = req.body;

    // Can join by ID or invite code
    let query = {};
    if (id && id !== 'join') {
        query._id = id;
    } else if (inviteCode) {
        query.inviteCode = inviteCode;
    } else {
        res.status(400);
        throw new Error('Room ID or invite code is required');
    }

    const room = await Room.findOne(query);

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    if (!room.isActive) {
        res.status(400);
        throw new Error('Room is no longer active');
    }

    // Check if user is already in the room
    const isParticipant = room.participants.some(
        (p) => p.user.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
        if (room.participants.length >= room.maxParticipants) {
            res.status(400);
            throw new Error('Room is full');
        }

        room.participants.push({ user: req.user._id, role: 'member' });
        await room.save();
    }

    await room.populate('host', 'name avatar');
    await room.populate('participants.user', 'name avatar');

    res.json(ApiResponse.success(room, 'Joined room successfully'));
});

export const leaveRoom = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    // Remove user from participants
    room.participants = room.participants.filter(
        (p) => p.user.toString() !== req.user._id.toString()
    );

    await room.save();

    res.json(ApiResponse.success(null, 'Left room successfully'));
});

export const updateRoom = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    // Only host can update
    if (room.host.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only the room host can update settings');
    }

    const { name, description, mode, maxParticipants, type } = req.body;

    if (name) room.name = name;
    if (description) room.description = description;
    if (mode) room.mode = mode;
    if (maxParticipants) room.maxParticipants = maxParticipants;
    if (type) room.type = type;

    await room.save();

    res.json(ApiResponse.success(room, 'Room updated successfully'));
});

export const deleteRoom = asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);

    if (!room) {
        res.status(404);
        throw new Error('Room not found');
    }

    // Only host can delete
    if (room.host.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Only the room host can delete the room');
    }

    room.isActive = false;
    await room.save();

    res.json(ApiResponse.success(null, 'Room deleted successfully'));
});

// AI Endpoints
export const askAiFacilitator = asyncHandler(async (req, res) => {
    const { chatHistory, context } = req.body;
    const response = await GeminiService.analyzeRoomChat(chatHistory, context);
    res.json(ApiResponse.success({ response }, 'AI Facilitator responded successfully'));
});

export const getDiscussionPrompt = asyncHandler(async (req, res) => {
    const { topic } = req.body;
    const prompt = await GeminiService.generateTopicPrompt(topic);
    res.json(ApiResponse.success({ prompt }, 'Discussion prompt generated successfully'));
});
