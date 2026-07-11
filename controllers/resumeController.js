import imagekit from "../config/imageKit.js";
import Resume from "../models/Resume.js";
import fs from "fs";


// Controller for creating a new resume
// POST: /api/resumes/create
export const createResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { title } = req.body;
    const newResume = await Resume.create({ userId, title });
    res.status(201).json({ message: "Resume created successfully", resume: newResume });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Controller for deleting a resume
// DELETE: /api/resumes/delete
export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    await Resume.findOneAndDelete({ userId, _id: resumeId })

    res.status(201).json({ message: "Resume deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// get user resume by id
// GET: /api/resumes/get
export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const resume = await Resume.findOne({ userId, _id: resumeId })
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    resume.__v = undefined;
    resume.createdAt = undefined;
    resume.updatedAt = undefined;

    return res.status(200).json({ resume });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// get resume by id public
// GET: /api/resumes/public
export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findOne({ _id: resumeId, public: true })
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.status(200).json({ resume });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// controller for updating a resume
// PUT: api/resumes/update
export const updateResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;
    let resumeDataCopy = typeof resumeData === 'string' ? JSON.parse(resumeData) : resumeData;

    if (image) {
      const imageBufferData = fs.createReadStream(image.path)
      const response = await imagekit.files.upload({
        file: imageBufferData,
        fileName: 'resume.png',
        folder: 'user-resumes',
        transformation: {
          pre: 'w-300.h-300,fo-face,z-0.75' + (removeBackground ? ',e-bgremove' : '')
        }
      });

      if (resumeDataCopy && resumeDataCopy.personal_info) {
        resumeDataCopy.personal_info.image = response.url;
      }
    }

    // Eliminamos campos internos para que el cliente no pueda sobreescribirlos
    const { userId: _u, _id: _i, createdAt, updatedAt, __v, ...safeUpdate } = resumeDataCopy;

    const resume = await Resume.findOneAndUpdate(
      { userId, _id: resumeId },
      { $set: safeUpdate },
      { returnDocument: 'after' }
    )

    return res.status(200).json({ message: "Saved successfully", resume })

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}