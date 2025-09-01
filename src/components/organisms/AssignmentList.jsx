import { useState } from "react";
import { format } from "date-fns";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import FilterSelect from "@/components/molecules/FilterSelect";

const AssignmentList = ({ assignments, courses, onEdit, onDelete, onToggleStatus }) => {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");

  const statusOptions = [
    { value: "all", label: "All Assignments" },
    { value: "pending", label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" }
  ];

  const sortOptions = [
    { value: "dueDate", label: "Due Date" },
    { value: "priority", label: "Priority" },
    { value: "status", label: "Status" }
  ];

  const filteredAssignments = assignments
    .filter(assignment => filter === "all" || assignment.status === filter)
    .sort((a, b) => {
      if (sortBy === "dueDate") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.status.localeCompare(b.status);
    });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "success";
      default: return "gray";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "success";
      case "in-progress": return "warning";
      case "pending": return "gray";
      default: return "gray";
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCourse = (courseId) => {
    return courses.find(course => course.Id === courseId);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <FilterSelect
          label="Filter by Status"
          value={filter}
          onChange={setFilter}
          options={statusOptions}
          className="sm:w-48"
        />
        <FilterSelect
          label="Sort by"
          value={sortBy}
          onChange={setSortBy}
          options={sortOptions}
          className="sm:w-48"
        />
      </div>

      <div className="space-y-4">
        {filteredAssignments.map((assignment) => {
          const course = getCourse(assignment.courseId);
          const daysUntilDue = getDaysUntilDue(assignment.dueDate);
          const isOverdue = daysUntilDue < 0;
          const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

          return (
            <Card key={assignment.Id} className="p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleStatus(assignment.Id)}
                      className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        assignment.status === "completed"
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300 hover:border-green-500"
                      }`}
                    >
                      {assignment.status === "completed" && (
                        <ApperIcon name="Check" className="w-3 h-3 text-white" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${
                        assignment.status === "completed" ? "line-through text-gray-500" : "text-gray-900"
                      }`}>
                        {assignment.title}
                      </h3>
                      
                      {course && (
                        <p className="text-sm text-gray-600 mb-2">
                          {course.name} ({course.code})
                        </p>
                      )}
                      
                      {assignment.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {assignment.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Calendar" className="w-4 h-4 text-gray-400" />
                          <span className={isOverdue ? "text-red-600 font-medium" : "text-gray-600"}>
                            Due {format(new Date(assignment.dueDate), "MMM d, yyyy")}
                          </span>
                          {isOverdue && (
                            <Badge variant="danger">Overdue</Badge>
                          )}
                          {isDueSoon && !isOverdue && (
                            <Badge variant="warning">Due Soon</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between lg:justify-end gap-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(assignment.priority)}>
                      {assignment.priority}
                    </Badge>
                    <Badge variant={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                    {assignment.grade && (
                      <Badge variant="info">{assignment.grade}%</Badge>
                    )}
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(assignment)}
                      className="p-2"
                    >
                      <ApperIcon name="Edit2" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(assignment.Id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentList;