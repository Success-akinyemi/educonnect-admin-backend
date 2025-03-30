import { formatDateAndTime, generateUniqueCode } from "../../middlewares/utils.js";
import ArewaHubMemberModel from "../../models/arewahub/members.js"
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os'; // For temp files
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from "cloudinary";
import { format } from 'date-fns';
import fastCsv from 'fast-csv';

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function becomeAMember(req, res) {
    const { firstName, lastName, email, mobileNumber, location, bussinessName, craftType, experienceLevel } = req.body
    if(!firstName){
        return res.status(400).json({ success: false, data: 'First name is required'})
    }
    if(!lastName){
        return res.status(400).json({ success: false, data: 'Last name is required'})
    }
    if(!mobileNumber){
        return res.status(400).json({ success: false, data: 'Mobile number is required'})
    }
    
    const { certificateImage, artWorkGallery } = req.files || req.body || {}
    
    if(artWorkGallery && !Array.isArray(artWorkGallery)){
        return res.status(400).json({ success: false, data: 'artWorkGallery must be an array'})
    }

    try {
        if(email){
            const emailExist = await ArewaHubMemberModel.findOne({ email })
            if(emailExist){
                return res.status(400).json({ success: false, data: 'Email already exist'})
            }
        }
        if(mobileNumber){
            const mobileNumberExist = await ArewaHubMemberModel.findOne({ mobileNumber })
            if(mobileNumberExist){
                return res.status(400).json({ success: false, data: 'Mobile numeber already exist'})
            }
        }

        //console.log('FILES', req.files, 'BODY', req.body, 'CERT', req.body.certificateImage)
        
        let certificateImageUrl = null
        if(req?.files?.certificateImage || req?.body?.certificateImage) {
            const file = certificateImage[0];

            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "arewahubmember_certificate" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                uploadStream.end(file.buffer);
            });

            certificateImageUrl = uploadResult.secure_url;
            console.log('New hub member certificate image url:', certificateImageUrl)
        }

        let artWorkGalleryUrls = []
        const imageArray = req?.files?.artWorkGallery || req?.body?.artWorkGallery
        if ( imageArray && Array.isArray(imageArray)) {
            artWorkGalleryUrls = await Promise.all(
                imageArray.map((file) =>
                    new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            { folder: "arewahubmember_craft_gallery" },
                            (error, result) => {
                                if (error) return reject(error);
                                resolve(result.secure_url);
                            }
                        );
                        uploadStream.end(file.buffer);
                    })
                )
            );
            console.log('New gallery image url:', artWorkGalleryUrls)
        }

        const generatedUserId = await generateUniqueCode(7);
        console.log('USER ID>>', `AH${generatedUserId}`);

            const newMember = await ArewaHubMemberModel.create({
            firstName,
            lastName,
            email,
            mobileNumber,
            userId: `AH${generatedUserId}`,
            location: location || '',
            bussinessName: bussinessName || '',
            craftType: craftType || '',
            experienceLevel: experienceLevel || '',
            certificateImage: certificateImageUrl || '',
            artWorkGallery: artWorkGalleryUrls || []
        })
        console.log('newMember', newMember)
        res.status(201).json({ success: true, data: 'Membership account created succesful'})
    } catch (error) {
        console.log('UNABLE TO ADD NEW MEMEBER ON AREWA HUB',error)
        res.status(500).json({ success: false, data: 'Unable to add members on arewa hub team member' })
    }
}

//GET MEMBERS
export async function getMembers(req, res) {
    try {
        const members = await ArewaHubMemberModel.find().sort({ createdAt: -1 })

        res.status(200).json({ success: true, data: members })
    } catch (error) {
        console.log('UNABLE TO GET MEMBERS OF AREWA HUB', error)
        res.status(500).json({ success: false, data: 'Unable to get members' })
    }
}

//GET A MEMBER
export async function getAMembers(req, res) {
    const { id } = req.params
    if(!id){
        res.status(400).json({ success: false, data: 'Provide an id'})
        return
    }
    try {
        const members = await ArewaHubMemberModel.findById({ _id: id })

        res.status(200).json({ success: true, data: members })
    } catch (error) {
        console.log('UNABLE TO GET MEMBERS OF AREWA HUB', error)
        res.status(500).json({ success: false, data: 'Unable to get members' })
    }
}

