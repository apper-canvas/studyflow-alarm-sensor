import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import FilterSelect from "@/components/molecules/FilterSelect";
import StatCard from "@/components/molecules/StatCard";
import ProgressRing from "@/components/molecules/ProgressRing";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { gradeService } from "@/services/api/gradeService";
import { courseService } from "@/services/api/courseService";

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [formData, setFormData] = useState({
    courseId: "",
    category: "",
    weight: "",
    score: "",
    total: "100"
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [gradesData, coursesData] = await Promise.all([
        gradeService.getAll(),
        courseService.getAll()
      ]);
      setGrades(gradesData);
      setCourses(coursesData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to load grades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateCourseGrade = (courseId) => {
    const courseGrades = grades.filter(grade => grade.courseId === courseId);
    if (courseGrades.length === 0) return 0;
    
    const totalWeight = courseGrades.reduce((sum, grade) => sum + grade.weight, 0);
    if (totalWeight === 0) return 0;
    
    const weightedScore = courseGrades.reduce((sum, grade) => {
      return sum + (grade.score / grade.total) * grade.weight;
    }, 0);
    
    return Math.round((weightedScore / totalWeight) * 100);
  };

  const calculateOverallGPA = () => {
    const courseGPAs = courses.map(course => {
      const courseGrade = calculateCourseGrade(course.Id);
      // Convert percentage to 4.0 scale
      if (courseGrade >= 97) return 4.0;
      if (courseGrade >= 93) return 3.7;
      if (courseGrade >= 90) return 3.3;
      if (courseGrade >= 87) return 3.0;
      if (courseGrade >= 83) return 2.7;
      if (courseGrade >= 80) return 2.3;
      if (courseGrade >= 77) return 2.0;
      if (courseGrade >= 73) return 1.7;
      if (courseGrade >= 70) return 1.3;
      if (courseGrade >= 67) return 1.0;
      return 0.0;
    });
    
    const avgGPA = courseGPAs.reduce((sum, gpa) => sum + gpa, 0) / courseGPAs.length;
    return avgGPA.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        courseId: parseInt(formData.courseId),
        category: formData.category,
        weight: parseFloat(formData.weight),
        score: parseFloat(formData.score),
        total: parseFloat(formData.total)
      };

      if (editingGrade) {
        await gradeService.update(editingGrade.Id, submitData);
        toast.success("Grade updated successfully!");
      } else {
        await gradeService.create(submitData);
        toast.success("Grade added successfully!");
      }
      await loadData();
      closeModal();
    } catch (err) {
      console.error("Error saving grade:", err);
      toast.error(err.message || "Failed to save grade");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      try {
        await gradeService.delete(id);
        toast.success("Grade deleted successfully!");
        await loadData();
      } catch (err) {
        console.error("Error deleting grade:", err);
        toast.error(err.message || "Failed to delete grade");
      }
    }
  };

  const handleEdit = (grade) => {
    setEditingGrade(grade);
    setFormData({
      courseId: grade.courseId.toString(),
      category: grade.category,
      weight: grade.weight.toString(),
      score: grade.score.toString(),
      total: grade.total.toString()
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGrade(null);
    setFormData({
      courseId: "",
      category: "",
      weight: "",
      score: "",
      total: "100"
    });
  };

  const filteredGrades = selectedCourse === "all" 
    ? grades 
    : grades.filter(grade => grade.courseId === parseInt(selectedCourse));

  const courseOptions = [
    { value: "all", label: "All Courses" },
    ...courses.map(course => ({ value: course.Id.toString(), label: `${course.name} (${course.code})` }))
  ];

  const categoryOptions = [
    { value: "Homework", label: "Homework" },
    { value: "Exams", label: "Exams" },
    { value: "Quizzes", label: "Quizzes" },
    { value: "Projects", label: "Projects" },
    { value: "Labs", label: "Labs" },
    { value: "Participation", label: "Participation" },
    { value: "Essays", label: "Essays" },
    { value: "Final Exam", label: "Final Exam" }
  ];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const overallGPA = calculateOverallGPA();
  const averageGrade = courses.length > 0 
    ? Math.round(courses.reduce((sum, course) => sum + calculateCourseGrade(course.Id), 0) / courses.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Grades</h1>
          <p className="text-gray-600 mt-1">Track your academic performance and GPA</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <ApperIcon name="Plus" className="w-4 h-4" />
          Add Grade
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Overall GPA"
          value={overallGPA}
          subtitle="Out of 4.0"
          icon="Award"
          color="primary"
        />
        <StatCard
          title="Average Grade"
          value={`${averageGrade}%`}
          subtitle="Across all courses"
          icon="TrendingUp"
          color="success"
        />
        <StatCard
          title="Courses Tracked"
          value={courses.length}
          subtitle="This semester"
          icon="BookOpen"
          color="secondary"
        />
      </div>

      {/* Course Grade Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold gradient-text mb-4">Course Grades</h2>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
              const courseGrade = calculateCourseGrade(course.Id);
              const colorClasses = {
                red: "border-red-500 bg-red-50",
                blue: "border-blue-500 bg-blue-50",
                green: "border-green-500 bg-green-50",
                purple: "border-purple-500 bg-purple-50",
                yellow: "border-yellow-500 bg-yellow-50",
                pink: "border-pink-500 bg-pink-50"
              };
              
              return (
                <div key={course.Id} className={`p-4 rounded-lg border-l-4 ${colorClasses[course.color]}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.name}</h3>
                      <p className="text-sm text-gray-600">{course.code}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold gradient-text">{courseGrade}%</div>
                    </div>
                  </div>
                  <ProgressRing progress={courseGrade} size={80} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <ApperIcon name="BookOpen" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No courses available. Add courses first to track grades.</p>
          </div>
        )}
      </Card>

      {/* Grade Details */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold gradient-text">Grade Details</h2>
          <FilterSelect
            value={selectedCourse}
            onChange={setSelectedCourse}
            options={courseOptions}
            className="sm:w-64"
          />
        </div>

        {filteredGrades.length === 0 ? (
          <Empty
            title="No grades yet"
            message="Start by adding grades for your assignments and exams."
            actionLabel="Add Grade"
            onAction={() => setIsModalOpen(true)}
            icon="Award"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGrades.map((grade) => {
                  const course = courses.find(c => c.Id === grade.courseId);
                  const percentage = Math.round((grade.score / grade.total) * 100);
                  
                  return (
                    <tr key={grade.Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{course?.name}</div>
                          <div className="text-sm text-gray-500">{course?.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.weight}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.score}/{grade.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          percentage >= 90 ? "bg-green-100 text-green-800" :
                          percentage >= 80 ? "bg-blue-100 text-blue-800" :
                          percentage >= 70 ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(grade)}
                            className="p-1"
                          >
                            <ApperIcon name="Edit2" className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(grade.Id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold gradient-text">
                  {editingGrade ? "Edit Grade" : "Add New Grade"}
                </h2>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  <ApperIcon name="X" className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FilterSelect
                  label="Course"
                  value={formData.courseId}
                  onChange={(value) => setFormData({ ...formData, courseId: value })}
                  options={courseOptions.filter(opt => opt.value !== "all")}
                />

                <FilterSelect
                  label="Category"
                  value={formData.category}
                  onChange={(value) => setFormData({ ...formData, category: value })}
                  options={categoryOptions}
                />

                <Input
                  label="Weight (%)"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="30"
                  min="0"
                  max="100"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Score"
                    type="number"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    placeholder="85"
                    min="0"
                    required
                  />
                  <Input
                    label="Total Points"
                    type="number"
                    value={formData.total}
                    onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                    placeholder="100"
                    min="1"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingGrade ? "Update Grade" : "Add Grade"}
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

export default Grades;