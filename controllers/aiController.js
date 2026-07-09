


// controller for enhancing a resume's profesional summary
// POST: /api/ai/enhance-pro-sum
export const ehnaceProfesionalSummary = async (req, res) => {
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