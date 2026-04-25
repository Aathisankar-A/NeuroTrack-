import React, { useRef } from 'react';
import PostureTracker from './PostureTracker';
import EyeStrainMonitor from './EyeStrainMonitor';
import useWellness from '../../hooks/useWellness';
import { Camera, CameraOff, ShieldCheck } from 'lucide-react';

const WellnessPanel = () => {
    const { 
        isTracking, 
        startTracking, 
        stopTracking, 
        postureScore, 
        slouching, 
        eyeStrainLevel, 
        needsBreak, 
        takeBreak 
    } = useWellness();
    
    const videoRef = useRef(null);

    const toggleTracking = () => {
        if (isTracking) {
            stopTracking();
        } else {
            startTracking(videoRef.current);
        }
    };

    return (
        <div className="w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-[#1E1E1E] p-4 rounded-xl border border-gray-100 dark:border-[#2A2A2A]">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Wellness AI
                        <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <ShieldCheck size={12} /> Local Processing Only
                    </p>
                </div>
                <button 
                    onClick={toggleTracking}
                    className={`p-2 rounded-lg transition-colors ${isTracking ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40' : 'bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40'}`}
                >
                    {isTracking ? <CameraOff size={20} /> : <Camera size={20} />}
                </button>
            </div>

            {/* Hidden video element for processing */}
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="hidden" 
            />

            {isTracking ? (
                <>
                    <PostureTracker postureScore={postureScore} slouching={slouching} />
                    <EyeStrainMonitor eyeStrainLevel={eyeStrainLevel} needsBreak={needsBreak} takeBreak={takeBreak} />
                </>
            ) : (
                <div className="p-6 text-center bg-gray-50 dark:bg-[#1E1E1E] border border-dashed border-gray-200 dark:border-[#2A2A2A] rounded-xl">
                    <CameraOff className="mx-auto text-gray-400 mb-3" size={32} />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Wellness tracking is off.</p>
                    <p className="text-xs text-gray-500">Enable camera to track posture and eye strain. Processing happens locally in your browser.</p>
                </div>
            )}
        </div>
    );
};

export default WellnessPanel;
