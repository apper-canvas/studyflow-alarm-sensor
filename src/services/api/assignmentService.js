import assignmentsData from "@/services/mockData/assignments.json";

let assignments = [...assignmentsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const assignmentService = {
  async getAll() {
    await delay(300);
    return [...assignments];
  },

  async getById(id) {
    await delay(200);
    const assignment = assignments.find(assignment => assignment.Id === parseInt(id));
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    return { ...assignment };
  },

  async create(assignmentData) {
    await delay(400);
    const maxId = assignments.length > 0 ? Math.max(...assignments.map(a => a.Id)) : 0;
    const newAssignment = {
      Id: maxId + 1,
      ...assignmentData,
      courseId: parseInt(assignmentData.courseId)
    };
    assignments.push(newAssignment);
    return { ...newAssignment };
  },

  async update(id, assignmentData) {
    await delay(300);
    const index = assignments.findIndex(assignment => assignment.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Assignment not found");
    }
    const updatedData = { ...assignmentData };
    if (updatedData.courseId) {
      updatedData.courseId = parseInt(updatedData.courseId);
    }
    assignments[index] = { ...assignments[index], ...updatedData };
    return { ...assignments[index] };
  },

  async delete(id) {
    await delay(200);
    const index = assignments.findIndex(assignment => assignment.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Assignment not found");
    }
    const deletedAssignment = assignments.splice(index, 1)[0];
    return { ...deletedAssignment };
  }
};