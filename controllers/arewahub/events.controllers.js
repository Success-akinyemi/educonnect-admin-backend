import { generateUniqueCode } from "../../middlewares/utils.js";
import EventModel from "../../models/arewahub/Events.js";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// NEW EVENT
export async function newEvent(req, res) {
    const { eventName, location, speakers, schedule, eventDescription, eventDate, eventTime, registerUrl } = req.body;
    console.log('Received Data:', req.files, req.body);

    if (!eventName) {
        return res.status(400).json({ success: false, data: "Event name is required" });
    }

    try {
        const eventId = await generateUniqueCode(8);
        console.log("Generated EVENT ID:", eventId);

        let imageUrl = null;

        // Upload single event image
        if (req.files?.image?.[0]) {
            const file = req.files.image[0];

            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "event_images" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                uploadStream.end(file.buffer);
            });

            imageUrl = uploadResult.secure_url;
            console.log('New event image url:', imageUrl)
        }

        let galleryUrls = [];
        // Upload event gallery images
        if (req.files?.eventGalleryFile && Array.isArray(req.files.eventGalleryFile)) {
            galleryUrls = await Promise.all(
                req.files.eventGalleryFile.map((file) =>
                    new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            { folder: "event_gallery" },
                            (error, result) => {
                                if (error) return reject(error);
                                resolve(result.secure_url);
                            }
                        );
                        uploadStream.end(file.buffer);
                    })
                )
            );
            console.log('New gallery image url:', galleryUrls)
        }

        // Save new event in the database
        const newEvent = await EventModel.create({
            eventName,
            location,
            speakers,
            schedule,
            eventDescription,
            eventDate,
            eventTime,
            eventId,
            registerUrl,
            image: imageUrl,
            eventGallery: galleryUrls,
        });

        res.status(201).json({ success: true, data: "New Event created" });
    } catch (error) {
        console.error("ERROR CREATING EVENT:", error);
        res.status(500).json({ success: false, data: "Unable to create new event" });
    }
}

//UPDATE EVENT
export async function updateEvent(req, res) {
    const { id, eventName, location, speakers, schedule, registerUrl, eventDescription, image, eventDate, eventTime } = req.body;
    console.log("Received update request:", req.body);

    try {
        // Find existing event
        const findEvent = await EventModel.findOne({ eventId: id });
        if (!findEvent) {
            return res.status(404).json({ success: false, data: 'Event does not exist' });
        }

        let imageUrl = findEvent.image;

        // Upload new event image if provided
        if (req.files?.image?.[0]) {
            const file = req.files.image[0];

            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "event_images" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                uploadStream.end(file.buffer);
            });

            imageUrl = uploadResult.secure_url;
            console.log("Updated image URL:", imageUrl);
        }

        let galleryUrls = findEvent.eventGallery || []; // Keep existing images

        // Upload new gallery images if provided
        if (req.files?.eventGalleryFile && Array.isArray(req.files.eventGalleryFile)) {
            const newGalleryUrls = await Promise.all(
                req.files.eventGalleryFile.map((file) =>
                    new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            { folder: "event_gallery" },
                            (error, result) => {
                                if (error) return reject(error);
                                resolve(result.secure_url);
                            }
                        );
                        uploadStream.end(file.buffer);
                    })
                )
            );

            galleryUrls = [...galleryUrls, ...newGalleryUrls]; // Append new images
            console.log("Updated gallery image URL:", galleryUrls);
        }

        // Update the event in the database
        const updatedEventData = await EventModel.findByIdAndUpdate(
            findEvent._id,
            {
                $set: {
                    eventName,
                    location,
                    speakers,
                    schedule,
                    eventDescription,
                    image: imageUrl,
                    eventDate,
                    registerUrl,
                    eventTime,
                    eventGallery: galleryUrls,
                },
            },
            { new: true }
        );

        if (!updatedEventData) {
            return res.status(400).json({ success: false, data: 'Unable to update event data' });
        }

        console.log("Updated event data:", updatedEventData);
        res.status(200).json({ success: true, data: 'Event updated successfully', event: updatedEventData });

    } catch (error) {
        console.error("ERROR UPDATING EVENT:", error);
        res.status(500).json({ success: false, data: 'Unable to update event' });
    }
}

