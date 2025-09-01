import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const Empty = ({ 
  title = "No data found", 
  message = "Get started by adding your first item.", 
  actionLabel = "Add Item",
  onAction,
  icon = "Package"
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="p-8 text-center max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <ApperIcon name={icon} className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {onAction && (
          <Button onClick={onAction} variant="primary">
            <ApperIcon name="Plus" className="w-4 h-4" />
            {actionLabel}
          </Button>
        )}
      </Card>
    </div>
  );
};

export default Empty;