import { Router } from "express";
import { history } from "../utils/history.js";
import { message } from "../utils/message.js";

const router = Router();

router.post("/message", message());

router.get("/history/:sessionId", history());

export default router;