export async function downloadPDF(req, res) {
    try {
        const members = await ArewaHubMemberModel.find().sort({ createdAt: -1 });

        // Generate a unique filename
        const tempDir = os.tmpdir();
        const fileName = `members_${uuidv4()}.pdf`;
        const filePath = path.join(tempDir, fileName);
        
        const stream = fs.createWriteStream(filePath);
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        doc.pipe(stream);

        // Title
        doc.fontSize(20).text('Arewa Hub Members', { align: 'center', underline: true });
        doc.fontSize(16).text(`Total Members (${members?.length})`, { align: 'center', underline: false });
        doc.moveDown(1);

        members.forEach((member, index) => {
            const { formattedDate, formattedTime } = formatDateAndTime(member?.createdAt);

            // Member Title
            doc.fontSize(14).fillColor('black').text(`Member ${index + 1}`, { underline: true });
            doc.moveDown(0.5);

            // Function to write bold labels
            const writeBoldText = (label, value) => {
                doc.font('Helvetica-Bold').text(label, { continued: true });
                doc.font('Helvetica').text(` ${value}`);
                doc.moveDown(0.5);
            };

            writeBoldText('First Name:', member.firstName);
            writeBoldText('Last Name:', member.lastName);

            // Clickable email
            doc.font('Helvetica-Bold').text('Email:', { continued: true });
            doc.font('Helvetica')
                .fillColor('blue')
                .text(` ${member.email}`, { link: `mailto:${member.email}`, underline: true });
            doc.fillColor('black');
            doc.moveDown(0.5);

            writeBoldText('Mobile Number:', member.mobileNumber);
            writeBoldText('Location:', member.location);
            writeBoldText('Business Name:', member.bussinessName);
            writeBoldText('Craft Type:', member.craftType);
            writeBoldText('Experience Level:', member.experienceLevel);
            writeBoldText('Registered Date:', formattedDate);
            writeBoldText('Registered Time:', formattedTime);

            // Clickable Certificate Image
            if (member.certificateImage) {
                doc.font('Helvetica-Bold').text('Certificate Image:', { continued: true });
                doc.font('Helvetica')
                    .fillColor('blue')
                    .text(` View`, { link: member.certificateImage, underline: true });
                doc.fillColor('black');
                doc.moveDown(0.5);
            }

            // Clickable Artwork Gallery Images
            if (member.artWorkGallery.length > 0) {
                doc.font('Helvetica-Bold').text('ArtWork Gallery:');
                doc.moveDown(0.3);
                member.artWorkGallery.forEach((image, i) => {
                    doc.font('Helvetica')
                        .fillColor('blue')
                        .text(`${i + 1}. View Image`, { link: image, underline: true });
                    doc.fillColor('black');
                });
                doc.moveDown(0.5);
            }

            doc.moveDown(1);
        });

        doc.end();

        stream.on('finish', () => {
            res.download(filePath, 'members.pdf', (err) => {
                if (err) {
                    console.error('Error sending PDF:', err);
                    res.status(500).json({ success: false, data: 'Unable to generate PDF file' });
                }
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Failed to delete temp file:', err);
                });
            });
        });

    } catch (error) {
        console.error('UNABLE TO GENERATE PDF FILE OF MEMBERS', error);
        res.status(500).json({ success: false, data: 'Unable to generate PDF file' });
    }
}

export async function downloadCSV(req, res) {
    try {
        const members = await ArewaHubMemberModel.find().sort({ createdAt: -1 });

        // Generate a unique filename in temp directory
        const tempDir = os.tmpdir();
        const fileName = `members_${uuidv4()}.csv`;
        const filePath = path.join(tempDir, fileName);

        // Create a writable stream for CSV
        const stream = fs.createWriteStream(filePath);
        const csvStream = fastCsv.format({ headers: true });

        csvStream.pipe(stream);

        // Add data rows
        members.forEach((member) => {
            csvStream.write({
                "First Name": member.firstName,
                "Last Name": member.lastName,
                "Email": member.email,
                "Mobile Number": member.mobileNumber,
                "Location": member.location,
                "Business Name": member.bussinessName,
                "Craft Type": member.craftType,
                "Experience Level": member.experienceLevel,
                "Registered Date": format(new Date(member.createdAt), 'yyyy-MM-dd'),
                "Registered Time": format(new Date(member.createdAt), 'HH:mm:ss'),
                "Certificate Image": member.certificateImage || 'N/A',
                "ArtWork Gallery": member.artWorkGallery.length > 0 ? member.artWorkGallery.join('; ') : 'N/A'
            });
        });

        csvStream.end();

        // Wait for stream to finish
        stream.on('finish', () => {
            res.download(filePath, 'members.csv', (err) => {
                if (err) {
                    console.error('Error sending CSV:', err);
                    return res.status(500).json({ success: false, data: 'Unable to generate CSV file' });
                }

                // Delete the temp file after download
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Failed to delete temp file:', err);
                });
            });
        });

    } catch (error) {
        console.error('UNABLE TO GENERATE CSV FILE OF MEMBERS', error);
        res.status(500).json({ success: false, data: 'Unable to generate CSV file' });
    }
}