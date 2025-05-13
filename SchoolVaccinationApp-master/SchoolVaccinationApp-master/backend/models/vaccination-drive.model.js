const mongoose = require("mongoose")

const vaccinationDriveSchema = new mongoose.Schema(
  {
    vaccineName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    availableDoses: {
      type: Number,
      required: true,
      min: 1,
    },
    applicableClasses: [
      {
        type: String,
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Making this optional for now
    },
  },
  {
    timestamps: true,
  },
)

const VaccinationDrive = mongoose.model("VaccinationDrive", vaccinationDriveSchema)

module.exports = VaccinationDrive
