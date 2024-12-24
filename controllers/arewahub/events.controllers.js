import { generateUniqueCode } from "../../middlewares/utils.js"
import EventModel from "../../models/arewahub/Events.js"
import cloudinary from "cloudinary";

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

//NEW EVENT
export async function newEvent(req, res) {
    const { eventName, location, speakers, schedule, eventDescription, image, eventDate, eventTime, eventGallery } = req.body
    if(!eventName){
          return res.status(400).json({ success: false, data: 'Event name is required' })
    }
    try {
        const eventId = await generateUniqueCode(8)
        console.log('EVENT ID', eventId)

        let imageUrl
        if(image){
            const result = await cloudinary.uploader.upload(image)

            imageUrl = result.url
        }

        let galleryUrls = [];
        if(eventGallery){
            if (Array.isArray(eventGallery) && eventGallery.length > 0) {
              galleryUrls = await Promise.all(
                eventGallery.map(async (galleryImage) => {
                  const result = await cloudinary.uploader.upload(galleryImage);
                  return result.url;
                })
              );
            }
        }

        const newEvent = await EventModel.create({
            eventName, location, speakers, schedule, eventDescription, eventDate, eventTime, eventId: eventId, image: imageUrl, eventGallery: galleryUrls 
        })

        res.status(201).json({ success: true, data: 'New Event created' })
    } catch (error) {
        console.log('UNABLE TO CREATE NEW EVENTS', error)
        res.status(500).json({ success: false, data: 'Unable to create new events'})
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

        let imageUrl = findEvent.image; // Default to existing image
        if (image) {
            const result = await cloudinary.uploader.upload(image);
            imageUrl = result.url;
        }

        let galleryUrls = [];
        if(eventGallery){
            if (Array.isArray(eventGallery) && eventGallery.length > 0) {
              galleryUrls = await Promise.all(
                eventGallery.map(async (galleryImage) => {
                  const result = await cloudinary.uploader.upload(galleryImage);
                  return result.url;
                })
              );
            }
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
        const today = new Date(); // Current date
        const pastEvents = await EventModel.find({ 
            eventDate: { $lt: today.toISOString().split('T')[0] } 
        }).select('-_id');

        res.status(200).json({ success: true, data: pastEvents });
    } catch (error) {
        console.error('UNABLE TO GET ALL PAST EVENTS', error);
        res.status(500).json({ success: false, message: 'Unable to fetch past events' });
    }
}

// GET FUTURE EVENTS
export async function getFutureEvents(req, res) {
    try {
        const today = new Date(); // Current date
        const futureEvents = await EventModel.find({ 
            eventDate: { $gte: today.toISOString().split('T')[0] } 
        }).select('-_id');

        res.status(200).json({ success: true, data: futureEvents });
    } catch (error) {
        console.error('UNABLE TO GET ALL FUTURE EVENTS', error);
        res.status(500).json({ success: false, message: 'Unable to fetch future events' });
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