import React, { useState, useEffect } from 'react';
import { Card, Input, Button } from '../components/ui';
import Modal from '../components/ui/Modal';
import api from '../api/axios';
import StudentCard from '../components/teacher/StudentCard';
import ClassAnalytics from '../components/teacher/ClassAnalytics';
import InterventionPanel from '../components/teacher/InterventionPanel';
import { Users, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [classrooms, setClassrooms] = useState([]);
    const [selectedClassroomId, setSelectedClassroomId] = useState(null);
    const [classroomDetails, setClassroomDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    // Create Classroom State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newClassroom, setNewClassroom] = useState({ name: '', subject: '' });

    const handleCreateClassroom = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await api.post('/classrooms', newClassroom);
            setIsCreateModalOpen(false);
            setNewClassroom({ name: '', subject: '' });
            await fetchClassrooms();
            setSelectedClassroomId(res.data.data._id);
        } catch (error) {
            console.error('Error creating classroom', error);
            alert(error.response?.data?.message || 'Failed to create classroom');
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            const res = await api.get('/classrooms');
            setClassrooms(res.data.data);
            if (res.data.data.length > 0) {
                setSelectedClassroomId(res.data.data[0]._id);
            }
        } catch (error) {
            console.error('Error fetching classrooms', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedClassroomId) {
            fetchClassroomDetails(selectedClassroomId);
        }
    }, [selectedClassroomId]);

    const fetchClassroomDetails = async (id) => {
        try {
            const res = await api.get(`/classrooms/${id}`);
            setClassroomDetails(res.data.data);
        } catch (error) {
            console.error('Error fetching classroom details', error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-[#1E1E1E] pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E5E5E5] tracking-tight">Teacher Dashboard</h1>
                    <p className="text-gray-500 dark:text-[#9CA3AF] mt-1 font-medium">Monitor your students' cognitive performance.</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all shadow-sm">
                    <Plus size={18} />
                    <span>Create Classroom</span>
                </button>
            </div>

            {classrooms.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full mb-4">
                        <Users size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Classrooms Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">Create your first classroom to invite students and start monitoring their progress.</p>
                    <button onClick={() => setIsCreateModalOpen(true)} className="px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
                        Create Classroom
                    </button>
                </Card>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar / List of classrooms */}
                    <div className="w-full lg:w-64 shrink-0 space-y-2">
                        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Your Classrooms</h3>
                        {classrooms.map(c => (
                            <button
                                key={c._id}
                                onClick={() => setSelectedClassroomId(c._id)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                                    selectedClassroomId === c._id 
                                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400' 
                                    : 'bg-white dark:bg-[#1E1E1E] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] text-gray-700 dark:text-gray-300'
                                } border border-transparent hover:border-gray-200 dark:hover:border-gray-700`}
                            >
                                <p className="font-bold">{c.name}</p>
                                <p className="text-xs mt-1 opacity-80">{c.students.length} Students</p>
                            </button>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 space-y-6 min-w-0">
                        {classroomDetails && (
                            <>
                                <div className="flex items-center justify-between bg-white dark:bg-[#1E1E1E] p-4 rounded-xl border border-gray-100 dark:border-[#2A2A2A]">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{classroomDetails.name}</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Invite Code: <span className="font-mono font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded ml-1">{classroomDetails.inviteCode}</span></p>
                                    </div>
                                    <InterventionPanel classroomId={classroomDetails._id} />
                                </div>
                                
                                <ClassAnalytics students={classroomDetails.students} />

                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Students</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {classroomDetails.students.map(student => (
                                            <StudentCard key={student._id} student={student} classroomId={classroomDetails._id} />
                                        ))}
                                        {classroomDetails.students.length === 0 && (
                                            <div className="col-span-full p-8 text-center text-gray-500 border border-dashed rounded-xl dark:border-[#2A2A2A]">
                                                No students have joined yet. Share the invite code!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Create Classroom Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create a Classroom"
            >
                <form onSubmit={handleCreateClassroom} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Classroom Name *</label>
                        <Input 
                            required 
                            placeholder="e.g. Advanced Mathematics 101" 
                            value={newClassroom.name}
                            onChange={e => setNewClassroom({...newClassroom, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                        <Input 
                            placeholder="e.g. Math" 
                            value={newClassroom.subject}
                            onChange={e => setNewClassroom({...newClassroom, subject: e.target.value})}
                        />
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2A2A2A]">
                        <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={creating} className="min-w-[140px]">
                            {creating ? <Loader2 size={18} className="animate-spin" /> : 'Create Classroom'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TeacherDashboard;
