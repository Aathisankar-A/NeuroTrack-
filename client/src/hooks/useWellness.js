import { useState, useEffect, useRef } from 'react';

// This is a stub for the actual TensorFlow.js implementation
// In a full implementation, you would import @tensorflow/tfjs and @tensorflow-models/pose-detection
export const useWellness = () => {
    const [isTracking, setIsTracking] = useState(false);
    const [postureScore, setPostureScore] = useState(100);
    const [slouching, setSlouching] = useState(false);
    const [eyeStrainLevel, setEyeStrainLevel] = useState('Low');
    const [needsBreak, setNeedsBreak] = useState(false);
    
    const videoRef = useRef(null);
    const trackingInterval = useRef(null);
    const sessionTimer = useRef(0);

    const startTracking = async (videoElement) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoElement) {
                videoElement.srcObject = stream;
                videoRef.current = videoElement;
            }
            setIsTracking(true);
            
            // Simulate AI tracking loop
            trackingInterval.current = setInterval(() => {
                sessionTimer.current += 5; // 5 seconds passed
                
                // Simulate posture degradation over time
                const newScore = Math.max(0, 100 - (sessionTimer.current / 60));
                setPostureScore(Math.round(newScore));
                setSlouching(newScore < 50);

                // Simulate eye strain
                if (sessionTimer.current > 1200) { // 20 mins
                    setEyeStrainLevel('High');
                    setNeedsBreak(true);
                } else if (sessionTimer.current > 600) { // 10 mins
                    setEyeStrainLevel('Medium');
                }
            }, 5000);
        } catch (error) {
            console.error('Error accessing webcam', error);
        }
    };

    const stopTracking = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        clearInterval(trackingInterval.current);
        setIsTracking(false);
        setPostureScore(100);
        setSlouching(false);
        setEyeStrainLevel('Low');
        setNeedsBreak(false);
        sessionTimer.current = 0;
    };

    const takeBreak = () => {
        setNeedsBreak(false);
        setEyeStrainLevel('Low');
        sessionTimer.current = 0; // Reset session timer for eye strain
    };

    useEffect(() => {
        return () => {
            stopTracking();
        };
    }, []);

    return {
        isTracking,
        startTracking,
        stopTracking,
        postureScore,
        slouching,
        eyeStrainLevel,
        needsBreak,
        takeBreak
    };
};

export default useWellness;
