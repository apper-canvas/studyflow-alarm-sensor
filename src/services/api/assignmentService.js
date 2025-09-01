const tableName = 'assignment_c';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

export const assignmentService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "grade_c"}},
          {"field": {"name": "course_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        orderBy: [{"fieldName": "due_date_c", "sorttype": "ASC"}]
      };
      
      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data.map(assignment => ({
        Id: assignment.Id,
        title: assignment.title_c,
        courseId: assignment.course_id_c?.Id || assignment.course_id_c,
        dueDate: assignment.due_date_c,
        priority: assignment.priority_c,
        status: assignment.status_c,
        description: assignment.description_c,
        grade: assignment.grade_c
      }));
    } catch (error) {
      console.error("Error fetching assignments:", error?.response?.data?.message || error);
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "grade_c"}},
          {"field": {"name": "course_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ]
      };
      
      const response = await apperClient.getRecordById(tableName, id, params);
      
      if (!response?.data) {
        throw new Error("Assignment not found");
      }
      
      const assignment = response.data;
      return {
        Id: assignment.Id,
        title: assignment.title_c,
        courseId: assignment.course_id_c?.Id || assignment.course_id_c,
        dueDate: assignment.due_date_c,
        priority: assignment.priority_c,
        status: assignment.status_c,
        description: assignment.description_c,
        grade: assignment.grade_c
      };
    } catch (error) {
      console.error(`Error fetching assignment ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async create(assignmentData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Name: assignmentData.title,
          title_c: assignmentData.title,
          due_date_c: assignmentData.dueDate,
          priority_c: assignmentData.priority,
          status_c: assignmentData.status,
          description_c: assignmentData.description,
          grade_c: assignmentData.grade ? parseFloat(assignmentData.grade) : null,
          course_id_c: parseInt(assignmentData.courseId)
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
          console.error(`Failed to create assignment:`, failed);
          throw new Error(failed[0].message || "Failed to create assignment");
        }
        
        const created = response.results[0].data;
        return {
          Id: created.Id,
          title: created.title_c,
          courseId: created.course_id_c,
          dueDate: created.due_date_c,
          priority: created.priority_c,
          status: created.status_c,
          description: created.description_c,
          grade: created.grade_c
        };
      }
    } catch (error) {
      console.error("Error creating assignment:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, assignmentData) {
    try {
      const apperClient = getApperClient();
      const updateRecord = {
        Id: parseInt(id)
      };
      
      // Only include fields that are provided
      if (assignmentData.title !== undefined) {
        updateRecord.Name = assignmentData.title;
        updateRecord.title_c = assignmentData.title;
      }
      if (assignmentData.dueDate !== undefined) {
        updateRecord.due_date_c = assignmentData.dueDate;
      }
      if (assignmentData.priority !== undefined) {
        updateRecord.priority_c = assignmentData.priority;
      }
      if (assignmentData.status !== undefined) {
        updateRecord.status_c = assignmentData.status;
      }
      if (assignmentData.description !== undefined) {
        updateRecord.description_c = assignmentData.description;
      }
      if (assignmentData.grade !== undefined) {
        updateRecord.grade_c = assignmentData.grade ? parseFloat(assignmentData.grade) : null;
      }
      if (assignmentData.courseId !== undefined) {
        updateRecord.course_id_c = parseInt(assignmentData.courseId);
      }
      
      const params = { records: [updateRecord] };
      
      const response = await apperClient.updateRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update assignment:`, failed);
          throw new Error(failed[0].message || "Failed to update assignment");
        }
        
        const updated = response.results[0].data;
        return {
          Id: updated.Id,
          title: updated.title_c,
          courseId: updated.course_id_c,
          dueDate: updated.due_date_c,
          priority: updated.priority_c,
          status: updated.status_c,
          description: updated.description_c,
          grade: updated.grade_c
        };
      }
    } catch (error) {
      console.error("Error updating assignment:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete assignment:`, failed);
          throw new Error(failed[0].message || "Failed to delete assignment");
        }
      }
      
      return { Id: parseInt(id) };
    } catch (error) {
      console.error("Error deleting assignment:", error?.response?.data?.message || error);
      throw error;
    }
  }
};