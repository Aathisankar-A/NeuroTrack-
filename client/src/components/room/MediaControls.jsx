import React from 'react';
import { Mic, MicOff, Video, VideoOff, MonitorUp, LogOut } from 'lucide-react';
import { Button } from '../ui';

const MediaControls = ({ mediaState, onToggleVideo, onToggleAudio, onToggleScreen, onLeave }) => {
    return (
        <div className="flex items-center justify-center gap-4 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border border-gray-200 dark:border-[#2A2A2A] p-4 rounded-3xl shadow-lg">
            <Button
                variant={mediaState.audio ? 'outline' : 'danger'}
                className="rounded-full w-12 h-12 p-0 flex items-center justify-center border-gray-200 dark:border-[#2A2A2A]"
                onClick={onToggleAudio}
            >
                {mediaState.audio ? <Mic size={20} /> : <MicOff size={20} />}
            </Button>

            <Button
                variant={mediaState.video ? 'outline' : 'danger'}
                className="rounded-full w-12 h-12 p-0 flex items-center justify-center border-gray-200 dark:border-[#2A2A2A]"
                onClick={onToggleVideo}
            >
                {mediaState.video ? <Video size={20} /> : <VideoOff size={20} />}
            </Button>

            <Button
                variant={mediaState.screen ? 'primary' : 'outline'}
                className="rounded-full w-12 h-12 p-0 flex items-center justify-center border-gray-200 dark:border-[#2A2A2A]"
                onClick={onToggleScreen}
            >
                <MonitorUp size={20} />
            </Button>

            <div className="w-px h-8 bg-gray-200 dark:bg-gray-800 mx-2"></div>

            <Button
                variant="danger"
                className="rounded-full px-6 h-12 flex items-center gap-2 bg-red-500 hover:bg-red-600 border-none text-white font-bold"
                onClick={onLeave}
            >
                <LogOut size={18} />
                <span>Leave</span>
            </Button>
        </div>
    );
};

export default MediaControls;
