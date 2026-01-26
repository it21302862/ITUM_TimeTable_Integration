import { ModuleOutline, Course } from "../models/index.js";

export async function create(req, res) {
  try {
    const { courseId, description, outcomes, weeklyTopics, assessments, bibliography, contentQuality } = req.body;

    const existing = await ModuleOutline.findOne({ where: { courseId } });
    if (existing) {
      return res.status(400).json({ message: "Module outline already exists for this course" });
    }

    const outline = await ModuleOutline.create({
      courseId,
      description,
      outcomes: outcomes || [],
      weeklyTopics: weeklyTopics || [],
      assessments: assessments || [],
      bibliography,
      contentQuality: contentQuality || "Medium"
    });

    const fullOutline = await ModuleOutline.findByPk(outline.id, {
      include: [{ model: Course }]
    });

    res.status(201).json(fullOutline);
  } catch (err) {
    console.error("Error creating module outline:", err);
    res.status(500).json({ message: "Failed to create module outline", error: err.message });
  }
}

export async function getAll(req, res) {
  try {
    const outlines = await ModuleOutline.findAll({
      include: [{ model: Course }]
    });
    res.json(outlines);
  } catch (err) {
    console.error("Error fetching module outlines:", err);
    res.status(500).json({ message: "Failed to fetch module outlines", error: err.message });
  }
}

export async function getOne(req, res) {
  try {
    const outline = await ModuleOutline.findByPk(req.params.id, {
      include: [{ model: Course }]
    });

    if (!outline) {
      return res.status(404).json({ message: "Module outline not found" });
    }

    res.json(outline);
  } catch (err) {
    console.error("Error fetching module outline:", err);
    res.status(500).json({ message: "Failed to fetch module outline", error: err.message });
  }
}

export async function getByCourse(req, res) {
  try {
    const outline = await ModuleOutline.findOne({
      where: { courseId: req.params.courseId },
      include: [{ model: Course }]
    });

    if (!outline) {
      return res.status(404).json({ message: "Module outline not found for this course" });
    }

    res.json(outline);
  } catch (err) {
    console.error("Error fetching module outline:", err);
    res.status(500).json({ message: "Failed to fetch module outline", error: err.message });
  }
}

export async function update(req, res) {
  try {
    const { description, outcomes, weeklyTopics, assessments, bibliography, contentQuality } = req.body;

    const [updated] = await ModuleOutline.update(
      {
        description,
        outcomes: outcomes || [],
        weeklyTopics: weeklyTopics || [],
        assessments: assessments || [],
        bibliography,
        contentQuality: contentQuality || "Medium"
      },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({ message: "Module outline not found" });
    }

    const updatedOutline = await ModuleOutline.findByPk(req.params.id, {
      include: [{ model: Course }]
    });

    res.json(updatedOutline);
  } catch (err) {
    console.error("Error updating module outline:", err);
    res.status(500).json({ message: "Failed to update module outline", error: err.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await ModuleOutline.destroy({ where: { id: req.params.id } });

    if (!deleted) {
      return res.status(404).json({ message: "Module outline not found" });
    }

    res.json({ message: "Module outline deleted successfully" });
  } catch (err) {
    console.error("Error deleting module outline:", err);
    res.status(500).json({ message: "Failed to delete module outline", error: err.message });
  }
}
