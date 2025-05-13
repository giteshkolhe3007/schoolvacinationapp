const VaccinationDrive = require("../models/vaccination-drive.model")
const Student = require("../models/student.model")

// Get all vaccination drives with optional filters
exports.getAllDrives = async (req, res) => {
  try {
    const { status, upcoming, page = 1, limit = 10 } = req.query

    // Build query
    const query = {}

    if (status) query.status = status

    // Handle upcoming filter (drives within next 30 days)
    if (upcoming === "true") {
      const today = new Date()
      const thirtyDaysLater = new Date()
      thirtyDaysLater.setDate(today.getDate() + 30)

      query.date = {
        $gte: today,
        $lte: thirtyDaysLater,
      }
      query.status = "Scheduled"
    }

    // Count total documents for pagination
    const total = await VaccinationDrive.countDocuments(query)

    // Get paginated drives
    const drives = await VaccinationDrive.find(query)
      .skip((page - 1) * limit)
      .limit(Number.parseInt(limit))
      .sort({ date: 1 })

    res.json({
      drives,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Error fetching vaccination drives:", error)
    res.status(500).json({ message: "Server error", error: error.toString() })
  }
}

// Get vaccination drive by ID
exports.getDriveById = async (req, res) => {
  try {
    const drive = await VaccinationDrive.findById(req.params.id)

    if (!drive) {
      return res.status(404).json({ message: "Vaccination drive not found" })
    }

    res.json(drive)
  } catch (error) {
    console.error("Error fetching vaccination drive:", error)
    res.status(500).json({ message: "Server error", error: error.toString() })
  }
}

// Create new vaccination drive
exports.createDrive = async (req, res) => {
  try {
    console.log("Creating drive with data:", req.body)

    const { vaccineName, date, availableDoses, applicableClasses } = req.body

    // Basic validation
    if (!vaccineName || !date || !availableDoses || !applicableClasses || !Array.isArray(applicableClasses)) {
      return res.status(400).json({
        message: "Missing required fields",
        required: { vaccineName: "string", date: "date", availableDoses: "number", applicableClasses: "array" },
        received: req.body,
      })
    }

    // Create new vaccination drive
    const drive = new VaccinationDrive({
      vaccineName,
      date: new Date(date),
      availableDoses: Number(availableDoses),
      applicableClasses,
      // If auth middleware is working, use the user ID, otherwise use a default
      createdBy: req.user ? req.user.id : undefined,
    })

    await drive.save()
    console.log("Drive saved successfully:", drive)

    res.status(201).json(drive)
  } catch (error) {
    console.error("Error creating vaccination drive:", error)
    res.status(500).json({
      message: "Server error while creating drive",
      error: error.toString(),
      stack: error.stack,
    })
  }
}

// Update vaccination drive
exports.updateDrive = async (req, res) => {
  try {
    const { vaccineName, date, availableDoses, applicableClasses } = req.body

    // Check if drive exists
    const drive = await VaccinationDrive.findById(req.params.id)
    if (!drive) {
      return res.status(404).json({ message: "Vaccination drive not found" })
    }

    // Check if drive is already completed or cancelled
    if (drive.status !== "Scheduled") {
      return res.status(400).json({
        message: `Cannot update a ${drive.status.toLowerCase()} vaccination drive`,
      })
    }

    // Update drive fields if provided
    if (vaccineName) drive.vaccineName = vaccineName
    if (date) drive.date = new Date(date)
    if (availableDoses) drive.availableDoses = Number(availableDoses)
    if (applicableClasses) drive.applicableClasses = applicableClasses

    await drive.save()

    res.json(drive)
  } catch (error) {
    console.error("Error updating vaccination drive:", error)
    res.status(500).json({ message: "Server error", error: error.toString() })
  }
}

// Delete a vaccination drive
exports.deleteDrive = async (req, res) => {
    try {
      const drive = await VaccinationDrive.findById(req.params.id)
  
      if (!drive) {
        return res.status(404).json({ success: false, message: "Vaccination drive not found" })
      }
  
      // Check if the drive is in the past
      const today = new Date()
      const driveDate = new Date(drive.driveDate)
  
      if (driveDate < today) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete past vaccination drives",
        })
      }
  
      // Check if any students are already vaccinated in this drive
      const studentsVaccinated = await Student.countDocuments({
        "vaccinations.vaccineId": drive._id,
      })
  
      if (studentsVaccinated > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete drive as ${studentsVaccinated} students are already vaccinated`,
        })
      }
  
      await VaccinationDrive.findByIdAndDelete(req.params.id)
  
      res.json({ success: true, message: "Vaccination drive deleted successfully" })
    } catch (error) {
      console.error("Error deleting vaccination drive:", error)
      res.status(500).json({
        success: false,
        message: "Failed to delete vaccination drive",
        error: error.message,
      })
    }
  }
  

// Cancel vaccination drive
exports.cancelDrive = async (req, res) => {
  try {
    // Check if drive exists
    const drive = await VaccinationDrive.findById(req.params.id)
    if (!drive) {
      return res.status(404).json({ message: "Vaccination drive not found" })
    }

    // Check if drive is already completed or cancelled
    if (drive.status !== "Scheduled") {
      return res.status(400).json({
        message: `Cannot cancel a ${drive.status.toLowerCase()} vaccination drive`,
      })
    }

    // Cancel drive
    drive.status = "Cancelled"
    await drive.save()

    // Update all scheduled vaccinations for this drive to 'Missed'
    await Student.updateMany(
      { "vaccinations.drive": drive._id, "vaccinations.status": "Scheduled" },
      { $set: { "vaccinations.$.status": "Missed" } },
    )

    res.json({
      message: "Vaccination drive cancelled successfully",
      drive,
    })
  } catch (error) {
    console.error("Error cancelling vaccination drive:", error)
    res.status(500).json({ message: "Server error", error: error.toString() })
  }
}

// Mark vaccination drive as completed
exports.completeDrive = async (req, res) => {
  try {
    // Check if drive exists
    const drive = await VaccinationDrive.findById(req.params.id)
    if (!drive) {
      return res.status(404).json({ message: "Vaccination drive not found" })
    }

    // Check if drive is already completed or cancelled
    if (drive.status !== "Scheduled") {
      return res.status(400).json({
        message: `Cannot complete a ${drive.status.toLowerCase()} vaccination drive`,
      })
    }

    // Complete drive
    drive.status = "Completed"
    await drive.save()

    // Update all scheduled vaccinations for this drive to 'Missed'
    await Student.updateMany(
      { "vaccinations.drive": drive._id, "vaccinations.status": "Scheduled" },
      { $set: { "vaccinations.$.status": "Missed" } },
    )

    res.json({
      message: "Vaccination drive marked as completed successfully",
      drive,
    })
  } catch (error) {
    console.error("Error completing vaccination drive:", error)
    res.status(500).json({ message: "Server error", error: error.toString() })
  }
}

// Get students for a specific drive
exports.getDriveStudents = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    // Check if drive exists
    const drive = await VaccinationDrive.findById(req.params.id)
    if (!drive) {
      return res.status(404).json({ message: "Vaccination drive not found" })
    }

    // Build query
    const query = {
      "vaccinations.drive": drive._id,
    }

    if (status) {
      query["vaccinations.status"] = status
    }

    // Count total documents for pagination
    const total = await Student.countDocuments(query)

    // Get paginated students
    const students = await Student.find(query)
      .skip((page - 1) * limit)
      .limit(Number.parseInt(limit))
      .sort({ name: 1 })

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Error fetching students for drive:", error)
    res.status(500).json({ message: "Server error", error: error.toString() })
  }
}
