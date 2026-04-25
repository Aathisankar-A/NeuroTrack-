import React, { useState } from 'react';
import { Users, X } from 'lucide-react';
import { Card, Button } from '../ui';
import Modal from '../ui/Modal';

const BreakoutRoom = ({ participants, onAssign }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedParticipants, setSelectedParticipants] = useState([]);

    const toggleSelection = (id) => {
        if (selectedParticipants.includes(id)) {
            setSelectedParticipants(prev => prev.filter(pId => pId !== id));
        } else {
            setSelectedParticipants(prev => [...prev, id]);
        }
    };

    const handleCreate = () => {
        if (selectedParticipants.length > 0) {
            onAssign(selectedParticipants);
            setIsOpen(false);
            setSelectedParticipants([]);
        }
    };

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="rounded-xl">
                <Users size={16} className="mr-2" /> Breakout Room
            </Button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Breakout Session">
                <div className="space-y-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Select participants to move into a private sub-room for a 1-on-1 or small group session.
                    </p>
                    
                    <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                        {participants.map(p => (
                            <div 
                                key={p.id}
                                onClick={() => toggleSelection(p.id)}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${
                                    selectedParticipants.includes(p.id) 
                                        ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800'
                                        : 'bg-white border-gray-200 hover:border-primary-300 dark:bg-[#1E1E1E] dark:border-[#2A2A2A]'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                                    selectedParticipants.includes(p.id) ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                    {selectedParticipants.includes(p.id) && <X size={14} className="rotate-45" />}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.name || 'Anonymous User'}</p>
                                </div>
                            </div>
                        ))}
                        {participants.length === 0 && (
                            <div className="text-center py-4 text-sm text-gray-500">
                                No active participants to assign.
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={selectedParticipants.length === 0}>
                            Start Session
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default BreakoutRoom;
