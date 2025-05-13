const Student = require("../models/student.model")
const VaccinationDrive = require("../models/vaccination-drive.model")
const mongoose = require("mongoose")

/**
 * Generate vaccination report based on filters
 */
exports.generateReport = async (req, res) => {
    try {
        const { vaccineName, fromDate, toDate, class: studentClass } = req.query;

        const pipeline = [];

        // Unwind the vaccinations array
        pipeline.push({
            $unwind: {
                path: "$vaccinations",
                preserveNullAndEmptyArrays: false,
            },
        });

        // Match only completed vaccinations
        pipeline.push({ $match: { "vaccinations.status": "Completed" } });

        // Dynamically build match conditions
        const matchStage = {};

        if (studentClass) {
            matchStage.class = studentClass; // string match
        }

        if (vaccineName) {
            matchStage["vaccinations.vaccineName"] = vaccineName;
        }

        if (fromDate || toDate) {
            matchStage["vaccinations.dateAdministered"] = {};
            if (fromDate) {
                matchStage["vaccinations.dateAdministered"].$gte = new Date(fromDate);
            }
            if (toDate) {
                const toDateObj = new Date(toDate);
                toDateObj.setHours(23, 59, 59, 999); // include the full end date
                matchStage["vaccinations.dateAdministered"].$lte = toDateObj;
            }
        }

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        pipeline.push({
            $project: {
                _id: 0,
                studentId: 1,
                name: 1,
                class: 1,
                section: 1,
                vaccineName: "$vaccinations.vaccineName",
                dateAdministered: "$vaccinations.dateAdministered",
            },
        });

        pipeline.push({ $sort: { dateAdministered: -1 } });

        const reportData = await Student.aggregate(pipeline);

        console.log(`Generated report with ${reportData.length} records. Filters:`, req.query);
        res.json(reportData);
    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


/**
 * Get vaccine statistics
 */
exports.getVaccineStats = async (req, res) => {
    try {
        const vaccineStats = await Student.aggregate([
            { $unwind: { path: "$vaccinations", preserveNullAndEmptyArrays: false } },
            { $match: { "vaccinations.status": "Completed" } },
            {
                $group: {
                    _id: "$vaccinations.vaccineName",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ])

        res.json(vaccineStats)
    } catch (error) {
        console.error("Error fetching vaccine statistics:", error)
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

/**
 * Get available vaccines (from vaccination drives)
 */
exports.getAvailableVaccines = async (req, res) => {
    try {
        // First try to get vaccines from completed vaccinations
        const vaccinesFromVaccinations = await Student.distinct("vaccinations.vaccineName", {
            "vaccinations.status": "Completed",
        })

        if (vaccinesFromVaccinations && vaccinesFromVaccinations.length > 0) {
            return res.json(vaccinesFromVaccinations)
        }

        // If no completed vaccinations, get from drives
        const vaccinesFromDrives = await VaccinationDrive.distinct("vaccineName")
        res.json(vaccinesFromDrives)
    } catch (error) {
        console.error("Error fetching available vaccines:", error)
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

/**
 * Get class statistics
 */
exports.getClassStats = async (req, res) => {
    try {
        const classStats = await Student.aggregate([
            {
                $group: {
                    _id: "$class",
                    total: { $sum: 1 },
                    vaccinated: {
                        $sum: {
                            $cond: [
                                {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: { input: "$vaccinations", as: "v", cond: { $eq: ["$$v.status", "Completed"] } },
                                            },
                                        },
                                        0,
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ])

        // Calculate percentage and format response
        const formattedStats = classStats.map((stat) => ({
            class: stat._id,
            total: stat.total,
            vaccinated: stat.vaccinated,
            percentage: stat.total > 0 ? Math.round((stat.vaccinated / stat.total) * 100) : 0,
        }))

        res.json(formattedStats)
    } catch (error) {
        console.error("Error fetching class statistics:", error)
        res.status(500).json({ message: "Server error", error: error.message })
    }
}
