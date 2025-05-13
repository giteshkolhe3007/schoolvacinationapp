
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    class: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    vaccinations: [
      {
        drive: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'VaccinationDrive',
        },
        vaccineName: String,
        dateAdministered: Date,
        status: {
          type: String,
          enum: ['Scheduled', 'Completed', 'Missed'],
          default: 'Scheduled',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;