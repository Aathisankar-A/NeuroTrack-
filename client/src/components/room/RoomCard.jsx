import React from 'react';
import { Users, Lock, Unlock, Play, Trash2 } from 'lucide-react';
import { Card, Button } from '../ui';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoomCard = ({ room, onDelete }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isHost = user && room.host && (room.host._id === user._id || room.host === user._id);

    return (
        <Card className="flex flex-col p-6 transition-all duration-300 hover:border-primary-200 dark:hover:border-primary-900 group h-full relative overflow-hidden">
            {/* Color accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">{room.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[40px]">{room.description || 'No description provided.'}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-xl text-gray-500 dark:text-gray-400 shrink-0">
                    {room.type === 'private' ? <Lock size={18} /> : <Unlock size={18} />}
                </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                    {room.mode}
                </span>
                {room.tags?.slice(0,2).map(tag => (
                    <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    <Users size={16} />
                    <span>{room.participants?.length || 0} / {room.maxParticipants}</span>
                </div>
                <div className="flex items-center gap-2">
                    {isHost && onDelete && (
                        <button 
                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(room._id);
                            }}
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                    <Button 
                        size="sm" 
                        className="rounded-xl px-5 flex items-center gap-2"
                        onClick={() => navigate(`/rooms/${room._id}`)}
                    >
                        <Play size={14} fill="currentColor" /> Join
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default RoomCard;
