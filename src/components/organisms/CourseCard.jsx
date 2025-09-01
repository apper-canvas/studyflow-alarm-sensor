import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const CourseCard = ({ course, onEdit, onDelete }) => {
  const colorClasses = {
    red: "border-l-red-500 bg-red-50",
    blue: "border-l-blue-500 bg-blue-50",
    green: "border-l-green-500 bg-green-50",
    purple: "border-l-purple-500 bg-purple-50",
    yellow: "border-l-yellow-500 bg-yellow-50",
    pink: "border-l-pink-500 bg-pink-50"
  };

  const textColorClasses = {
    red: "text-red-700",
    blue: "text-blue-700",
    green: "text-green-700",
    purple: "text-purple-700",
    yellow: "text-yellow-700",
    pink: "text-pink-700"
  };

  return (
    <Card className={`p-6 border-l-4 ${colorClasses[course.color]} transition-all duration-200 hover:shadow-lg hover:scale-[1.02]`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-lg font-bold ${textColorClasses[course.color]} mb-1`}>
            {course.name}
          </h3>
          <p className="text-sm text-gray-600 font-medium">{course.code}</p>
        </div>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(course)}
            className="p-2"
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(course.Id)}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ApperIcon name="User" className="w-4 h-4" />
          <span>{course.professor}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ApperIcon name="Clock" className="w-4 h-4" />
          <span>{course.schedule}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ApperIcon name="BookOpen" className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">{course.credits} credits</span>
          </div>
          <Badge variant="gray">{course.semester}</Badge>
        </div>
      </div>
    </Card>
  );
};

export default CourseCard;