import { generateUniqueCode } from "../../middlewares/utils.js"
import DonationModel from "../../models/acn/Donations.js"
import moment from 'moment'; 

export async function newDonation(req, res) {
    const { firstName, lastName, email, phoneNumber, country, donationType } = req.body
    if(!firstName || !lastName || !email || !phoneNumber || !country || !donationType){
        return res.status(400).json({ success: false, data: 'Fill all fields.' })
    }
    try {
        const donationId = await generateUniqueCode(8)
        console.log('DONATION ID', donationId)

        const newTeamMember = await DonationModel.create({
            firstName, lastName, email, phoneNumber, country, donationId, donationType
        })
        
        res.status(210).json({ success: false, data: 'Donation created' })
    } catch (error) {
        console.log('UNABLE TO CREATE NEW DONATION', error)
        res.status(500).json({ success: false, data: 'Unable to create donation' })
    }
}

export async function getAllDonation(req, res) {
    try {
        const getAllDonbations = await DonationModel.find().select('-_id')

        res.status(200).json({ success: false, data: getAllDonbations })
    } catch (error) {
        console.log('UNABLE TO GET ALL DONATIONS', error)
        res.status(500).json({ success: false, data: 'Unable to get all donations' }) 
    }
}

export async function getDonation(req, res) {
    const { id } = req.params
    try {
        const getDonationData = await DonationModel.findOne({ donationId: id })
        if(!getDonationData){
            return res.status(404).json({ success: false, data: 'Team Memeber not found' })
        }

        res.status(200).json({ success: true, data: getDonationData })
    } catch (error) {
        console.log('UNABLE TO GET DONATION', error)
        res.status(500).json({ success: false, data: 'Unable to get donation' })
    }
}

export async function toggleActiveStatus(req, res) {
    const { id } = req.params
    try {
        const getDonationData = await DonationModel.findOne({ donationId: id })
        if(!getDonationData){
            return res.status(404).json({ success: false, data: 'Team Memeber not found' })
        }

        getDonationData.status = !getDonationData.status
        await getDonationData.save()

        res.status(200).json({ success: true, data: 'Donation active status updated' })
    } catch (error) {
        console.log('UNABLE TO UPDATE DONATION STATUS', error)
        res.status(500).json({ success: false, data: 'Unable to donation status' })
    }
}

export async function deleteDonation(req, res) {
    const { id } = req.params
    try {
        const getDonationData = await DonationModel.findOne({ donationId: id })
        if(!getDonationData){
            return res.status(404).json({ success: false, data: 'Team Memeber not found' })
        }

        const deleteTeamMember = await DonationModel.findOneAndDelete({ donationId: id })

        res.status(200).json({ success: true, data: 'Donation deleted succesful' })
    } catch (error) {
        console.log('UNABLE TO GET DELETE DONATIONS', error)
        res.status(500).json({ success: false, data: 'Unable to get delete donation' })
    }
}

// Helper function to calculate the date range based on selected period
function getDateRange(period, isPrevious = false) {
    const now = moment();
    let startDate;

    // Adjust based on whether you're calculating the previous period
    if (isPrevious) {
        now.subtract(1, 'day'); // Move one day back to get the full range of the previous period
    }

    switch (period) {
        case '12mth':
            startDate = now.clone().subtract(12, 'months'); // Use clone to preserve the original 'now'
            break;
        case '3mth':
            startDate = now.clone().subtract(3, 'months');
            break;
        case '30days':
            startDate = now.clone().subtract(30, 'days');
            break;
        case '7days':
            startDate = now.clone().subtract(7, 'days');
            break;
        case '24hrs':
            startDate = now.clone().subtract(24, 'hours');
            break;
        default:
            startDate = now.clone().subtract(30, 'days'); // Default to 30 days if no period is selected
            break;
    }

    return { startDate: startDate.toDate(), endDate: now.toDate() };
}

