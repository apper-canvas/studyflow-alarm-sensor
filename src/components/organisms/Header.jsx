import React, { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { AuthContext } from "@/App";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";

const Header = ({ onMenuToggle, title = "Dashboard" }) => {
  const [notifications] = useState([
    { id: 1, message: "Assignment due tomorrow", type: "warning" },
    { id: 2, message: "New grade posted", type: "info" },
  ]);

  const { logout } = useContext(AuthContext);
  const { user } = useSelector((state) => state.user);
  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
    <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <Button
                variant="ghost"
                size="sm"
                onClick={onMenuToggle}
                className="lg:hidden p-2">
                <ApperIcon name="Menu" className="w-5 h-5" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-500">Manage your academic life efficiently</p>
            </div>
        </div>
        <div className="flex items-center space-x-4">
            <SearchBar
                placeholder="Search courses, assignments..."
                className="hidden md:block w-64" />
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="relative p-2">
                    <ApperIcon name="Bell" className="w-5 h-5" />
                    {notifications.length > 0 && <span
                        className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.length}
                    </span>}
                </Button>
<Button variant="ghost" size="sm" className="p-2">
                    <ApperIcon name="Settings" className="w-5 h-5" />
                </Button>
                {user && (
                    <Button variant="ghost" size="sm" onClick={logout} className="p-2" title="Logout">
                        <ApperIcon name="LogOut" className="w-5 h-5" />
                    </Button>
                )}
            </div>
        </div>
    </div></header>
  );
};

export default Header;