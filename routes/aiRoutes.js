import express from "express"
import protect from "../midlewares/authMidleware";
import { enhanceJobDescription, enhanceProfesionalSummary, uploadResume } from "../controllers/aiController";


const aiRouter = express.Router();

aiRouter.post("/enhance-pro-sum", protect, enhanceProfesionalSummary);
aiRouter.post("/enhance-job-desc", protect, enhanceJobDescription);
aiRouter.post("/upload-resume", protect, uploadResume);

export default aiRouter;