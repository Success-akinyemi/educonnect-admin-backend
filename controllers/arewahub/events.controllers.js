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
    const { eventName, location, speakers, schedule, eventDescription, eventDate, eventTime } = req.body;
    console.log('object', req.files, req.body)
    if (!eventName) {
        return res.status(400).json({ success: false, data: "Event name is required" });
    }

    try {
        const eventId = await generateUniqueCode(8);
        console.log("EVENT ID", eventId);

        let imageUrl = null;

        // Upload single event image
        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "event_images" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer); // Send the file buffer
            });

            imageUrl = uploadResult.secure_url;
        }

        let galleryUrls = [];
        // Upload event gallery
        if (req.files && req.files.eventGallery && Array.isArray(req.files.eventGallery)) {
            galleryUrls = await Promise.all(
                req.files.eventGallery.map((file) =>
                    new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            { folder: "event_gallery" },
                            (error, result) => {
                                if (error) return reject(error);
                                resolve(result.secure_url);
                            }
                        );
                        uploadStream.end(file.buffer); // Send the file buffer
                    })
                )
            );
        }

        // Save event to the database
        const newEvent = await EventModel.create({
            eventName,
            location,
            speakers,
            schedule,
            eventDescription,
            eventDate,
            eventTime,
            eventId,
            image: imageUrl,
            eventGallery: galleryUrls,
        });

        res.status(201).json({ success: true, data: "New Event created" });
    } catch (error) {
        console.error("UNABLE TO CREATE NEW EVENTS", error);
        res.status(500).json({ success: false, data: "Unable to create new events" });
    }
}


//UPDATE EVENT
export async function updateEvent(req, res) {
    const { id, eventName, location, speakers, schedule, eventDescription, image, eventDate, eventTime, eventGallery } = req.body;
    console.log(req.body)
    try {
        // Find the event by eventId
        const findEvent = await EventModel.findOne({ eventId: id });
        if (!findEvent) {
            return res.status(404).json({ success: false, data: 'Event does not exist' });
        }

        let imageUrl = null;

        if (req.files?.image?.[0]) {
            const file = req.files.image[0];

            // Upload to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "team_images" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                uploadStream.end(file.buffer); // Use the file buffer from Multer
            });

            imageUrl = uploadResult.secure_url;
            console.log("Uploaded image URL:", imageUrl);
        }

        let galleryUrls = [];
        // Upload event gallery
        if (req.files && req.files.eventGallery && Array.isArray(req.files.eventGallery)) {
            galleryUrls = await Promise.all(
                req.files.eventGallery.map((file) =>
                    new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            { folder: "event_gallery" },
                            (error, result) => {
                                if (error) return reject(error);
                                resolve(result.secure_url);
                            }
                        );
                        uploadStream.end(file.buffer); // Send the file buffer
                    })
                )
            );
        }

        // Update the event using the ID
        const updatedEventData = await EventModel.findByIdAndUpdate(
            findEvent._id, // Correctly reference the ID
            {
                $set: {
                    eventName,
                    location,
                    speakers,
                    schedule,
                    eventDescription,
                    image: imageUrl,
                    eventDate, 
                    eventTime,
                    eventGallery: galleryUrls
                },
            },
            { new: true } // Return the updated document
        );

        if (!updatedEventData) {
            return res.status(400).json({ success: false, data: 'Unable to update event data' });
        }
        console.log('updatedEventData', updatedEventData)

        res.status(201).json({ success: true, data: 'Event data updated', event: updatedEventData });
    } catch (error) {
        console.log('UNABLE TO UPDATE EVENT', error);
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
        const today = new Date(); // Get the current date
        const pastEvents = await EventModel.find({
            eventDate: { $lt: today, $exists: true, $ne: null } // Compare as Date
        }).select('-_id');

        res.status(200).json({ success: true, data: pastEvents });
    } catch (error) {
        console.error('UNABLE TO GET ALL PAST EVENTS', error);
        res.status(500).json({ success: false, message: 'Unable to fetch past events', error: error.message });
    }
}

// GET FUTURE EVENTS
export async function getFutureEvents(req, res) {
    try {
        const today = new Date(); // Get the current date
        const futureEvents = await EventModel.find({
            eventDate: { $gte: today, $exists: true, $ne: null } // Compare as Date
        }).select('-_id');

        res.status(200).json({ success: true, data: futureEvents });
    } catch (error) {
        console.error('UNABLE TO GET ALL FUTURE EVENTS', error);
        res.status(500).json({ success: false, message: 'Unable to fetch future events', error: error.message });
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