import { Router } from "express";

const router = Router();

// We will implement the controller logic in the next step
router.post("/chat/message", (req, res) => {
  res.json({ message: "Endpoint is ready for logic implementation" });
});

export default router;
