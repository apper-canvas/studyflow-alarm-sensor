const tableName = 'grade_c';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

export const gradeService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "weight_c"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"name": "course_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        orderBy: [{"fieldName": "course_id_c", "sorttype": "ASC"}]
      };
      
      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data.map(grade => ({
        Id: grade.Id,
        category: grade.category_c,
        weight: grade.weight_c,
        score: grade.score_c,
        total: grade.total_c,
        courseId: grade.course_id_c?.Id || grade.course_id_c
      }));
    } catch (error) {
      console.error("Error fetching grades:", error?.response?.data?.message || error);
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
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "weight_c"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"name": "course_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ]
      };
      
      const response = await apperClient.getRecordById(tableName, id, params);
      
      if (!response?.data) {
        throw new Error("Grade not found");
      }
      
      const grade = response.data;
      return {
        Id: grade.Id,
        category: grade.category_c,
        weight: grade.weight_c,
        score: grade.score_c,
        total: grade.total_c,
        courseId: grade.course_id_c?.Id || grade.course_id_c
      };
    } catch (error) {
      console.error(`Error fetching grade ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async create(gradeData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Name: `${gradeData.category} - Course ${gradeData.courseId}`,
          category_c: gradeData.category,
          weight_c: parseFloat(gradeData.weight),
          score_c: parseFloat(gradeData.score),
          total_c: parseFloat(gradeData.total),
          course_id_c: parseInt(gradeData.courseId)
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
          console.error(`Failed to create grade:`, failed);
          throw new Error(failed[0].message || "Failed to create grade");
        }
        
        const created = response.results[0].data;
        return {
          Id: created.Id,
          category: created.category_c,
          weight: created.weight_c,
          score: created.score_c,
          total: created.total_c,
          courseId: created.course_id_c
        };
      }
    } catch (error) {
      console.error("Error creating grade:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, gradeData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: `${gradeData.category} - Course ${gradeData.courseId}`,
          category_c: gradeData.category,
          weight_c: parseFloat(gradeData.weight),
          score_c: parseFloat(gradeData.score),
          total_c: parseFloat(gradeData.total),
          course_id_c: parseInt(gradeData.courseId)
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
          console.error(`Failed to update grade:`, failed);
          throw new Error(failed[0].message || "Failed to update grade");
        }
        
        const updated = response.results[0].data;
        return {
          Id: updated.Id,
          category: updated.category_c,
          weight: updated.weight_c,
          score: updated.score_c,
          total: updated.total_c,
          courseId: updated.course_id_c
        };
      }
    } catch (error) {
      console.error("Error updating grade:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete grade:`, failed);
          throw new Error(failed[0].message || "Failed to delete grade");
        }
      }
      
      return { Id: parseInt(id) };
    } catch (error) {
      console.error("Error deleting grade:", error?.response?.data?.message || error);
      throw error;
    }
  }
};