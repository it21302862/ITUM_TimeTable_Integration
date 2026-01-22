const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Academic Years
  async getAcademicYears() {
    const response = await fetch(`${API_BASE_URL}/academic-years`);
    if (!response.ok) {
      throw new Error('Failed to fetch academic years');
    }
    return response.json();
  },

  async getAcademicYear(id) {
    const response = await fetch(`${API_BASE_URL}/academic-years/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch academic year');
    }
    return response.json();
  },

  async createAcademicYear(data) {
    const response = await fetch(`${API_BASE_URL}/academic-years`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create academic year');
    }
    return response.json();
  },

  // Semesters
  async getSemestersByYear(yearId) {
    const response = await fetch(`${API_BASE_URL}/semesters/year/${yearId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch semesters');
    }
    return response.json();
  },

  async createSemester(data) {
    const response = await fetch(`${API_BASE_URL}/semesters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create semester');
    }
    return response.json();
  },

  // Timetable
  async getTimetableBySemester(semesterId) {
    const response = await fetch(`${API_BASE_URL}/timetable/semester/${semesterId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch timetable');
    }
    return response.json();
  },

  async createTimetableSlot(data) {
    const response = await fetch(`${API_BASE_URL}/timetable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create timetable slot');
    }
    return response.json();
  },
};
