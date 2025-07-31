import sharp from 'sharp';
import cloudinary from '../utils/cloudinary.js';
import Job from '../models/job.model.js';



export const postJob = async (req, res) => {
  try {
    const { title, description, prize, location, verified } = req.body;
    const images = req.files; // expecting multiple files

    if (!title || !description || !prize || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const uploadedImageUrls = [];

    for (const image of images) {
      // Optional: optimize image
      const optimizedImageBuffer = await sharp(image.buffer)
        .resize({ width: 800, height: 800, fit: 'inside' })
        .toFormat('jpeg', { quality: 80 })
        .toBuffer();

      const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
      const cloudResponse = await cloudinary.uploader.upload(fileUri);

      uploadedImageUrls.push(cloudResponse.secure_url);
    }

    const job = await Job.create({
      title,
      description,
      prize,
      location,
      verified: verified === 'true',
      images: uploadedImageUrls,
    });

    res.status(201).json({
      message: 'Job posted successfully',
      job,
    });

  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ message: 'Server error posting job' });
  }
};


export const getAllJobs = async (req, res) => {
    try {
      const jobs = await Job.find().sort({ createdAt: -1 });
      return res.status(200).json({ jobs, success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to fetch jobs', success: false });
    }
  };


