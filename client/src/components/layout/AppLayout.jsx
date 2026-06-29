import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { X, Play, UserPlus, Info } from 'lucide-react';
import { Button, Input } from '../ui';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import api from '../../api/axios';

const AppLayout = () => {
    const socket = useSocket();
    const navigate = useNavigate();
    const [invitation, setInvitation] = useState(null);
    const [friendRequest, setFriendRequest] = useState(null);
    const [declineMsg, setDeclineMsg] = useState(null);
    
    const [activeDecline, setActiveDecline] = useState(null); // { type, data }
    const [declineReason, setDeclineReason] = useState('');

    useEffect(() => {
        if (!socket) return;
        
        const handleInvite = (data) => {
            setInvitation(data);
            setTimeout(() => setInvitation(null), 15000);
        };

        const handleFriendReq = (data) => {
            setFriendRequest(data);
            setTimeout(() => setFriendRequest(null), 15000);
        };

        const handleRoomDeclined = (data) => {
            setDeclineMsg({ type: 'room', ...data });
            setTimeout(() => setDeclineMsg(null), 10000);
        };

        const handleFriendDeclined = (data) => {
            setDeclineMsg({ type: 'friend', ...data });
            setTimeout(() => setDeclineMsg(null), 10000);
        };

        socket.on('room:invite:received', handleInvite);
        socket.on('friend:request:received', handleFriendReq);
        socket.on('room:invite:declined:received', handleRoomDeclined);
        socket.on('friend:request:declined', handleFriendDeclined);

        return () => {
            socket.off('room:invite:received', handleInvite);
            socket.off('friend:request:received', handleFriendReq);
            socket.off('room:invite:declined:received', handleRoomDeclined);
            socket.off('friend:request:declined', handleFriendDeclined);
        };
    }, [socket]);

    const handleAcceptFriend = async () => {
        try {
            await api.post('/social/accept', { requesterId: friendRequest.requesterId });
            setFriendRequest(null);
        } catch (err) {
            console.error(err);
        }
    };

    const submitDecline = async () => {
        if (!activeDecline) return;
        
        if (activeDecline.type === 'room') {
            socket.emit('room:invite:declined', {
                inviterId: activeDecline.data.inviterId,
                inviteeName: activeDecline.data.inviteeName,
                reason: declineReason
            });
            setInvitation(null);
        } else if (activeDecline.type === 'friend') {
            try {
                await api.post('/social/decline', { 
                    requesterId: activeDecline.data.requesterId,
                    reason: declineReason
                });
                setFriendRequest(null);
            } catch (err) {
                console.error(err);
            }
        }
        
        setActiveDecline(null);
        setDeclineReason('');
    };
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#121212] overflow-hidden relative">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
            
            {/* Global Invitation Toast */}
            {invitation && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-10 fade-in duration-300">
                    <div className="bg-white dark:bg-[#1E1E1E] border border-primary-200 dark:border-primary-900/50 shadow-xl rounded-2xl p-4 pr-12 flex items-center gap-4">
                        <button 
                            onClick={() => setInvitation(null)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
                        >
                            <X size={16} />
                        </button>
                        <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center shrink-0">
                            <Play size={20} fill="currentColor" className="ml-1" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">Room Invitation</p>
                            <p className="text-sm text-gray-500 mt-0.5"><span className="font-medium text-primary-600 dark:text-primary-400">{invitation.inviterName}</span> invited you to <span className="font-medium">"{invitation.roomName}"</span></p>
                            <div className="flex gap-2 mt-3">
                                {activeDecline?.type === 'room' ? (
                                    <div className="flex gap-2 w-full">
                                        <Input 
                                            placeholder="Reason (optional)..." 
                                            value={declineReason}
                                            onChange={e => setDeclineReason(e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                        <Button size="sm" variant="outline" className="shrink-0" onClick={submitDecline}>Send</Button>
                                    </div>
                                ) : (
                                    <>
                                        <Button size="sm" onClick={async () => {
                                            try {
                                                await api.post(`/rooms/${invitation.roomId}/join`);
                                                navigate(`/rooms/${invitation.roomId}`);
                                                setInvitation(null);
                                            } catch (err) {
                                                alert('Failed to join room');
                                            }
                                        }}>Join Now</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setActiveDecline({ type: 'room', data: invitation })}>Decline</Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Friend Request Toast */}
            {friendRequest && (
                <div className="absolute top-6 right-6 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
                    <div className="bg-white dark:bg-[#1E1E1E] border border-primary-200 dark:border-primary-900/50 shadow-xl rounded-2xl p-4 pr-12 flex items-center gap-4 w-[350px]">
                        <button 
                            onClick={() => setFriendRequest(null)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                        >
                            <X size={16} />
                        </button>
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                            <UserPlus size={20} />
                        </div>
                        <div className="w-full">
                            <p className="font-semibold text-gray-900 dark:text-white">Friend Request</p>
                            <p className="text-sm text-gray-500 mt-0.5"><span className="font-medium text-indigo-600 dark:text-indigo-400">{friendRequest.requesterName}</span> sent you a request.</p>
                            <div className="flex gap-2 mt-3">
                                {activeDecline?.type === 'friend' ? (
                                    <div className="flex gap-2 w-full">
                                        <Input 
                                            placeholder="Reason (optional)..." 
                                            value={declineReason}
                                            onChange={e => setDeclineReason(e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                        <Button size="sm" variant="outline" className="shrink-0" onClick={submitDecline}>Send</Button>
                                    </div>
                                ) : (
                                    <>
                                        <Button size="sm" onClick={handleAcceptFriend}>Accept</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setActiveDecline({ type: 'friend', data: friendRequest })}>Decline</Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Decline Message Toast */}
            {declineMsg && (
                <div className="absolute bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-white dark:bg-[#1E1E1E] border border-red-200 dark:border-red-900/30 shadow-xl rounded-2xl p-4 flex items-start gap-3 w-[300px]">
                        <div className="text-red-500 mt-0.5"><Info size={20} /></div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                {declineMsg.type === 'room' ? 'Room Invite Declined' : 'Friend Request Declined'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <span className="font-medium">{declineMsg.declinerName || declineMsg.inviteeName}</span> declined your invite.
                            </p>
                            {declineMsg.reason && (
                                <div className="mt-2 text-sm italic text-gray-500 border-l-2 border-red-200 pl-2">
                                    "{declineMsg.reason}"
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppLayout;
