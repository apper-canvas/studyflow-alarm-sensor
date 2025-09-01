const tableName = 'course_c';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

export const courseService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "code_c"}},
          {"field": {"Name": "professor_c"}},
          {"field": {"Name": "schedule_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "credits_c"}},
          {"field": {"Name": "semester_c"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      };
      
      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data.map(course => ({
        Id: course.Id,
        name: course.Name,
        code: course.code_c,
        professor: course.professor_c,
        schedule: course.schedule_c,
        color: course.color_c,
        credits: course.credits_c,
        semester: course.semester_c
      }));
    } catch (error) {
      console.error("Error fetching courses:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "code_c"}},
          {"field": {"Name": "professor_c"}},
          {"field": {"Name": "schedule_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "credits_c"}},
          {"field": {"Name": "semester_c"}}
        ]
      };
      
      const response = await apperClient.getRecordById(tableName, id, params);
      
      if (!response?.data) {
        throw new Error("Course not found");
      }
      
      const course = response.data;
      return {
        Id: course.Id,
        name: course.Name,
        code: course.code_c,
        professor: course.professor_c,
        schedule: course.schedule_c,
        color: course.color_c,
        credits: course.credits_c,
        semester: course.semester_c
      };
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async create(courseData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Name: courseData.name,
          code_c: courseData.code,
          professor_c: courseData.professor,
          schedule_c: courseData.schedule,
          color_c: courseData.color,
          credits_c: parseInt(courseData.credits),
          semester_c: courseData.semester
        }]
      };
      
      const response = await apperClient.createRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create course:`, failed);
          throw new Error(failed[0].message || "Failed to create course");
        }
        
        const created = response.results[0].data;
        return {
          Id: created.Id,
          name: created.Name,
          code: created.code_c,
          professor: created.professor_c,
          schedule: created.schedule_c,
          color: created.color_c,
          credits: created.credits_c,
          semester: created.semester_c
        };
      }
    } catch (error) {
      console.error("Error creating course:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, courseData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: courseData.name,
          code_c: courseData.code,
          professor_c: courseData.professor,
          schedule_c: courseData.schedule,
          color_c: courseData.color,
          credits_c: parseInt(courseData.credits),
          semester_c: courseData.semester
        }]
      };
      
      const response = await apperClient.updateRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update course:`, failed);
          throw new Error(failed[0].message || "Failed to update course");
        }
        
        const updated = response.results[0].data;
        return {
          Id: updated.Id,
          name: updated.Name,
          code: updated.code_c,
          professor: updated.professor_c,
          schedule: updated.schedule_c,
          color: updated.color_c,
          credits: updated.credits_c,
          semester: updated.semester_c
        };
      }
    } catch (error) {
      console.error("Error updating course:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete course:`, failed);
          throw new Error(failed[0].message || "Failed to delete course");
        }
      }
      
      return { Id: parseInt(id) };
    } catch (error) {
      console.error("Error deleting course:", error?.response?.data?.message || error);
      throw error;
    }
  }
};