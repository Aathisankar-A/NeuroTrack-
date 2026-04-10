import Classroom from '../models/Classroom.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import crypto from 'crypto';

class ClassroomController {
    static createClassroom = asyncHandler(async (req, res) => {
        const { name, subject } = req.body;
        
        // Generate a 6-character alphanumeric invite code
        const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        const classroom = await Classroom.create({
            name,
            subject,
            teacher: req.user.id,
            inviteCode
        });

        res.status(201).json(ApiResponse.success(classroom, 'Classroom created successfully'));
    });

    static getMyClassrooms = asyncHandler(async (req, res) => {
        // Find classrooms where user is teacher OR student
        const classrooms = await Classroom.find({
            $or: [
                { teacher: req.user.id },
                { students: req.user.id }
            ],
            isActive: true
        }).populate('teacher', 'name email').populate('students', 'name email xp level');

        res.json(ApiResponse.success(classrooms, 'Classrooms fetched'));
    });

    static joinClassroom = asyncHandler(async (req, res) => {
        const { inviteCode } = req.body;

        const classroom = await Classroom.findOne({ inviteCode: inviteCode.toUpperCase(), isActive: true });
        if (!classroom) {
            return res.status(404).json(ApiResponse.error('Invalid or expired invite code', 404));
        }

        // Check if already a student
        if (classroom.students.includes(req.user.id)) {
            return res.status(400).json(ApiResponse.error('You are already in this classroom', 400));
        }

        classroom.students.push(req.user.id);
        await classroom.save();

        res.json(ApiResponse.success(classroom, 'Successfully joined classroom'));
    });

    static getClassroomDetails = asyncHandler(async (req, res) => {
        const classroom = await Classroom.findById(req.params.id)
            .populate('teacher', 'name email')
            .populate('students', 'name email xp level');

        if (!classroom) {
            return res.status(404).json(ApiResponse.error('Classroom not found', 404));
        }

        // Make sure user is teacher or student
        const isTeacher = classroom.teacher._id.toString() === req.user.id;
        const isStudent = classroom.students.some(s => s._id.toString() === req.user.id);

        if (!isTeacher && !isStudent) {
            return res.status(403).json(ApiResponse.error('Access denied', 403));
        }

        res.json(ApiResponse.success(classroom, 'Classroom details fetched'));
    });

    static removeStudent = asyncHandler(async (req, res) => {
        const { id, studentId } = req.params;

        const classroom = await Classroom.findById(id);
        if (!classroom) {
            return res.status(404).json(ApiResponse.error('Classroom not found', 404));
        }

        // Only teacher can remove students
        if (classroom.teacher.toString() !== req.user.id) {
            return res.status(403).json(ApiResponse.error('Only the teacher can remove students', 403));
        }

        classroom.students = classroom.students.filter(s => s.toString() !== studentId);
        await classroom.save();

        res.json(ApiResponse.success(null, 'Student removed successfully'));
    });
}

export default ClassroomController;
