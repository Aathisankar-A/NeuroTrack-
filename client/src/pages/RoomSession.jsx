import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, ChevronLeft, ChevronRight, Users, Clock } from 'lucide-react';
import { Button } from '../components/ui';
import SharedTimer from '../components/room/SharedTimer';
import ParticipantList from '../components/room/ParticipantList';
import ChatPanel from '../components/room/ChatPanel';
import Whiteboard from '../components/room/Whiteboard';
import SharedNotes from '../components/room/SharedNotes';
import VideoGrid from '../components/room/VideoGrid';
import MediaControls from '../components/room/MediaControls';
import AiFacilitatorPanel from '../components/room/AiFacilitatorPanel';
import { useRoom } from '../hooks/useRoom';
import { useWebRTC } from '../hooks/useWebRTC';
import api from '../api/axios';
import { Bot } from 'lucide-react';

const RoomSession = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const { participants, timer, startTimer, pauseTimer } = useRoom(id);
    const {
        localStream,
        remoteStreams,
        mediaState,
        toggleVideo,
        toggleAudio,
        toggleScreenShare,
        cleanupMedia
    } = useWebRTC(id);

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                await api.post(`/rooms/${id}/join`);
                const res = await api.get(`/rooms/${id}`);
                setRoomDetails(res.data.data);
            } catch (err) {
                console.error('Failed to load room', err);
                alert('Could not join room');
                navigate('/rooms');
            } finally {
                setLoading(false);
            }
        };
        fetchRoomDetails();
        
        return () => {
            cleanupMedia();
        };
    }, [id, navigate, cleanupMedia]);

    const [activeTab, setActiveTab] = useState('video'); // 'video', 'whiteboard' or 'notes'
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

    if (loading) {
        return <div className="h-[60vh] flex items-center justify-center">Loading Room...</div>;
    }

    if (!roomDetails) return null;

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col animate-in fade-in duration-500 relative">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/rooms')} className="rounded-xl">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#E5E5E5] leading-none">{roomDetails.name}</h1>
                        <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mt-1 capitalize">{roomDetails.mode} Mode</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        className={`rounded-xl ${isAiPanelOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800' : ''}`}
                        onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                    >
                        <Bot size={16} className="mr-2" /> NeuroBot
                    </Button>
                    <Button variant="outline" className="rounded-xl">
                        <Share2 size={16} className="mr-2" /> Share Invite
                    </Button>
                </div>
            </div>
            
            <AiFacilitatorPanel 
                roomId={id} 
                isOpen={isAiPanelOpen} 
                onClose={() => setIsAiPanelOpen(false)} 
            />

            <div className={`grid grid-cols-1 gap-6 flex-1 min-h-0 pb-6 ${isLeftPanelOpen ? 'lg:grid-cols-12' : 'lg:grid-cols-[70px_1fr_300px]'}`}>
                
                {/* Left Column (Timer & Roster) */}
                {isLeftPanelOpen ? (
                    <div className="lg:col-span-2 flex flex-col gap-6 h-full min-h-0 relative transition-all">
                        <button 
                            onClick={() => setIsLeftPanelOpen(false)} 
                            className="absolute -right-3 top-4 z-10 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2A2A2A] rounded-full p-1 text-gray-500 hover:text-primary-600 shadow-sm transition-colors"
                            title="Collapse Panel"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <SharedTimer 
                            timerState={timer} 
                            onStart={startTimer} 
                            onPause={pauseTimer} 
                        />
                        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                            <ParticipantList participants={participants.length > 0 ? participants : roomDetails.participants.map(p => p.user)} />
                        </div>
                    </div>
                ) : (
                    <div className="hidden lg:flex flex-col items-center gap-6 h-full min-h-0 bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-[#2A2A2A] py-6 transition-all">
                        <button 
                            onClick={() => setIsLeftPanelOpen(true)} 
                            className="bg-primary-50 dark:bg-primary-900/20 p-2 rounded-xl text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
                            title="Expand Panel"
                        >
                            <ChevronRight size={20} />
                        </button>
                        
                        <div className="flex flex-col gap-4 mt-4">
                            <div className="flex flex-col items-center gap-1 text-gray-400" title="Shared Timer">
                                <Clock size={20} />
                            </div>
                            <div className="flex flex-col items-center gap-1 text-gray-400" title="Participants">
                                <Users size={20} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Center Column (Collaboration Space) */}
                <div className={`${isLeftPanelOpen ? 'lg:col-span-7' : ''} flex flex-col h-full min-h-0 relative`}>
                    <div className="flex gap-2 mb-4">
                        <Button 
                            variant={activeTab === 'video' ? 'primary' : 'outline'} 
                            onClick={() => setActiveTab('video')}
                            className="rounded-xl flex-1"
                        >
                            Video Call
                        </Button>
                        <Button 
                            variant={activeTab === 'whiteboard' ? 'primary' : 'outline'} 
                            onClick={() => setActiveTab('whiteboard')}
                            className="rounded-xl flex-1"
                        >
                            Whiteboard
                        </Button>
                        <Button 
                            variant={activeTab === 'notes' ? 'primary' : 'outline'} 
                            onClick={() => setActiveTab('notes')}
                            className="rounded-xl flex-1"
                        >
                            Shared Notes
                        </Button>
                    </div>
                    <div className="flex-1 min-h-0 relative">
                        {activeTab === 'video' && (
                            <div className="absolute inset-0 flex flex-col">
                                <VideoGrid 
                                    localStream={localStream}
                                    remoteStreams={remoteStreams}
                                    participants={participants.length > 0 ? participants : roomDetails.participants.map(p => p.user)}
                                />
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                                    <MediaControls 
                                        mediaState={mediaState}
                                        onToggleVideo={toggleVideo}
                                        onToggleAudio={toggleAudio}
                                        onToggleScreen={toggleScreenShare}
                                        onLeave={() => navigate('/rooms')}
                                    />
                                </div>
                            </div>
                        )}
                        {activeTab === 'whiteboard' && <Whiteboard roomId={id} />}
                        {activeTab === 'notes' && <SharedNotes roomId={id} />}
                    </div>
                </div>
                
                {/* Right Column (Chat) */}
                <div className={`${isLeftPanelOpen ? 'lg:col-span-3' : ''} h-full min-h-0`}>
                    <ChatPanel roomId={id} />
                </div>
                
            </div>
        </div>
    );
};

export default RoomSession;
