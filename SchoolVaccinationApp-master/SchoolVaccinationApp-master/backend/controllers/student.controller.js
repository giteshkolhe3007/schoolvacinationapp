const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const Student = require('../models/student.model');
const VaccinationDrive = require('../models/vaccination-drive.model');

// Get all students with optional filters
exports.getAllStudents = async (req, res) => {
    try {
        const { name, studentId, class: studentClass, vaccinationStatus, page = 1, limit = 10 } = req.query;

        // Build query
        const query = {};

        if (name) query.name = { $regex: name, $options: 'i' };
        if (studentId) query.studentId = { $regex: studentId, $options: 'i' };
        if (studentClass) query.class = studentClass;

        // Handle vaccination status filter if provided
        if (vaccinationStatus) {
            if (vaccinationStatus === 'vaccinated') {
                query['vaccinations.status'] = 'Completed';
            } else if (vaccinationStatus === 'not-vaccinated') {
                query['vaccinations.status'] = { $ne: 'Completed' };
            }
        }

        // Count total documents for pagination
        const total = await Student.countDocuments(query);

        // Get paginated students
        const students = await Student.find(query)
            .skip((page - 1) * limit)
            .limit(Number.parseInt(limit))
            .sort({ name: 1 });

        res.json({
            students,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('vaccinations.drive');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new student
exports.createStudent = async (req, res) => {
    try {
        const { name, studentId, class: studentClass, section, age, gender } = req.body;

        // Check if student ID already exists
        const existingStudent = await Student.findOne({ studentId });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student ID already exists' });
        }

        // Create new student
        const student = new Student({
            name,
            studentId,
            class: studentClass,
            section,
            age,
            gender,
            vaccinations: [],
        });

        await student.save();

        res.status(201).json(student);
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update student
exports.updateStudent = async (req, res) => {
    try {
        const { name, studentId, class: studentClass, section, age, gender } = req.body;

        // Check if student exists
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if updated student ID already exists (if changed)
        if (studentId !== student.studentId) {
            const existingStudent = await Student.findOne({ studentId });
            if (existingStudent) {
                return res.status(400).json({ message: 'Student ID already exists' });
            }
        }

        // Update student
        student.name = name;
        student.studentId = studentId;
        student.class = studentClass;
        student.section = section;
        student.age = age;
        student.gender = gender;

        await student.save();

        res.json(student);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete student
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await student.deleteOne();

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Bulk import students via CSV
exports.importStudents = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    const filePath = path.join(__dirname, '..', req.file.path);

    const students = [];
    const errors = [];

    try {
        const rows = await parseCSV(filePath);
        console.log(rows, 'rows');

        for (const row of rows) {
            try {
                // Basic validation
                if (!row.name || !row.studentId || !row.class || !row.section || !row.age || !row.gender) {
                    errors.push({ row, error: 'Missing required fields' });
                    continue;
                }

                const existingStudent = await Student.findOne({ studentId: row.studentId });
                if (existingStudent) {
                    errors.push({ row, error: 'Student ID already exists' });
                    continue;
                }

                const student = new Student({
                    name: row.name,
                    studentId: row.studentId,
                    class: row.class,
                    section: row.section,
                    age: parseInt(row.age),
                    gender: row.gender,
                    vaccinations: [],
                });

                await student.save();
                students.push(student);
            } catch (err) {
                errors.push({ row, error: err.message });
            }
        }

        fs.unlinkSync(filePath); // Clean up uploaded file

        res.json({
            message: `Imported ${students.length} students successfully`,
            errors: errors.length > 0 ? errors : null,
        });
    } catch (err) {
        console.error('CSV processing error:', err);
        res.status(500).json({ message: 'Failed to process CSV', error: err.message });
    }
};

// Mark student as vaccinated
exports.vaccinateStudent = async (req, res) => {
    try {
        const { driveId } = req.body;

        // Check if student exists
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if drive exists
        const drive = await VaccinationDrive.findById(driveId);
        if (!drive) {
            return res.status(404).json({ message: 'Vaccination drive not found' });
        }

        // Check if drive is completed or cancelled
        if (drive.status !== 'Scheduled') {
            return res.status(400).json({ message: `Drive is ${drive.status.toLowerCase()}, cannot vaccinate student` });
        }

        // Check if student's class is applicable for this drive
        if (!drive.applicableClasses.includes(student.class)) {
            return res.status(400).json({ message: 'Student\'s class is not applicable for this drive' });
        }

        // Check if student is already vaccinated in this drive
        const alreadyVaccinated = student.vaccinations.some(
            (v) => v.drive.toString() === driveId && v.status === 'Completed',
        );

        if (alreadyVaccinated) {
            return res.status(400).json({ message: 'Student is already vaccinated in this drive' });
        }

        // Check if drive has available doses
        if (drive.availableDoses <= 0) {
            return res.status(400).json({ message: 'No doses available in this drive' });
        }

        // Add vaccination record to student
        student.vaccinations.push({
            drive: driveId,
            vaccineName: drive.vaccineName,
            dateAdministered: new Date(),
            status: 'Completed',
        });

        await student.save();

        // Decrease available doses in drive
        drive.availableDoses -= 1;
        await drive.save();

        res.json({
            message: 'Student vaccinated successfully',
            student,
            drive,
        });
    } catch (error) {
        console.error('Error vaccinating student:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper function to parse CSV into an array
function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const data = [];
      fs.createReadStream(filePath)
        .pipe(csv.parse({ headers: true, ignoreEmpty: true, trim: true }))
        .on('error', (error) => reject(error))
        .on('data', (row) => data.push(row))
        .on('end', () => resolve(data));
    });
  }
  