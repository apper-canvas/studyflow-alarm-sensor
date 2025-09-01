import studySessionsData from "@/services/mockData/studySessions.json";

let studySessions = [...studySessionsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const studySessionService = {
  async getAll() {
    await delay(300);
    return [...studySessions];
  },

  async getById(id) {
    await delay(200);
    const session = studySessions.find(session => session.Id === parseInt(id));
    if (!session) {
      throw new Error("Study session not found");
    }
    return { ...session };
  },

  async create(sessionData) {
    await delay(400);
    const maxId = studySessions.length > 0 ? Math.max(...studySessions.map(s => s.Id)) : 0;
    const newSession = {
      Id: maxId + 1,
      ...sessionData,
      courseId: parseInt(sessionData.courseId)
    };
    studySessions.push(newSession);
    return { ...newSession };
  },

  async update(id, sessionData) {
    await delay(300);
    const index = studySessions.findIndex(session => session.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Study session not found");
    }
    const updatedData = { ...sessionData };
    if (updatedData.courseId) {
      updatedData.courseId = parseInt(updatedData.courseId);
    }
    studySessions[index] = { ...studySessions[index], ...updatedData };
    return { ...studySessions[index] };
  },

  async delete(id) {
    await delay(200);
    const index = studySessions.findIndex(session => session.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Study session not found");
    }
    const deletedSession = studySessions.splice(index, 1)[0];
    return { ...deletedSession };
  }
};