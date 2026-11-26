import express from "express";
import { getTasks, createTask, updateTask, deleteTask } from "../controllers/taskController.js";
import { validateCreateTask, validateUpdateTask } from "../middleware/validateTask.js";

const router = express.Router();

router.get("/", getTasks);
router.post("/", validateCreateTask, createTask);
router.patch("/:id", validateUpdateTask, updateTask);
router.delete("/:id", deleteTask);

export default router;
