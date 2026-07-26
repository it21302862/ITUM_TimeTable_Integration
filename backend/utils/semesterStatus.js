import { Op } from "sequelize";

export const INACTIVE_SEMESTER_STATUSES = ["PAST", "DRAFT"];

export function buildActiveSemesterWhere(extra = {}) {
  return {
    status: { [Op.notIn]: INACTIVE_SEMESTER_STATUSES },
    ...extra,
  };
}