//GET ALL EVENTS
export async function getEvents(req, res) {
    try {
        const events = await EventModel.find().select('-_id')

        res.status(200).json({ success: true, data: events })
    } catch (error) {
        console.log('UNABLE TO GETA ALL EVENTS', error)
        res.status(500).json({ success: false, data: 'Unable to get events' })
    }
}

// GET PAST EVENTS
export async function getPastEvents(req, res) {
    try {
        const today = new Date(); // Current date
        const events = await EventModel.find({
            eventDate: { $exists: true, $ne: null }, // Ensure eventDate exists
        }).lean();

        // Filter events with eventDate less than today
        const pastEvents = events.filter((event) => {
            const eventDate = new Date(event.eventDate);
            return eventDate < today;
        });

        res.status(200).json({ success: true, data: pastEvents });
    } catch (error) {
        console.error('UNABLE TO GET PAST EVENTS', error);
        res.status(500).json({
            success: false,
            message: 'Unable to fetch past events',
            error: error.message,
        });
    }
}

// GET FUTURE EVENTS
export async function getFutureEvents(req, res) {
    try {
        const today = new Date(); // Current date
        const events = await EventModel.find({
            eventDate: { $exists: true, $ne: null }, // Ensure eventDate exists
        }).lean();

        // Filter events with eventDate greater than or equal to today
        const futureEvents = events.filter((event) => {
            const eventDate = new Date(event.eventDate);
            return eventDate >= today;
        });

        res.status(200).json({ success: true, data: futureEvents });
    } catch (error) {
        console.error('UNABLE TO GET FUTURE EVENTS', error);
        res.status(500).json({
            success: false,
            message: 'Unable to fetch future events',
            error: error.message,
        });
    }
}

//GET A EVENT
export async function getEvent(req, res) {
    const { id } = req.params
    try {
        const findEvent = await EventModel.findOne({ eventId: id }).select('-_id')
        if(!findEvent){
            return res.status(404).json({ success: false, data: 'Event does not exist'})
        }

        res.status(200).json({ success: true, data: findEvent })
    } catch (error) {
        console.log('UNABEL TO GET A EVENT', error)
        res.status(500).json({ success: false, data: 'Unable to get event' })
    }
}

//DELETE EVENT
export async function deleteEvent(req, res) {
    const { id } = req.body
    try {
        const findEvent = await EventModel.findOne({ eventId: id })
        if(!findEvent){
            return res.status(404).json({ success: false, data: 'Event does not exist'})
        }

        const deleteEvent = await EventModel.findByIdAndDelete({ _id: findEvent._id })

        res.status(201).json({ success: true, data: 'Event deleted successful' })
    } catch (error) {
        console.log('UNABLE TO DELETE EVENTS DATA', error)
        res.status(500).json({ success: false, data: 'Unable to delete event data' })
    }
}

//GET LATEST PAST AND FUTURE EVENT 
export async function getLatestEvents(req, res) {
    try {
        const currentDate = new Date();

        // Convert eventDate strings to Date objects for comparison
        const latestPastEvent = await EventModel.aggregate([
            {
                $addFields: {
                    eventDateAsDate: { $toDate: "$eventDate" } // Convert eventDate string to Date
                }
            },
            {
                $match: {
                    eventDateAsDate: { $lt: currentDate } // Filter past events
                }
            },
            {
                $sort: { eventDateAsDate: -1 } // Sort by eventDate in descending order
            },
            {
                $limit: 1 // Get only the latest one
            }
        ]);

        const nearestFutureEvent = await EventModel.aggregate([
            {
                $addFields: {
                    eventDateAsDate: { $toDate: "$eventDate" } // Convert eventDate string to Date
                }
            },
            {
                $match: {
                    eventDateAsDate: { $gt: currentDate } // Filter future events
                }
            },
            {
                $sort: { eventDateAsDate: 1 } // Sort by eventDate in ascending order
            },
            {
                $limit: 1 // Get only the nearest one
            }
        ]);

        // Check if any events were found
        if (!latestPastEvent.length && !nearestFutureEvent.length) {
            return res.status(404).json({
                success: false,
                message: 'No past or future events found',
            });
        }

        // Send the response with both events
        res.status(200).json({
            success: true,
            data: {
                latestPastEvent: latestPastEvent[0] || null, // If no past event, return null
                nearestFutureEvent: nearestFutureEvent[0] || null, // If no future event, return null
            },
        });
    } catch (error) {
        console.log('UNABLE TO GET EVENTS', error);
        res.status(500).json({ success: false, data: 'Unable to get events' });
    }
}
