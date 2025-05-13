const Student = require('../models/student.model');
const VaccinationDrive = require('../models/vaccination-drive.model');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total students count
    const totalStudents = await Student.countDocuments();

    // Get vaccinated students count (students with at least one completed vaccination)
    const vaccinatedStudents = await Student.countDocuments({
      'vaccinations.status': 'Completed',
    });

    // Calculate vaccination percentage
    const vaccinationPercentage = totalStudents > 0 ? Math.round((vaccinatedStudents / totalStudents) * 100) : 0;

    // Get upcoming vaccination drives (within next 30 days)
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    const upcomingDrives = await VaccinationDrive.find({
      date: {
        $gte: today,
        $lte: thirtyDaysLater,
      },
      status: 'Scheduled',
    }).sort({ date: 1 });

    // Get recent vaccination drives (completed in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const recentDrives = await VaccinationDrive.find({
      date: {
        $gte: thirtyDaysAgo,
        $lte: today,
      },
      status: 'Completed',
    }).sort({ date: -1 });

    // Get vaccination statistics by vaccine
    const vaccineStats = await Student.aggregate([
      { $unwind: '$vaccinations' },
      { $match: { 'vaccinations.status': 'Completed' } },
      {
        $group: {
          _id: '$vaccinations.vaccineName',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalStudents,
      vaccinatedStudents,
      vaccinationPercentage,
      upcomingDrives,
      recentDrives,
      vaccineStats,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate vaccination report
exports.generateReport = async (req, res) => {
  try {
    const { vaccineName, fromDate, toDate, class: studentClass, page = 1, limit = 10 } = req.query;

    // Build match stage for aggregation
    const match = {};

    if (vaccineName) {
      match['vaccinations.vaccineName'] = vaccineName;
    }

    if (fromDate || toDate) {
      match['vaccinations.dateAdministered'] = {};

      if (fromDate) {
        match['vaccinations.dateAdministered'].$gte = new Date(fromDate);
      }

      if (toDate) {
        match['vaccinations.dateAdministered'].$lte = new Date(toDate);
      }
    }

    if (studentClass) {
      match.class = studentClass;
    }

    // Add completed status to match
    match['vaccinations.status'] = 'Completed';

    // Count total documents for pagination
    const totalPipeline = [{ $unwind: '$vaccinations' }, { $match: match }, { $count: 'total' }];

    const totalResult = await Student.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // Get paginated report data
    const reportPipeline = [
      { $unwind: '$vaccinations' },
      { $match: match },
      { $sort: { 'vaccinations.dateAdministered': -1 } },
      { $skip: (page - 1) * limit },
      { $limit: Number.parseInt(limit) },
      {
        $project: {
          _id: 1,
          name: 1,
          studentId: 1,
          class: 1,
          section: 1,
          vaccineName: '$vaccinations.vaccineName',
          dateAdministered: '$vaccinations.dateAdministered',
          status: '$vaccinations.status',
        },
      },
    ];

    const report = await Student.aggregate(reportPipeline);

    res.json({
      report,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};