export async function getDonationStats(req, res) {
    try {
        const { period } = req.params; // Get the selected period from the URL params (e.g., '12mth', '3mth')
        console.log('PERIOD:', period);

        // Validate the period parameter
        if (!period || !['12mth', '3mth', '30days', '7days', '24hrs'].includes(period)) {
            return res.status(400).json({ success: false, message: 'Invalid period provided.' });
        }

        // Get current period date range
        const { startDate, endDate } = getDateRange(period);

        // Fetch orders within the selected period (current period)
        const donationTotal = await DonationModel.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, totalPaid: { $sum: 1 } } }
        ]);

        const pendingOrders = await DonationModel.aggregate([
            { $match: { status: 'Pending', createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, totalCount: { $sum: '$amount' } } } // Count total number of pending orders
        ]);

        const approvedDonations = await DonationModel.aggregate([
            { $match: { status: true, createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, totalCount: { $sum: '$amount' } } } // Count total number of approved orders
        ]);

        const allDonations = await DonationModel.aggregate([
            { $match: { status: true, createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, totalCount: { $sum: 1 } } } // Count total number of all orders
        ]);

        // Get previous period data (calculate previous period range)
        const { startDate: prevStartDate, endDate: prevEndDate } = getDateRange(period, true); // isPrevious = true

        // Fetch orders for the previous period
        const prevdonationTotal = await DonationModel.aggregate([
            { $match: { createdAt: { $gte: prevStartDate, $lte: prevEndDate } } },
            { $group: { _id: null, totalPaid: { $sum: '$amount' } } } // Sum up the amount for paid orders
        ]);

        const prevPendingOrders = await DonationModel.aggregate([
            { $match: { status: 'Pending', createdAt: { $gte: prevStartDate, $lte: prevEndDate } } },
            { $group: { _id: null, totalCount: { $sum: 1 } } } // Count total number of pending orders
        ]);

        const prevApprovedDonations = await DonationModel.aggregate([
            { $match: { status: true, createdAt: { $gte: prevStartDate, $lte: prevEndDate } } },
            { $group: { _id: null, totalCount: { $sum: 1 } } } // Count total number of approved orders
        ]);

        const prevAllDonation = await DonationModel.aggregate([
            { $match: { status: true, createdAt: { $gte: prevStartDate, $lte: prevEndDate } } },
            { $group: { _id: null, totalCount: { $sum: 1 } } } // Count total number of all orders
        ]);

        // Calculate percentages and determine whether the percentage is positive or negative
        const calculatePercentage = (currentValue, previousValue) => {
            if (previousValue === 0) {
                return { percentage: currentValue === 0 ? 0 : 100, percentageType: 'positive' };
            }
            const percentage = ((currentValue - previousValue) / previousValue) * 100;
            const percentageType = percentage >= 0 ? 'positive' : 'negative';
            return { percentage, percentageType };
        };

        const donationTotalPercentageData = calculatePercentage(donationTotal[0]?.totalPaid || 0, prevdonationTotal[0]?.totalPaid || 0);
        const pendingPercentageData = calculatePercentage(pendingOrders[0]?.totalCount || 0, prevPendingOrders[0]?.totalCount || 0);
        const approvedPercentageData = calculatePercentage(approvedDonations[0]?.totalCount || 0, prevApprovedDonations[0]?.totalCount || 0);
        const allDonationsPercentageData = calculatePercentage(allDonations[0]?.totalCount || 0, prevAllDonation[0]?.totalCount || 0);

        const data = {
            totalDonations: {
                total: donationTotal.length ? donationTotal[0].totalPaid : 0,
                percentage: donationTotalPercentageData.percentage,
                percentageType: donationTotalPercentageData.percentageType,
            },
            totalExpense: { 
                total: pendingOrders.length ? pendingOrders[0].totalCount : 0,
                percentage: pendingPercentageData.percentage,
                percentageType: pendingPercentageData.percentageType,
            },
            totalDonationsAmount: {
                total: approvedDonations.length ? approvedDonations[0].totalCount : 0,
                percentage: approvedPercentageData.percentage,
                percentageType: approvedPercentageData.percentageType,
            },
            totalSuccessfulDonation: {
                total: allDonations.length ? allDonations[0].totalCount : 0,
                percentage: allDonationsPercentageData.percentage,
                percentageType: allDonationsPercentageData.percentageType,
            }
        };

        // Sending response
        res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {
        console.log('UNABLE TO GET DONATION STATS', error)
        res.status(500).json({ success: false, data: 'Unable to get donation stats' })
    }
}