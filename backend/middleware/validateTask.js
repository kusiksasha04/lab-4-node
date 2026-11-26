export const validateCreateTask = (req, res, next) => {
  const { title } = req.body;

  if (typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({ message: "Task title is required." });
  }

  next();
};

export const validateUpdateTask = (req, res, next) => {
  const { title, completed } = req.body;

  if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
    return res.status(400).json({ message: "Task title cannot be empty." });
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({ message: "Field completed must be true or false." });
  }

  next();
};
