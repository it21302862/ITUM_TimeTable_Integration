const API_BASE_URL = "http://localhost:5000/api";

export const api = {
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

  async deleteTimetableSlot(id) {
    const response = await fetch(`${API_BASE_URL}/timetable/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete timetable slot");
    }
    return response.json();
  },

  // Courses / Modules
  async getCourses() {
    const response = await fetch(`${API_BASE_URL}/courses`);
    if (!response.ok) {
      throw new Error("Failed to fetch courses");
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
    return response.json();
  },

  async createInstructor(data) {
    const response = await fetch(`${API_BASE_URL}/instructors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Failed to create instructor");
    }
    return response.json();
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

  //get lecture halls

  async getLectureHalls() {
    const response = await fetch(`${API_BASE_URL}/lecture-halls`);
    if (!response.ok) {
      throw new Error("Failed to fetch lecture-halls");
    }
    return response.json();
  },
};
