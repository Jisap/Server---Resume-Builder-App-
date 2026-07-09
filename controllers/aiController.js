
import ai from "../config/ai.js";
import Resume from "../models/Resume.js";

// controller for enhancing a resume's profesional summary
// POST: /api/ai/enhance-pro-sum
export const enhanceProfesionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) {
      return res.status(400).json({ message: "User content is required" });
    }

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert in resume writing. Your task is to enhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. And only return text no options or anything else."
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const enhanceContent = response.choices[0].message.content;

    return res.status(200).json({ enhanceContent })
  } catch (error) {
    console.error("Error enhancing professional summary:", error);
    return res.status(400).json({ message: error.message });
  }
}

// controller for enhancing a resume's job description
// POST: /api/ai/enhance-job-desc
export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be 1-2 sentences also highlighting key responsabilities and achievements. Use action verbs and quantifiable results where possible. Make it ATS-friendly. and only return text no options or anything else. "
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const enhanceContent = response.choices[0].message.content;

    return res.status(200).json({ enhanceContent })
  } catch (error) {
    console.error("Error enhancing professional summary:", error);
    return res.status(400).json({ message: error.message });
  }
}

// controller for uploading a resume to the database
// POST: /api/ai/upload-resume
export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;

    const userId = req.userId;

    if (!resumeText) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const systemPrompt = "You are an expert AO agent to extract data from resume."

    const userPrompt = `extract data from this resume: ${resumeText}.
     Provide data in the following JSON format with no additional text before or after: 
      {
        personalInfo: {
        fullName: { type: String, default: "" },
        jobTitle: { type: String, default: "" },
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        location: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        github: { type: String, default: "" },
    },
    education: [{
        institution: { type: String, default: "" },
        degree: { type: String, default: "" },
        fieldOfStudy: { type: String, default: "" },
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" },
    }],
    experience: [{
        company: { type: String, default: "" },
        position: { type: String, default: "" },
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" },
        description: { type: String, default: "" },
    }],
    skills: [{ type: String }],

    }
    `

    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const extractedData = response.choices[0].message.content;
    const parseData = JSON.parse(extractedData);
    const newResume = await Resume.create({
      userId,
      title,
      ...parseData
    })

    return res.json({ resumeId: newResume._id });

  } catch (error) {
    console.error("Error uploading resume:", error);
    return res.status(400).json({ message: error.message });
  }
}