import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import FilterSelect from "@/components/molecules/FilterSelect";
import AssignmentList from "@/components/organisms/AssignmentList";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { assignmentService } from "@/services/api/assignmentService";
import { courseService } from "@/services/api/courseService";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    dueDate: "",
    priority: "medium",
    status: "pending",
    description: "",
    grade: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [assignmentsData, coursesData] = await Promise.all([
        assignmentService.getAll(),
        courseService.getAll()
      ]);
      setAssignments(assignmentsData);
      setCourses(coursesData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        courseId: parseInt(formData.courseId),
        grade: formData.grade ? parseFloat(formData.grade) : null
      };

      if (editingAssignment) {
        await assignmentService.update(editingAssignment.Id, submitData);
        toast.success("Assignment updated successfully!");
      } else {
        await assignmentService.create(submitData);
        toast.success("Assignment added successfully!");
      }
      await loadData();
      closeModal();
    } catch (err) {
      console.error("Error saving assignment:", err);
      toast.error(err.message || "Failed to save assignment");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        await assignmentService.delete(id);
        toast.success("Assignment deleted successfully!");
        await loadData();
      } catch (err) {
        console.error("Error deleting assignment:", err);
        toast.error(err.message || "Failed to delete assignment");
      }
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      courseId: assignment.courseId.toString(),
      dueDate: assignment.dueDate.split('T')[0],
      priority: assignment.priority,
      status: assignment.status,
      description: assignment.description || "",
      grade: assignment.grade || ""
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      const assignment = assignments.find(a => a.Id === id);
      const newStatus = assignment.status === "completed" ? "pending" : "completed";
      await assignmentService.update(id, { status: newStatus });
      toast.success(`Assignment marked as ${newStatus}!`);
      await loadData();
    } catch (err) {
      console.error("Error updating assignment status:", err);
      toast.error("Failed to update assignment status");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAssignment(null);
    setFormData({
      title: "",
      courseId: "",
      dueDate: "",
      priority: "medium",
      status: "pending",
      description: "",
      grade: ""
    });
  };

  const courseOptions = [
    { value: "", label: "Select a course" },
    ...courses.map(course => ({ value: course.Id.toString(), label: `${course.name} (${course.code})` }))
  ];

  const priorityOptions = [
    { value: "low", label: "Low Priority" },
    { value: "medium", label: "Medium Priority" },
    { value: "high", label: "High Priority" }
  ];

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" }
  ];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Assignments</h1>
          <p className="text-gray-600 mt-1">Track and manage all your course assignments</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <ApperIcon name="Plus" className="w-4 h-4" />
          Add Assignment
        </Button>
      </div>

      {assignments.length === 0 ? (
        <Empty
          title="No assignments yet"
          message="Start by adding your first assignment to track your coursework."
          actionLabel="Add Assignment"
          onAction={() => setIsModalOpen(true)}
          icon="FileText"
        />
      ) : (
        <AssignmentList
          assignments={assignments}
          courses={courses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold gradient-text">
                  {editingAssignment ? "Edit Assignment" : "Add New Assignment"}
                </h2>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  <ApperIcon name="X" className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Assignment Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Math Homework Chapter 5"
                  required
                />

                <FilterSelect
                  label="Course"
                  value={formData.courseId}
                  onChange={(value) => setFormData({ ...formData, courseId: value })}
                  options={courseOptions}
                />

                <Input
                  label="Due Date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />

                <FilterSelect
                  label="Priority"
                  value={formData.priority}
                  onChange={(value) => setFormData({ ...formData, priority: value })}
                  options={priorityOptions}
                />

                <FilterSelect
                  label="Status"
                  value={formData.status}
                  onChange={(value) => setFormData({ ...formData, status: value })}
                  options={statusOptions}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Assignment details and notes..."
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <Input
                  label="Grade (optional)"
                  type="number"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="85"
                  min="0"
                  max="100"
                />

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingAssignment ? "Update Assignment" : "Add Assignment"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={closeModal}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;