import express from "express";
import { Valid } from "../controllers/Users";
const router = express.Router();

//Get
router.get("/", Valid);

export default router;
