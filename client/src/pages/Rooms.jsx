import React, { useEffect, useState } from 'react';
import { Search, Plus, Users as UsersIcon, Filter, Loader2 } from 'lucide-react';
import { Button, Input } from '../components/ui';
import RoomCard from '../components/room/RoomCard';
import api from '../api/axios';
import Modal from '../components/ui/Modal';
import { useNavigate } from 'react-router-dom';

const Rooms = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Create Room State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newRoom, setNewRoom] = useState({
        name: '',
        description: '',
        type: 'public',
        mode: 'collaborative',
        maxParticipants: 20,
        tags: ''
    });

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const payload = {
                ...newRoom,
                tags: newRoom.tags.split(',').map(t => t.trim()).filter(Boolean)
            };
            const res = await api.post('/rooms', payload);
            setIsCreateModalOpen(false);
            navigate(`/rooms/${res.data.data._id}`);
        } catch (err) {
            console.error('Failed to create room', err);
            alert(err.response?.data?.message || 'Failed to create room');
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await api.get('/rooms');
                setRooms(res.data.data);
            } catch (err) {
                console.error('Failed to fetch rooms', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const filteredRooms = rooms.filter(room => 
        room.name.toLowerCase().includes(search.toLowerCase()) || 
        room.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-[#1E1E1E]">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E5E5E5] tracking-tight">Study Rooms</h1>
                    <p className="text-gray-500 dark:text-[#9CA3AF] mt-1 font-medium">Join a collaborative session or create your own focus environment.</p>
                </div>
                <div className="flex space-x-3">
                    <Button className="flex items-center space-x-2" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus size={18} />
                        <span>Create Room</span>
                    </Button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search rooms by name or tag..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-[#2A2A2A] rounded-xl bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                    <Button variant="outline" size="sm" className="whitespace-nowrap rounded-xl"><Filter size={16} className="mr-2"/> All</Button>
                    <Button variant="outline" size="sm" className="whitespace-nowrap rounded-xl text-gray-500">Solo Focus</Button>
                    <Button variant="outline" size="sm" className="whitespace-nowrap rounded-xl text-gray-500">Collaborative</Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="h-48 bg-gray-50 dark:bg-[#1E1E1E] rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredRooms.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-[#1E1E1E] rounded-3xl border border-dashed border-gray-200 dark:border-[#2A2A2A]">
                    <div className="mx-auto h-16 w-16 bg-white dark:bg-[#121212] rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <UsersIcon size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-[#E5E5E5] mb-2">No rooms found</h3>
                    <p className="text-gray-500 dark:text-[#9CA3AF] font-medium max-w-sm mx-auto mb-6">There are no active public rooms matching your criteria. Why not create one?</p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>Create a Room</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRooms.map(room => (
                        <RoomCard key={room._id} room={room} />
                    ))}
                </div>
            )}

            {/* Create Room Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create a Study Room"
            >
                <form onSubmit={handleCreateRoom} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Room Name *</label>
                        <Input 
                            required 
                            placeholder="e.g. Midnight Code & Chill" 
                            value={newRoom.name}
                            onChange={e => setNewRoom({...newRoom, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-[#E5E5E5] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-medium min-h-[100px] resize-y"
                            placeholder="What are we studying today?"
                            value={newRoom.description}
                            onChange={e => setNewRoom({...newRoom, description: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Mode</label>
                            <select 
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] text-gray-900 dark:text-[#E5E5E5] focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-medium"
                                value={newRoom.mode}
                                onChange={e => setNewRoom({...newRoom, mode: e.target.value})}
                            >
                                <option value="collaborative">Collaborative</option>
                                <option value="solo-focus">Solo Focus</option>
                                <option value="silent-library">Silent Library</option>
                                <option value="teach">Teaching</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Max Participants</label>
                            <Input 
                                type="number" 
                                min="2" max="50" 
                                value={newRoom.maxParticipants}
                                onChange={e => setNewRoom({...newRoom, maxParticipants: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
                        <Input 
                            placeholder="e.g. React, Math, Pomodoro" 
                            value={newRoom.tags}
                            onChange={e => setNewRoom({...newRoom, tags: e.target.value})}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2A2A2A]">
                        <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={creating} className="min-w-[120px]">
                            {creating ? <Loader2 size={18} className="animate-spin" /> : 'Create Room'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Rooms;
