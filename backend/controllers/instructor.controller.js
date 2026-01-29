import { Instructor, TimetableSlot, Course, Semester } from "../models/index.js";
import { Op } from "sequelize";
import bcrypt from "bcrypt";

export async function create(req, res) {
  try {
    const { password, ...instructorData } = req.body;

    // Hash password if provided
    if (password) {
      const saltRounds = 10;
      instructorData.password = await bcrypt.hash(password, saltRounds);
    } else {
      return res.status(400).json({ error: "Password is required" });
    }

    const instructor = await Instructor.create(instructorData);
    res.status(201).json(instructor);
  } catch (error) {
    console.error("Error creating instructor:", error);
    res.status(500).json({ error: "Failed to create instructor" });
  }
}

export async function getAll(req, res) {
  const instructors = await Instructor.findAll({
    attributes: { exclude: ['password'] }
  });
  res.json(instructors);
}

export async function getOne(req, res) {
  const instructor = await Instructor.findByPk(req.params.id, {
    attributes: { exclude: ['password'] }
  });
  res.json(instructor);
}

export async function getAvailableInstructors(req, res) {
  try {
    const { date, semesterId } = req.query;
    
    const instructors = await Instructor.findAll({
      attributes: { exclude: ['password'] }
    });
    
    let checkDate;
    if (date) {
      checkDate = new Date(date);
    } else {
      checkDate = new Date();
    }
    
    if (isNaN(checkDate.getTime())) {
      checkDate = new Date();
    }
    
    const dayOfWeek = checkDate.getDay(); 
    const daysArray = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const dayOfWeekStr = daysArray[dayOfWeek];
    
    const hours = String(checkDate.getHours()).padStart(2, '0');
    const minutes = String(checkDate.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    const timeToMinutes = (timeInput) => {
      if (!timeInput) return 0;
      
      let timeStr = timeInput;
      
      if (timeInput instanceof Date) {
        timeStr = timeInput.toTimeString().slice(0, 5);
      } else if (typeof timeInput !== 'string') {
        timeStr = String(timeInput);
      }
      
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        return hours * 60 + minutes;
      }
      
      return 0;
    };
    
    const currentTimeMinutes = timeToMinutes(currentTime);
    
    const instructorAvailability = await Promise.all(
      instructors.map(async (instructor) => {

        let slots = await TimetableSlot.findAll({
          where: {
            InstructorId: instructor.id,
            dayOfWeek: dayOfWeekStr,
            ...(semesterId && { SemesterId: semesterId })
          },
          include: [
            { model: Course },
            { model: Semester }
          ],
          order: [["startTime", "ASC"]]
        });

        let supportiveSlots = [];
        try {
          supportiveSlots = await TimetableSlot.findAll({
            include: [
              {
                model: Instructor,
                as: "SupportiveInstructors",
                where: { id: instructor.id },
                through: { attributes: [] },
                required: true
              },
              { model: Course },
              { model: Semester }
            ],
            where: {
              dayOfWeek: dayOfWeekStr,
              ...(semesterId && { SemesterId: semesterId })
            },
            order: [["startTime", "ASC"]]
          });
        } catch (err) {
          supportiveSlots = [];
        }

        const allSlots = [...slots, ...supportiveSlots];
        
        let currentSession = null;
        let nextSession = null;
        let isCurrentlyFree = true;

        // Check if currently in a session by converting times to minutes
        for (const slot of allSlots) {
          const startTimeMinutes = timeToMinutes(slot.startTime);
          const endTimeMinutes = timeToMinutes(slot.endTime);
          
          if (currentTimeMinutes >= startTimeMinutes && currentTimeMinutes < endTimeMinutes) {
            currentSession = slot;
            isCurrentlyFree = false;
            break;
          }
        }

        // Find next session AFTER current session (or after current time if free)
        if (allSlots.length > 0) {
          const searchFromTime = currentSession ? timeToMinutes(currentSession.endTime) : currentTimeMinutes;
          
          for (const slot of allSlots) {
            const startTimeMinutes = timeToMinutes(slot.startTime);
            if (startTimeMinutes > searchFromTime) {
              nextSession = slot;
              break;
            }
          }
        }

        const formatTime = (timeInput) => {
          const timeStr = timeInput instanceof Date ? timeInput.toTimeString().slice(0, 5) : String(timeInput).slice(0, 5);
          return timeStr;
        };

        return {
          ...instructor.toJSON(),
          currentSession,
          nextSession,
          isCurrentlyFree,
          availabilityStatus: currentSession 
            ? `Busy until ${formatTime(currentSession.endTime)}`
            : nextSession
            ? `Free until ${formatTime(nextSession.startTime)}`
            : "Free All Day"
        };
      })
    );

    res.json(instructorAvailability);
  } catch (err) {
    console.error("Error fetching available instructors:", err);
    res.status(500).json({ message: "Failed to fetch available instructors", error: err.message });
  }
}

export async function update(req, res) {
  try {
    const updateData = { ...req.body };

    // Hash password if being updated
    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    await Instructor.update(updateData, { where: { id: req.params.id } });
    res.json({ message: "Instructor updated" });
  } catch (error) {
    console.error("Error updating instructor:", error);
    res.status(500).json({ error: "Failed to update instructor" });
  }
}

export async function remove(req, res) {
  await Instructor.destroy({ where: { id: req.params.id } });
  res.json({ message: "Instructor deleted" });
}
