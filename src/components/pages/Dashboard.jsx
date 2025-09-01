import { useState, useEffect } from "react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import ProgressRing from "@/components/molecules/ProgressRing";
import { courseService } from "@/services/api/courseService";
import { assignmentService } from "@/services/api/assignmentService";
import { gradeService } from "@/services/api/gradeService";
import { studySessionService } from "@/services/api/studySessionService";

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [coursesData, assignmentsData, gradesData, sessionsData] = await Promise.all([
        courseService.getAll(),
        assignmentService.getAll(),
        gradeService.getAll(),
        studySessionService.getAll()
      ]);
      
      setCourses(coursesData);
      setAssignments(assignmentsData);
      setGrades(gradesData);
      setStudySessions(sessionsData);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  // Calculate statistics
  const calculateGPA = () => {
    const courseGPAs = courses.map(course => {
      const courseGrades = grades.filter(grade => grade.courseId === course.Id);
      if (courseGrades.length === 0) return 0;
      
      const weightedScore = courseGrades.reduce((acc, grade) => {
        return acc + (grade.score / grade.total) * (grade.weight / 100);
      }, 0);
      
      return weightedScore * 4; // Convert to 4.0 scale
    });
    
    const avgGPA = courseGPAs.reduce((acc, gpa) => acc + gpa, 0) / courseGPAs.length;
    return avgGPA.toFixed(2);
  };

  const getUpcomingAssignments = () => {
    const now = new Date();
    const weekFromNow = addDays(now, 7);
    return assignments
      .filter(assignment => 
        assignment.status !== "completed" && 
        isAfter(new Date(assignment.dueDate), now) && 
        isBefore(new Date(assignment.dueDate), weekFromNow)
      )
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  };

  const getTodaysClasses = () => {
    const today = new Date();
    const dayOfWeek = today.toLocaleLowerCase().slice(0, 3); // mon, tue, etc.
    
    return courses.filter(course => 
      course.schedule.toLowerCase().includes(dayOfWeek) ||
      (dayOfWeek === "mon" && course.schedule.includes("M")) ||
      (dayOfWeek === "tue" && course.schedule.includes("T") && !course.schedule.includes("Th")) ||
      (dayOfWeek === "wed" && course.schedule.includes("W")) ||
      (dayOfWeek === "thu" && course.schedule.includes("Th")) ||
      (dayOfWeek === "fri" && course.schedule.includes("F"))
    );
  };

  const getWeeklyStudyTime = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return studySessions
      .filter(session => new Date(session.date) > weekAgo)
      .reduce((total, session) => total + session.duration, 0);
  };

  const getCompletionRate = () => {
    const completedAssignments = assignments.filter(a => a.status === "completed").length;
    const totalAssignments = assignments.length;
    return totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;
  };

  const gpa = calculateGPA();
  const upcomingAssignments = getUpcomingAssignments();
  const todaysClasses = getTodaysClasses();
  const weeklyStudyTime = getWeeklyStudyTime();
  const completionRate = getCompletionRate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Welcome back!</h1>
          <p className="text-gray-600 mt-1">Here's your academic overview for today</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Current GPA"
          value={gpa}
          subtitle="Out of 4.0"
          icon="Award"
          color="primary"
        />
        <StatCard
          title="Active Courses"
          value={courses.length}
          subtitle="This semester"
          icon="BookOpen"
          color="secondary"
        />
        <StatCard
          title="Pending Assignments"
          value={assignments.filter(a => a.status !== "completed").length}
          subtitle="Need attention"
          icon="FileText"
          color="warning"
        />
        <StatCard
          title="Weekly Study Time"
          value={`${weeklyStudyTime}h`}
          subtitle="Last 7 days"
          icon="Clock"
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Classes */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ApperIcon name="Calendar" className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Today's Classes</h2>
          </div>
          
          {todaysClasses.length > 0 ? (
            <div className="space-y-3">
              {todaysClasses.map((course) => (
                <div
                  key={course.Id}
                  className={`p-3 rounded-lg border-l-4 bg-opacity-10 ${
                    course.color === "blue" ? "border-l-blue-500 bg-blue-50" :
                    course.color === "green" ? "border-l-green-500 bg-green-50" :
                    course.color === "purple" ? "border-l-purple-500 bg-purple-50" :
                    course.color === "red" ? "border-l-red-500 bg-red-50" :
                    course.color === "yellow" ? "border-l-yellow-500 bg-yellow-50" :
                    "border-l-pink-500 bg-pink-50"
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{course.name}</h3>
                  <p className="text-sm text-gray-600">{course.schedule}</p>
                  <p className="text-xs text-gray-500">{course.professor}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <ApperIcon name="Coffee" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No classes scheduled for today</p>
            </div>
          )}
        </Card>

        {/* Upcoming Assignments */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ApperIcon name="Clock" className="w-5 h-5 text-accent-600" />
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
          </div>
          
          {upcomingAssignments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAssignments.map((assignment) => {
                const course = courses.find(c => c.Id === assignment.courseId);
                const daysUntil = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={assignment.Id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {assignment.title}
                      </h4>
                      <p className="text-xs text-gray-500">{course?.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={assignment.priority === "high" ? "danger" : assignment.priority === "medium" ? "warning" : "success"}>
                          {assignment.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <ApperIcon name="CheckCircle" className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No upcoming deadlines this week</p>
            </div>
          )}
        </Card>

        {/* Progress Overview */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <ApperIcon name="TrendingUp" className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Progress Overview</h2>
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <ProgressRing progress={completionRate} size={100} />
              <p className="text-sm text-gray-600 mt-2">Assignment Completion</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium">{assignments.filter(a => a.status === "completed").length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">In Progress</span>
                <span className="font-medium">{assignments.filter(a => a.status === "in-progress").length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending</span>
                <span className="font-medium">{assignments.filter(a => a.status === "pending").length}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Study Sessions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name="BarChart3" className="w-5 h-5 text-secondary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Study Sessions</h2>
          </div>
        </div>
        
        {studySessions.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {studySessions.slice(-4).map((session) => {
                const course = courses.find(c => c.Id === session.courseId);
                return (
                  <div key={session.Id} className="bg-gradient-to-br from-primary-50 to-secondary-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        course?.color === "blue" ? "bg-blue-500" :
                        course?.color === "green" ? "bg-green-500" :
                        course?.color === "purple" ? "bg-purple-500" :
                        course?.color === "red" ? "bg-red-500" :
                        course?.color === "yellow" ? "bg-yellow-500" :
                        "bg-pink-500"
                      }`}></div>
                      <h4 className="text-sm font-medium text-gray-900">{course?.name}</h4>
                    </div>
                    <p className="text-lg font-bold gradient-text">{session.duration} min</p>
                    <p className="text-xs text-gray-500">{format(new Date(session.date), "MMM d, h:mm a")}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <ApperIcon name="BookOpen" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No study sessions recorded yet</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;