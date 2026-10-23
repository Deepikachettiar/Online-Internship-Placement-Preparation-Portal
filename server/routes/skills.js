const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {
  MAX_SKILLS,
  normalizeSkill,
  validateSkill,
} = require("../utils/skills");

// Authentication middleware is expected to populate req.user.
function requireUser(req, res, next) {
  if (!req.user?._id) {
    return res.status(401).json({ message: "Authentication required." });
  }
  next();
}

router.use(requireUser);

async function findStudent(req, res) {
  const student = await User.findById(req.user._id);
  if (!student) res.status(404).json({ message: "Student not found." });
  return student;
}

// List my skills (issue #9).
router.get("/", async (req, res) => {
  try {
    const student = await findStudent(req, res);
    if (!student) return;
    return res.status(200).json({ skills: student.skills });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load skills." });
  }
});

// Add a skill.
router.post("/", async (req, res) => {
  try {
    const skill = normalizeSkill(req.body.skill);
    const error = validateSkill(skill);
    if (error) return res.status(400).json({ message: error });

    const student = await findStudent(req, res);
    if (!student) return;

    if (student.skills.includes(skill)) {
      return res.status(400).json({ message: "You already added this skill." });
    }
    if (student.skills.length >= MAX_SKILLS) {
      return res.status(400).json({ message: `You can add at most ${MAX_SKILLS} skills.` });
    }

    student.skills.push(skill);
    await student.save();
    return res.status(201).json({ message: "Skill added.", skills: student.skills });
  } catch (error) {
    return res.status(500).json({ message: "Unable to add skill." });
  }
});

// Change a skill (rename it).
router.put("/:skill", async (req, res) => {
  try {
    const oldSkill = normalizeSkill(req.params.skill);
    const newSkill = normalizeSkill(req.body.skill);
    const error = validateSkill(newSkill);
    if (error) return res.status(400).json({ message: error });

    const student = await findStudent(req, res);
    if (!student) return;

    const index = student.skills.indexOf(oldSkill);
    if (index === -1) return res.status(404).json({ message: "Skill not found." });

    if (newSkill !== oldSkill && student.skills.includes(newSkill)) {
      return res.status(400).json({ message: "You already added this skill." });
    }

    student.skills[index] = newSkill;
    await student.save();
    return res.status(200).json({ message: "Skill updated.", skills: student.skills });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update skill." });
  }
});

// Delete a skill.
router.delete("/:skill", async (req, res) => {
  try {
    const skill = normalizeSkill(req.params.skill);

    const student = await findStudent(req, res);
    if (!student) return;

    if (!student.skills.includes(skill)) {
      return res.status(404).json({ message: "Skill not found." });
    }

    student.skills = student.skills.filter((item) => item !== skill);
    await student.save();
    return res.status(200).json({ message: "Skill deleted.", skills: student.skills });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete skill." });
  }
});

module.exports = router;
