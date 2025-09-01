import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import FilterSelect from "@/components/molecules/FilterSelect";
import CourseCard from "@/components/organisms/CourseCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { courseService } from "@/services/api/courseService";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    professor: "",
    schedule: "",
    color: "blue",
    credits: 3,
    semester: "Fall 2024"
  });

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await courseService.getAll();
      setCourses(data);
    } catch (err) {
      console.error("Error loading courses:", err);
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await courseService.update(editingCourse.Id, formData);
        toast.success("Course updated successfully!");
      } else {
        await courseService.create(formData);
        toast.success("Course added successfully!");
      }
      await loadCourses();
      closeModal();
    } catch (err) {
      console.error("Error saving course:", err);
      toast.error(err.message || "Failed to save course");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await courseService.delete(id);
        toast.success("Course deleted successfully!");
        await loadCourses();
      } catch (err) {
        console.error("Error deleting course:", err);
        toast.error(err.message || "Failed to delete course");
      }
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      professor: course.professor,
      schedule: course.schedule,
      color: course.color,
      credits: course.credits,
      semester: course.semester
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    setFormData({
      name: "",
      code: "",
      professor: "",
      schedule: "",
      color: "blue",
      credits: 3,
      semester: "Fall 2024"
    });
  };

  const colorOptions = [
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "purple", label: "Purple" },
    { value: "red", label: "Red" },
    { value: "yellow", label: "Yellow" },
    { value: "pink", label: "Pink" }
  ];

  const creditOptions = [
    { value: "1", label: "1 Credit" },
    { value: "2", label: "2 Credits" },
    { value: "3", label: "3 Credits" },
    { value: "4", label: "4 Credits" },
    { value: "5", label: "5 Credits" }
  ];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadCourses} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Courses</h1>
          <p className="text-gray-600 mt-1">Manage your enrolled courses for this semester</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <ApperIcon name="Plus" className="w-4 h-4" />
          Add Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <Empty
          title="No courses yet"
          message="Start by adding your first course to organize your academic schedule."
          actionLabel="Add Course"
          onAction={() => setIsModalOpen(true)}
          icon="BookOpen"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.Id}
              course={course}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold gradient-text">
                  {editingCourse ? "Edit Course" : "Add New Course"}
                </h2>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  <ApperIcon name="X" className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Course Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Introduction to Psychology"
                  required
                />

                <Input
                  label="Course Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="PSYC 101"
                  required
                />

                <Input
                  label="Professor"
                  value={formData.professor}
                  onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                  placeholder="Dr. Sarah Johnson"
                  required
                />

                <Input
                  label="Schedule"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="MWF 10:00-10:50 AM"
                  required
                />

                <FilterSelect
                  label="Color Theme"
                  value={formData.color}
                  onChange={(value) => setFormData({ ...formData, color: value })}
                  options={colorOptions}
                />

                <FilterSelect
                  label="Credits"
                  value={formData.credits.toString()}
                  onChange={(value) => setFormData({ ...formData, credits: parseInt(value) })}
                  options={creditOptions}
                />

                <Input
                  label="Semester"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  placeholder="Fall 2024"
                  required
                />

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingCourse ? "Update Course" : "Add Course"}
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

export default Courses;