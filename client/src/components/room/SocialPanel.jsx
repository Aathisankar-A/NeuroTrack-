import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, Users } from 'lucide-react';
import { Card, Button, Input } from '../ui';
import api from '../../api/axios';

const SocialPanel = ({ onInvite, currentRoomId }) => {
    const [activeTab, setActiveTab] = useState('friends'); // friends, requests, find
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeDecline, setActiveDecline] = useState(null);
    const [declineReason, setDeclineReason] = useState('');

    const fetchFriends = async () => {
        try {
            const res = await api.get('/social/friends');
            setFriends(res.data.data);
        } catch (err) { console.error(err); }
    };

    const fetchRequests = async () => {
        try {
            const res = await api.get('/social/requests');
            setRequests(res.data.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (activeTab === 'friends') fetchFriends();
        if (activeTab === 'requests') fetchRequests();
    }, [activeTab]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const res = await api.get(`/social/search?query=${searchQuery}`);
            setSearchResults(res.data.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const sendRequest = async (userId) => {
        try {
            await api.post('/social/request', { targetUserId: userId });
            setSearchResults(prev => prev.filter(u => u._id !== userId));
            alert('Friend request sent!');
        } catch (err) { alert(err.response?.data?.message || 'Error'); }
    };

    const acceptRequest = async (userId) => {
        try {
            await api.post('/social/accept', { requesterId: userId });
            setRequests(prev => prev.filter(u => u._id !== userId));
            alert('Request accepted!');
            fetchFriends();
        } catch (err) { alert('Error accepting request'); }
    };

    const declineRequest = async (userId) => {
        try {
            await api.post('/social/decline', { requesterId: userId, reason: declineReason });
            setRequests(prev => prev.filter(u => u._id !== userId));
            setActiveDecline(null);
            setDeclineReason('');
        } catch (err) { alert('Error declining request'); }
    };

    return (
        <Card className="flex flex-col h-full bg-white dark:bg-[#121212] overflow-hidden border border-gray-200 dark:border-[#2A2A2A]">
            <div className="flex border-b border-gray-100 dark:border-[#2A2A2A]">
                <button 
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'friends' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('friends')}
                >
                    Friends
                </button>
                <button 
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'requests' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('requests')}
                >
                    Requests
                </button>
                <button 
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'find' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('find')}
                >
                    Find Users
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'friends' && (
                    <div className="space-y-4">
                        {friends.length === 0 ? (
                            <div className="text-center text-gray-500 mt-10">No friends yet. Add some to collaborate!</div>
                        ) : (
                            friends.map(friend => (
                                <div key={friend._id} className="flex items-center justify-between bg-gray-50 dark:bg-[#1E1E1E] p-3 rounded-xl border border-gray-100 dark:border-[#2A2A2A]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg">
                                            {friend.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{friend.name}</p>
                                            <p className="text-xs text-gray-500">Lvl {friend.level} • {friend.xp} XP</p>
                                        </div>
                                    </div>
                                    {onInvite && currentRoomId && (
                                        <Button size="sm" variant="outline" className="text-xs py-1 h-8 rounded-lg border-primary-200 text-primary-600 hover:bg-primary-50" onClick={() => onInvite(friend._id)}>
                                            Invite
                                        </Button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <div className="text-center text-gray-500 mt-10">No pending friend requests.</div>
                        ) : (
                            requests.map(req => (
                                <div key={req._id} className="flex flex-col bg-gray-50 dark:bg-[#1E1E1E] p-3 rounded-xl border border-gray-100 dark:border-[#2A2A2A]">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                                {req.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{req.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {activeDecline === req._id ? (
                                        <div className="mt-3 flex gap-2 w-full">
                                            <Input 
                                                placeholder="Reason (optional)..." 
                                                value={declineReason}
                                                onChange={e => setDeclineReason(e.target.value)}
                                                className="h-8 text-sm w-full"
                                            />
                                            <Button size="sm" variant="outline" className="shrink-0 h-8 text-xs" onClick={() => declineRequest(req._id)}>Send</Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 self-end mt-2">
                                            <button onClick={() => acceptRequest(req._id)} className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 shadow-sm transition-colors" title="Accept">
                                                <Check size={16} />
                                            </button>
                                            <button onClick={() => setActiveDecline(req._id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 shadow-sm transition-colors" title="Decline">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'find' && (
                    <div>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                            <Input 
                                placeholder="Search by name or email..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 text-sm"
                            />
                            <Button type="submit" disabled={loading} className="px-3 shadow-sm rounded-xl">
                                <Search size={16} />
                            </Button>
                        </form>
                        <div className="space-y-3">
                            {searchResults.length === 0 && searchQuery && !loading && (
                                <div className="text-center text-gray-500 text-sm mt-6">No users found.</div>
                            )}
                            {searchResults.map(user => (
                                <div key={user._id} className="flex items-center justify-between bg-gray-50 dark:bg-[#1E1E1E] p-3 rounded-xl border border-gray-100 dark:border-[#2A2A2A]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-lg">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => sendRequest(user._id)} className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="Send Friend Request">
                                        <UserPlus size={18} className="text-primary-600" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default SocialPanel;
