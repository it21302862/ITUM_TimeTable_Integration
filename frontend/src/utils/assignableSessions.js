const INACTIVE_SEMESTER_STATUSES = new Set(["PAST", "DRAFT"]);

export function isActiveSemester(semester) {
  const status = String(semester?.status || "").toUpperCase();
  if (!status) return false;
  if (INACTIVE_SEMESTER_STATUSES.has(status)) return false;
  return true;
}

export function timeToMinutes(timeInput) {
  if (!timeInput) return 0;
  const timeStr =
    timeInput instanceof Date
      ? timeInput.toTimeString().slice(0, 5)
      : String(timeInput);
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  return 0;
}

export function timesOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

export function buildAssignableSessionsData({
  activeSemesters,
  allSlots,
  instructorSlots = [],
  instructorId = null,
}) {
  const instructorIdNum = instructorId ? Number(instructorId) : null;

  const assignableSessions = allSlots.filter((slot) => {
    if (!instructorIdNum) return true;
    if (slot.InstructorId === instructorIdNum) return false;
    if (slot.SupportiveInstructors?.some((i) => i.id === instructorIdNum)) {
      return false;
    }
    for (const busy of instructorSlots) {
      if (
        slot.dayOfWeek === busy.dayOfWeek &&
        timesOverlap(
          slot.startTime,
          slot.endTime,
          busy.startTime,
          busy.endTime,
        )
      ) {
        return false;
      }
    }
    return true;
  });

  const semesterReview = activeSemesters.map((semester) => {
    const semInstructorSlots = instructorSlots.filter(
      (s) => s.SemesterId === semester.id,
    );
    const semAssignable = assignableSessions.filter(
      (s) => s.SemesterId === semester.id,
    );
    const semTotal = allSlots.filter((s) => s.SemesterId === semester.id);

    let status = "NO_CONFLICT";
    let label = "No Conflicts";

    if (semInstructorSlots.length > 0 && semAssignable.length === 0) {
      status = "BLOCKED";
      label = "Fully Booked";
    } else if (semInstructorSlots.length > 0) {
      status = "ADVISORY";
      label = `${semInstructorSlots.length} Existing Session${semInstructorSlots.length !== 1 ? "s" : ""}`;
    } else if (semTotal.length === 0) {
      status = "NO_SLOTS";
      label = "No Sessions Listed";
    }

    return {
      semesterId: semester.id,
      semesterName: semester.name,
      status,
      label,
      existingSessionCount: semInstructorSlots.length,
      assignableCount: semAssignable.length,
    };
  });

  return {
    semesters: activeSemesters,
    sessions: assignableSessions,
    instructorSessions: instructorSlots,
    semesterReview,
    totalSessions: allSlots.length,
    hiddenDueToConflict: allSlots.length - assignableSessions.length,
  };
}
