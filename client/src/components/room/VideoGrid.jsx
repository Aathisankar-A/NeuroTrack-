import React, { useEffect, useRef, useState } from 'react';
import { MicOff, VideoOff, User, Pin, Maximize2 } from 'lucide-react';

const VideoElement = ({ stream, isLocal, name, isPinned, onPin }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    if (!stream) {
        return (
            <div className={`relative w-full h-full bg-gray-900 rounded-2xl flex flex-col items-center justify-center overflow-hidden border ${isPinned ? 'border-primary-500' : 'border-gray-800'}`}>
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                    <User size={32} className="text-gray-500" />
                </div>
                <span className="text-sm font-medium text-gray-400">{name || 'Connecting...'}</span>
            </div>
        );
    }

    const hasVideo = stream.getVideoTracks().some(track => track.enabled);
    const hasAudio = stream.getAudioTracks().some(track => track.enabled);

    return (
        <div className={`relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden border group transition-all ${isPinned ? 'border-primary-500 ring-2 ring-primary-500/50' : 'border-gray-800'}`}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal} // Mute local video to prevent echo
                className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''} ${!hasVideo ? 'hidden' : ''}`}
            />
            
            {!hasVideo && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                        <User size={32} className="text-gray-500" />
                    </div>
                </div>
            )}

            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                    onClick={onPin}
                    className={`p-1.5 rounded-lg backdrop-blur-md border transition-colors ${
                        isPinned 
                            ? 'bg-primary-500/80 border-primary-400 text-white' 
                            : 'bg-black/60 border-white/10 text-gray-300 hover:text-white hover:bg-black/80'
                    }`}
                    title={isPinned ? "Unpin" : "Pin participant"}
                >
                    <Pin size={16} className={isPinned ? "fill-current" : ""} />
                </button>
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                    <span className="text-white text-xs font-medium truncate max-w-[100px]">
                        {name || 'Participant'} {isLocal && '(You)'}
                    </span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!hasAudio && (
                        <div className="bg-red-500/80 backdrop-blur-md p-1.5 rounded-lg">
                            <MicOff size={14} className="text-white" />
                        </div>
                    )}
                    {!hasVideo && (
                        <div className="bg-red-500/80 backdrop-blur-md p-1.5 rounded-lg">
                            <VideoOff size={14} className="text-white" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const VideoGrid = ({ localStream, remoteStreams = {}, participants = [] }) => {
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'focus'
    const [pinnedId, setPinnedId] = useState(null);

    const handlePin = (id) => {
        if (pinnedId === id) {
            setPinnedId(null);
            setViewMode('grid');
        } else {
            setPinnedId(id);
            setViewMode('focus');
        }
    };

    const allStreams = [
        { id: 'local', stream: localStream, isLocal: true, name: 'You' },
        ...Object.entries(remoteStreams).map(([id, stream]) => {
            const p = participants.find(part => part.id === id);
            return { id, stream, isLocal: false, name: p?.name };
        })
    ];

    if (viewMode === 'focus' && pinnedId) {
        const pinnedStream = allStreams.find(s => s.id === pinnedId) || allStreams[0];
        const otherStreams = allStreams.filter(s => s.id !== pinnedId);

        return (
            <div className="flex flex-col md:flex-row gap-4 w-full h-full p-4 bg-black/5 rounded-2xl">
                {/* Main Focus Area */}
                <div className="flex-1 relative aspect-video md:aspect-auto h-full max-h-[70vh] md:max-h-full">
                    <VideoElement 
                        stream={pinnedStream.stream} 
                        isLocal={pinnedStream.isLocal} 
                        name={pinnedStream.name}
                        isPinned={true}
                        onPin={() => handlePin(pinnedStream.id)}
                    />
                </div>
                {/* Sidebar Strip */}
                {otherStreams.length > 0 && (
                    <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto custom-scrollbar md:w-48 lg:w-64 pb-2 md:pb-0 h-32 md:h-full shrink-0">
                        {otherStreams.map(s => (
                            <div key={s.id} className="relative aspect-video w-40 md:w-full shrink-0">
                                <VideoElement 
                                    stream={s.stream} 
                                    isLocal={s.isLocal} 
                                    name={s.name}
                                    isPinned={false}
                                    onPin={() => handlePin(s.id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Grid View Layout
    const totalStreams = allStreams.length;
    let gridClass = "grid-cols-1";
    if (totalStreams === 2) gridClass = "grid-cols-1 sm:grid-cols-2";
    else if (totalStreams <= 4) gridClass = "grid-cols-2";
    else if (totalStreams <= 6) gridClass = "grid-cols-2 lg:grid-cols-3";
    else gridClass = "grid-cols-3 lg:grid-cols-4";

    return (
        <div className={`grid gap-4 w-full h-full p-4 bg-black/5 rounded-2xl ${gridClass}`}>
            {allStreams.map(s => (
                <div key={s.id} className="relative aspect-video max-h-full">
                    <VideoElement 
                        stream={s.stream} 
                        isLocal={s.isLocal} 
                        name={s.name}
                        isPinned={false}
                        onPin={() => handlePin(s.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default VideoGrid;
