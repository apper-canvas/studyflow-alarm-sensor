import coursesData from "@/services/mockData/courses.json";

let courses = [...coursesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const courseService = {
  async getAll() {
    await delay(300);
    return [...courses];
  },

  async getById(id) {
    await delay(200);
    const course = courses.find(course => course.Id === parseInt(id));
    if (!course) {
      throw new Error("Course not found");
    }
    return { ...course };
  },

  async create(courseData) {
    await delay(400);
    const maxId = courses.length > 0 ? Math.max(...courses.map(c => c.Id)) : 0;
    const newCourse = {
      Id: maxId + 1,
      ...courseData,
    };
    courses.push(newCourse);
    return { ...newCourse };
  },

  async update(id, courseData) {
    await delay(300);
    const index = courses.findIndex(course => course.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Course not found");
    }
    courses[index] = { ...courses[index], ...courseData };
    return { ...courses[index] };
  },

  async delete(id) {
    await delay(200);
    const index = courses.findIndex(course => course.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Course not found");
    }
    const deletedCourse = courses.splice(index, 1)[0];
    return { ...deletedCourse };
  }
};