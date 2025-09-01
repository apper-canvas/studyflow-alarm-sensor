const tableName = 'study_session_c';

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

export const studySessionService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"name": "course_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      };
      
      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data.map(session => ({
        Id: session.Id,
        courseId: session.course_id_c?.Id || session.course_id_c,
        date: session.date_c,
        duration: session.duration_c,
        notes: session.notes_c
      }));
    } catch (error) {
      console.error("Error fetching study sessions:", error?.response?.data?.message || error);
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
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"name": "course_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ]
      };
      
      const response = await apperClient.getRecordById(tableName, id, params);
      
      if (!response?.data) {
        throw new Error("Study session not found");
      }
      
      const session = response.data;
      return {
        Id: session.Id,
        courseId: session.course_id_c?.Id || session.course_id_c,
        date: session.date_c,
        duration: session.duration_c,
        notes: session.notes_c
      };
    } catch (error) {
      console.error(`Error fetching study session ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async create(sessionData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Name: `Study Session - ${sessionData.duration} min`,
          course_id_c: parseInt(sessionData.courseId),
          date_c: sessionData.date,
          duration_c: parseInt(sessionData.duration),
          notes_c: sessionData.notes
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
          console.error(`Failed to create study session:`, failed);
          throw new Error(failed[0].message || "Failed to create study session");
        }
        
        const created = response.results[0].data;
        return {
          Id: created.Id,
          courseId: created.course_id_c,
          date: created.date_c,
          duration: created.duration_c,
          notes: created.notes_c
        };
      }
    } catch (error) {
      console.error("Error creating study session:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, sessionData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: `Study Session - ${sessionData.duration} min`,
          course_id_c: parseInt(sessionData.courseId),
          date_c: sessionData.date,
          duration_c: parseInt(sessionData.duration),
          notes_c: sessionData.notes
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
          console.error(`Failed to update study session:`, failed);
          throw new Error(failed[0].message || "Failed to update study session");
        }
        
        const updated = response.results[0].data;
        return {
          Id: updated.Id,
          courseId: updated.course_id_c,
          date: updated.date_c,
          duration: updated.duration_c,
          notes: updated.notes_c
        };
      }
    } catch (error) {
      console.error("Error updating study session:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete study session:`, failed);
          throw new Error(failed[0].message || "Failed to delete study session");
        }
      }
      
      return { Id: parseInt(id) };
    } catch (error) {
      console.error("Error deleting study session:", error?.response?.data?.message || error);
      throw error;
    }
  }
};