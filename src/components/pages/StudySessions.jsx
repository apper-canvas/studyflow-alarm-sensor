import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import StatCard from "@/components/molecules/StatCard";
import StudyTimer from "@/components/organisms/StudyTimer";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { studySessionService } from "@/services/api/studySessionService";
import { courseService } from "@/services/api/courseService";

const StudySessions = () => {
  const [studySessions, setStudySessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [sessionsData, coursesData] = await Promise.all([
        studySessionService.getAll(),
        courseService.getAll()
      ]);
      setStudySessions(sessionsData);
      setCourses(coursesData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to load study sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSessionComplete = async (sessionData) => {
    try {
      await studySessionService.create(sessionData);
      toast.success("Study session recorded successfully!");
      await loadData();
    } catch (err) {
      console.error("Error saving study session:", err);
      toast.error("Failed to save study session");
    }
  };

  const handleDeleteSession = async (id) => {
    if (window.confirm("Are you sure you want to delete this study session?")) {
      try {
        await studySessionService.delete(id);
        toast.success("Study session deleted successfully!");
        await loadData();
      } catch (err) {
        console.error("Error deleting study session:", err);
        toast.error("Failed to delete study session");
      }
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  // Calculate statistics
  const getTotalStudyTime = () => {
    return studySessions.reduce((total, session) => total + session.duration, 0);
  };

  const getWeeklyStudyTime = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return studySessions
      .filter(session => new Date(session.date) > weekAgo)
      .reduce((total, session) => total + session.duration, 0);
  };

  const getAverageSessionLength = () => {
    if (studySessions.length === 0) return 0;
    return Math.round(getTotalStudyTime() / studySessions.length);
  };

  const getStudyStreak = () => {
    if (studySessions.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    // Check each day going backwards
    for (let i = 0; i < 30; i++) {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const hasStudySession = studySessions.some(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      });
      
      if (hasStudySession) {
        streak++;
      } else if (i > 0) { // Allow current day to not have a session yet
        break;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const getCourse = (courseId) => {
    return courses.find(course => course.Id === courseId);
  };

  const totalStudyTime = getTotalStudyTime();
  const weeklyStudyTime = getWeeklyStudyTime();
  const averageSession = getAverageSessionLength();
  const studyStreak = getStudyStreak();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Study Sessions</h1>
          <p className="text-gray-600 mt-1">Track your study time and build consistent habits</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Study Time"
          value={`${Math.round(totalStudyTime / 60)}h`}
          subtitle={`${totalStudyTime % 60}m`}
          icon="Clock"
          color="primary"
        />
        <StatCard
          title="This Week"
          value={`${Math.round(weeklyStudyTime / 60)}h`}
          subtitle={`${weeklyStudyTime % 60}m`}
          icon="Calendar"
          color="secondary"
        />
        <StatCard
          title="Average Session"
          value={`${averageSession}min`}
          subtitle="Per session"
          icon="BarChart3"
          color="success"
        />
        <StatCard
          title="Study Streak"
          value={`${studyStreak}`}
          subtitle="Days in a row"
          icon="Zap"
          color="accent"
        />
      </div>

      {/* Study Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudyTimer courses={courses} onSessionComplete={handleSessionComplete} />
        
        {/* Quick Stats */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold gradient-text mb-4">Study Overview</h2>
          
          {courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map(course => {
                const courseSessions = studySessions.filter(session => session.courseId === course.Id);
                const courseTime = courseSessions.reduce((total, session) => total + session.duration, 0);
                const sessionCount = courseSessions.length;
                
                const colorClasses = {
                  red: "border-red-500 bg-red-50",
                  blue: "border-blue-500 bg-blue-50",
                  green: "border-green-500 bg-green-50",
                  purple: "border-purple-500 bg-purple-50",
                  yellow: "border-yellow-500 bg-yellow-50",
                  pink: "border-pink-500 bg-pink-50"
                };
                
                return (
                  <div key={course.Id} className={`p-3 rounded-lg border-l-4 ${colorClasses[course.color]}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{course.name}</h4>
                        <p className="text-sm text-gray-600">{sessionCount} sessions</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold gradient-text">
                          {Math.floor(courseTime / 60)}h {courseTime % 60}m
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <ApperIcon name="BookOpen" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Add courses to start tracking study sessions</p>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold gradient-text">Recent Sessions</h2>
        </div>

        {studySessions.length === 0 ? (
          <Empty
            title="No study sessions yet"
            message="Start your first study session using the timer above to begin tracking your progress."
            icon="Clock"
          />
        ) : (
          <div className="space-y-4">
            {studySessions
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 10)
              .map((session) => {
                const course = getCourse(session.courseId);
                
                return (
                  <div key={session.Id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        course?.color === "blue" ? "bg-blue-500" :
                        course?.color === "green" ? "bg-green-500" :
                        course?.color === "purple" ? "bg-purple-500" :
                        course?.color === "red" ? "bg-red-500" :
                        course?.color === "yellow" ? "bg-yellow-500" :
                        "bg-pink-500"
                      }`}></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{course?.name || "Unknown Course"}</h4>
                        <p className="text-sm text-gray-600">{session.notes}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(session.date), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-lg font-bold gradient-text">{session.duration} min</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSession(session.Id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudySessions;