import {
  isActiveSemester,
  buildAssignableSessionsData,
} from "../utils/assignableSessions.js";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const API_BASE_URL_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const resolveImageUrl = (imageUrl) => {
  if (typeof imageUrl !== "string") return imageUrl;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("/")) {
    return API_BASE_URL_ORIGIN + imageUrl;
  }
  return imageUrl;
};

export const api = {
  // Authentication
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error("Failed to login");
    }
    return response.json();
  },

  // Password reset via phone
  async requestPasswordReset(phone) {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Failed to request password reset");
    }
    return response.json();
  },

  async resetPassword(phone, code, newPassword) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code, newPassword }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Failed to reset password");
    }
    return response.json();
  },

  async logout() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to logout");
    }
    localStorage.removeItem("token");
    return response.json();
  },

  async getUserProfile() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }
    const data = await response.json();
    if (data?.imageUrl) {
      data.imageUrl = resolveImageUrl(data.imageUrl);
    }
    return data;
  },

  async updateUserProfile(formData) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Failed to update user profile");
    }
    const data = await response.json();
    if (data?.imageUrl) {
      data.imageUrl = resolveImageUrl(data.imageUrl);
    }
    return data;
  },

  // Academic Years
  async getAcademicYears() {
    const response = await fetch(`${API_BASE_URL}/academic-years`);
    if (!response.ok) {
      throw new Error("Failed to fetch academic years");
    }
    return response.json();
  },

  async getAcademicYear(id) {
    const response = await fetch(`${API_BASE_URL}/academic-years/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch academic year");
    }
    return response.json();
  },

  async createAcademicYear(data) {
    const response = await fetch(`${API_BASE_URL}/academic-years`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to create academic year");
    }
    return response.json();
  },

  // Semesters
  async getSemestersByYear(yearId) {
    const response = await fetch(`${API_BASE_URL}/semesters/year/${yearId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch semesters");
    }
    return response.json();
  },

  async getCurrentSemesters(yearId) {
    const params = new URLSearchParams();
    if (yearId) params.append("yearId", yearId);
    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_BASE_URL}/semesters/current${query}`);
    if (!response.ok) {
      throw new Error("Failed to fetch current semesters");
    }
    return response.json();
  },

  async createSemester(data) {
    const response = await fetch(`${API_BASE_URL}/semesters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to create semester");
    }
    return response.json();
  },

  // Timetable
  async getTimetableBySemester(semesterId) {
    const response = await fetch(
      `${API_BASE_URL}/timetable/semester/${semesterId}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch timetable");
    }
    return response.json();
  },

  async getAssignableSessions(instructorId, options = {}) {
    const { yearId } = options;
    const params = new URLSearchParams();
    if (instructorId) params.append("instructorId", instructorId);
    if (yearId) params.append("yearId", yearId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/timetable/assignable-sessions?${params.toString()}`,
      );
      if (response.ok) {
        const data = await response.json();
        if ((data.semesters?.length ?? 0) > 0) {
          return data;
        }
      }
    } catch {
      // Fall back to client-side assembly using existing endpoints.
    }

    return this.buildAssignableSessionsClientSide(instructorId, yearId);
  },

  async buildAssignableSessionsClientSide(instructorId, yearId) {
    let semesters = [];
    if (yearId) {
      semesters = await this.getSemestersByYear(yearId);
    } else {
      try {
        semesters = await this.getCurrentSemesters();
      } catch {
        semesters = [];
      }
    }

    const activeSemesters = semesters.filter(isActiveSemester);
    if (activeSemesters.length === 0) {
      return {
        semesters: [],
        sessions: [],
        instructorSessions: [],
        semesterReview: [],
        totalSessions: 0,
        hiddenDueToConflict: 0,
      };
    }

    const slotResults = await Promise.all(
      activeSemesters.map((sem) => this.getTimetableBySemester(sem.id)),
    );

    const allSlots = [];
    activeSemesters.forEach((sem, index) => {
      (slotResults[index] || []).forEach((slot) => {
        allSlots.push({
          ...slot,
          SemesterId: slot.SemesterId || sem.id,
          Semester: slot.Semester || { id: sem.id, name: sem.name },
        });
      });
    });

    let instructorSlots = [];
    if (instructorId) {
      const instructorResults = await Promise.all(
        activeSemesters.map((sem) =>
          this.getTimetableSlotsByInstructor(instructorId, {
            semesterId: sem.id,
            yearId,
          }),
        ),
      );

      const byId = new Map();
      instructorResults.forEach((result) => {
        const slots = result?.slots || [];
        slots.forEach((slot) => byId.set(slot.id, slot));
      });
      instructorSlots = Array.from(byId.values());
    }

    return buildAssignableSessionsData({
      activeSemesters,
      allSlots,
      instructorSlots,
      instructorId,
    });
  },

  async createTimetableSlot(data) {
    const response = await fetch(`${API_BASE_URL}/timetable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to create timetable slot");
    }
    return response.json();
  },

  async updateTimetableSlot(id, data) {
    const response = await fetch(`${API_BASE_URL}/timetable/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to update timetable slot");
    }
    return response.json();
  },

  async getCoursesBySemester(academicYearId, semesterId) {
  const url = `${API_BASE_URL}/courses?academicYearId=${academicYearId}&semesterId=${semesterId}`;

  console.log("Calling:", url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }

  return response.json();
},

  async deleteTimetableSlot(id) {
    const response = await fetch(`${API_BASE_URL}/timetable/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete timetable slot");
    }
    return response.json();
  },

  // Get timetable slots by instructor (optionally filtered by semester and year)
  async getTimetableSlotsByInstructor(instructorId, options = {}) {
    const { semesterId, yearId } = options;
    let url = `${API_BASE_URL}/timetable/instructor/${instructorId}`;

    const params = new URLSearchParams();
    if (semesterId) params.append("semesterId", semesterId);
    if (yearId) params.append("yearId", yearId);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch instructor timetable slots");
    }
    return response.json();
  },

  // Courses / Modules
  // async getCourses(options = {}) {
  //   const { semesterId, yearId } = options;
  //   let url = `${API_BASE_URL}/courses`;

  //   const params = new URLSearchParams();
  //   if (semesterId) params.append("semesterId", semesterId);
  //   if (yearId) params.append("yearId", yearId);

  //   if (params.toString()) {
  //     url += `?${params.toString()}`;
  //   }

  //   const response = await fetch(url);
  //   if (!response.ok) {
  //     throw new Error("Failed to fetch courses");
  //   }
  //   return response.json();
  // },

  async getCourses(filters = {}) {
  const params = new URLSearchParams();

  if (filters.academicYearId) {
    params.append("academicYearId", filters.academicYearId);
  }

  if (filters.semesterId) {
    params.append("semesterId", filters.semesterId);
  }

  const response = await fetch(
    `${API_BASE_URL}/courses?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }

  return response.json();
},

  async getCoursesBySemester(semesterId) {
    const response = await fetch(
      `${API_BASE_URL}/courses/by-semester/${semesterId}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch courses by semester");
    }
    return response.json();
  },

  async createCourse(data) {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to create course");
    }
    return response.json();
  },

  async updateCourse(id, data) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to update course");
    }
    return response.json();
  },

  async deleteCourse(id) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete course");
    }
    return response.json();
  },

  // Instructors
  async getInstructors() {
    const response = await fetch(`${API_BASE_URL}/instructors`);
    if (!response.ok) {
      throw new Error("Failed to fetch instructors");
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      return data.map((item) => ({
        ...item,
        imageUrl: resolveImageUrl(item.imageUrl),
      }));
    }
    return data;
  },

  async createInstructor(data) {
    let response;
    if (data instanceof FormData) {
      response = await fetch(`${API_BASE_URL}/instructors`, {
        method: "POST",
        body: data,
      });
    } else {
      response = await fetch(`${API_BASE_URL}/instructors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    }
    if (!response.ok) {
      throw new Error("Failed to create instructor");
    }
    const result = await response.json();
    if (result?.imageUrl) {
      result.imageUrl = resolveImageUrl(result.imageUrl);
    }
    return result;
  },

  async updateInstructor(id, data) {
    const response = await fetch(`${API_BASE_URL}/instructors/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to update instructor");
    }
    return response.json();
  },

  async deleteInstructor(id) {
    const response = await fetch(`${API_BASE_URL}/instructors/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete instructor");
    }
    return response.json();
  },

  async getAvailableInstructors(options = {}) {
    const { date, semesterId } = options;
    let url = `${API_BASE_URL}/instructors/available`;

    const params = new URLSearchParams();
    if (date) params.append("date", date);
    if (semesterId) params.append("semesterId", semesterId);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch available instructors");
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      return data.map((item) => ({
        ...item,
        imageUrl: resolveImageUrl(item.imageUrl),
      }));
    }
    return data;
  },

  //get lecture halls

  async getLectureHalls() {
    const response = await fetch(`${API_BASE_URL}/lecture-halls`);
    if (!response.ok) {
      throw new Error("Failed to fetch lecture-halls");
    }
    return response.json();
  },

  async getModulesByInstructor(instructorId, options = {}) {
    const { semesterId, yearId } = options;
    let url = `${API_BASE_URL}/courses/by-instructor/${instructorId}`;

    const params = new URLSearchParams();
    if (semesterId) params.append("semesterId", semesterId);
    if (yearId) params.append("yearId", yearId);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch modules for instructor");
    }
    return response.json();
  },

  // Module Outlines
  async getModuleOutlines() {
    const response = await fetch(`${API_BASE_URL}/module-outlines`);
    if (!response.ok) {
      throw new Error("Failed to fetch module outlines");
    }
    return response.json();
  },

  async getModuleOutlineById(id) {
    const response = await fetch(`${API_BASE_URL}/module-outlines/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch module outline");
    }
    return response.json();
  },

  async getModuleOutlineByCourse(courseId) {
    const response = await fetch(
      `${API_BASE_URL}/module-outlines/course/${courseId}`,
    );
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const message = body?.message || `Failed to fetch module outline for course (${response.status})`;
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }
    return body;
  },

  async createModuleOutline(data) {
    const response = await fetch(`${API_BASE_URL}/module-outlines`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const message = body?.message || "Failed to create module outline";
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }
    return body;
  },

  async updateModuleOutline(id, data) {
    const response = await fetch(`${API_BASE_URL}/module-outlines/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const message = body?.message || "Failed to update module outline";
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }
    return body;
  },

  async deleteModuleOutline(id) {
    const response = await fetch(`${API_BASE_URL}/module-outlines/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete module outline");
    }
    return response.json();
  },

  // Notifications
  async sendAssignmentNote(data) {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${API_BASE_URL}/notifications/assignment-note`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to send assignment note");
    }
    return response.json();
  },

  async getMyNotifications() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }
    return response.json();
  },

  async getSentNotifications() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/notifications/sent`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch sent notifications");
    }
    return response.json();
  },

  async acceptAssignmentNotification(id) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/accept`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to accept assignment");
    }
    return response.json();
  },

  async rejectAssignmentNotification(id) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/reject`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to decline assignment");
    }
    return response.json();
  },

  async getUnreadNotificationCount() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch unread count");
    }
    return response.json();
  },

  async markNotificationAsRead(id) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to mark notification as read");
    }
    return response.json();
  },

  async markAllNotificationsAsRead() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to mark all notifications as read");
    }
    return response.json();
  },
};
