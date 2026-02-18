import { Navigate } from "react-router-dom";
import AdminDashboard from "../pages/admin/adminDashboard";
import AuthorDashboard from "../pages/author/authorDashboard";
import EditorDashboard from "../pages/editor/editorDashboard";
import UserDashboard from "../pages/users/userDashboard";

const UnifiedDashboard = () => {
    // For now, we'll read from localStorage as per existing pattern in Login/App
    const role = localStorage.getItem("role") || sessionStorage.getItem("role");


    switch (role) {
        case "admin":
            return <AdminDashboard />;
        case "author":
            return <AuthorDashboard />;
        case "editor":
            return <EditorDashboard />;
        case "user":
            return <UserDashboard />;
        default:
            // If no role or invalid role, redirect to login
            return <Navigate to="/login" replace />;
    }
};

export default UnifiedDashboard;
