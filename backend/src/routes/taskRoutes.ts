import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from "../controllers/taskController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskIdParamsSchema,
  updateTaskSchema,
} from "../validators/taskValidators.js";

const router = Router();

router.use(requireAuth);

router.get("/", validate(listTasksQuerySchema, "query"), listTasks);
router.post("/", validate(createTaskSchema), createTask);
router.get("/:id", validate(taskIdParamsSchema, "params"), getTask);
router.patch(
  "/:id",
  validate(taskIdParamsSchema, "params"),
  validate(updateTaskSchema),
  updateTask,
);
router.delete("/:id", validate(taskIdParamsSchema, "params"), deleteTask);

export default router;
