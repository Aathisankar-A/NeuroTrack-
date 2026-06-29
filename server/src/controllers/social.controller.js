import User from '../models/User.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { emitToUser } from '../config/socket.js';

export const searchUsers = asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.json(ApiResponse.success([], 'No query provided'));
    }

    const currentUser = await User.findById(req.user._id);
    
    // Find users by name or email, excluding current user, existing friends, and already received requests
    const users = await User.find({
        $and: [
            { _id: { $ne: req.user._id } },
            { _id: { $nin: currentUser.friends } },
            { _id: { $nin: currentUser.friendRequests } },
            {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            }
        ]
    }).select('name email avatar level xp friendRequests').limit(10);

    // Filter out users to whom we already sent a request
    const filteredUsers = users.filter(u => !u.friendRequests?.includes(req.user._id));

    // Remove friendRequests from response
    const safeUsers = filteredUsers.map(u => {
        const obj = u.toObject();
        delete obj.friendRequests;
        return obj;
    });

    res.json(ApiResponse.success(safeUsers, 'Users fetched successfully'));
});

export const sendFriendRequest = asyncHandler(async (req, res) => {
    const { targetUserId } = req.body;
    
    if (targetUserId === req.user._id.toString()) {
        res.status(400);
        throw new Error('You cannot send a friend request to yourself');
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
        res.status(404);
        throw new Error('User not found');
    }

    if (targetUser.friends.includes(req.user._id)) {
        res.status(400);
        throw new Error('You are already friends');
    }

    if (targetUser.friendRequests.includes(req.user._id)) {
        res.status(400);
        throw new Error('Friend request already sent');
    }

    targetUser.friendRequests.push(req.user._id);
    await targetUser.save();

    emitToUser(targetUserId, 'friend:request:received', {
        requesterId: req.user._id,
        requesterName: req.user.name,
    });

    res.json(ApiResponse.success(null, 'Friend request sent'));
});

export const acceptFriendRequest = asyncHandler(async (req, res) => {
    const { requesterId } = req.body;

    const currentUser = await User.findById(req.user._id);
    const requesterUser = await User.findById(requesterId);

    if (!requesterUser) {
        res.status(404);
        throw new Error('Requester not found');
    }

    if (!currentUser.friendRequests.includes(requesterId)) {
        res.status(400);
        throw new Error('No friend request found from this user');
    }

    // Remove request
    currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== requesterId.toString());
    
    // Add to friends
    if (!currentUser.friends.includes(requesterId)) currentUser.friends.push(requesterId);
    if (!requesterUser.friends.includes(currentUser._id)) requesterUser.friends.push(currentUser._id);

    // If requester had sent request to currentUser as well, clear it
    requesterUser.friendRequests = requesterUser.friendRequests.filter(id => id.toString() !== currentUser._id.toString());

    await currentUser.save();
    await requesterUser.save();

    res.json(ApiResponse.success(null, 'Friend request accepted'));
});

export const declineFriendRequest = asyncHandler(async (req, res) => {
    const { requesterId, reason } = req.body;

    const currentUser = await User.findById(req.user._id);
    
    if (!currentUser.friendRequests.includes(requesterId)) {
        res.status(400);
        throw new Error('No friend request found from this user');
    }

    currentUser.friendRequests = currentUser.friendRequests.filter(id => id.toString() !== requesterId.toString());
    await currentUser.save();

    emitToUser(requesterId, 'friend:request:declined', {
        declinerName: req.user.name,
        reason: reason || null
    });

    res.json(ApiResponse.success(null, 'Friend request declined'));
});

export const getFriends = asyncHandler(async (req, res) => {
    const currentUser = await User.findById(req.user._id).populate('friends', 'name email avatar level xp');
    res.json(ApiResponse.success(currentUser.friends, 'Friends fetched successfully'));
});

export const getFriendRequests = asyncHandler(async (req, res) => {
    const currentUser = await User.findById(req.user._id).populate('friendRequests', 'name email avatar level xp');
    res.json(ApiResponse.success(currentUser.friendRequests, 'Friend requests fetched successfully'));
});
