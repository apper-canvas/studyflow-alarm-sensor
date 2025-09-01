import { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import FilterSelect from "@/components/molecules/FilterSelect";

const StudyTimer = ({ courses, onSessionComplete }) => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [isActive, setIsActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      completeSession();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startTimer = () => {
    if (!selectedCourse) {
      alert("Please select a course first");
      return;
    }
    setIsActive(true);
    setSessionStartTime(new Date());
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration * 60);
    setSessionStartTime(null);
  };

  const completeSession = () => {
    if (sessionStartTime && selectedCourse) {
      const session = {
        courseId: parseInt(selectedCourse),
        date: sessionStartTime.toISOString(),
        duration: duration,
        notes: `${duration} minute study session`
      };
      onSessionComplete(session);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  const courseOptions = [
    { value: "", label: "Select a course" },
    ...courses.map(course => ({ value: course.Id.toString(), label: course.name }))
  ];

  const durationOptions = [
    { value: "15", label: "15 minutes" },
    { value: "25", label: "25 minutes (Pomodoro)" },
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "60 minutes" }
  ];

  return (
    <Card className={`p-8 text-center ${isActive ? 'study-timer-glow' : ''}`}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-2">Study Timer</h2>
          <p className="text-gray-600">Focus and track your study sessions</p>
        </div>

        <div className="relative w-48 h-48 mx-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#E5E7EB"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#progress-gradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div>
              <div className="text-3xl font-bold gradient-text mb-1">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500">
                {isActive ? "Active" : "Paused"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FilterSelect
            label="Course"
            value={selectedCourse}
            onChange={setSelectedCourse}
            options={courseOptions}
          />
          <FilterSelect
            label="Duration"
            value={duration.toString()}
            onChange={(value) => {
              setDuration(parseInt(value));
              if (!isActive) {
                setTimeLeft(parseInt(value) * 60);
              }
            }}
            options={durationOptions}
          />
        </div>

        <div className="flex justify-center space-x-4">
          {!isActive ? (
            <Button onClick={startTimer} size="lg">
              <ApperIcon name="Play" className="w-5 h-5" />
              Start
            </Button>
          ) : (
            <Button onClick={pauseTimer} variant="secondary" size="lg">
              <ApperIcon name="Pause" className="w-5 h-5" />
              Pause
            </Button>
          )}
          <Button onClick={resetTimer} variant="outline" size="lg">
            <ApperIcon name="RotateCcw" className="w-5 h-5" />
            Reset
          </Button>
        </div>

        {isActive && selectedCourse && (
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-primary-700">
              <ApperIcon name="BookOpen" className="w-4 h-4" />
              <span className="font-medium">
                Studying: {courses.find(c => c.Id.toString() === selectedCourse)?.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StudyTimer;