import gradesData from "@/services/mockData/grades.json";

let grades = [...gradesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const gradeService = {
  async getAll() {
    await delay(300);
    return [...grades];
  },

  async getById(id) {
    await delay(200);
    const grade = grades.find(grade => grade.Id === parseInt(id));
    if (!grade) {
      throw new Error("Grade not found");
    }
    return { ...grade };
  },

  async create(gradeData) {
    await delay(400);
    const maxId = grades.length > 0 ? Math.max(...grades.map(g => g.Id)) : 0;
    const newGrade = {
      Id: maxId + 1,
      ...gradeData,
      courseId: parseInt(gradeData.courseId)
    };
    grades.push(newGrade);
    return { ...newGrade };
  },

  async update(id, gradeData) {
    await delay(300);
    const index = grades.findIndex(grade => grade.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Grade not found");
    }
    const updatedData = { ...gradeData };
    if (updatedData.courseId) {
      updatedData.courseId = parseInt(updatedData.courseId);
    }
    grades[index] = { ...grades[index], ...updatedData };
    return { ...grades[index] };
  },

  async delete(id) {
    await delay(200);
    const index = grades.findIndex(grade => grade.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Grade not found");
    }
    const deletedGrade = grades.splice(index, 1)[0];
    return { ...deletedGrade };
  }
};