import { Navigate } from "react-router-dom";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // Optional: Show loader if you plan to validate token asynchronously
  // For now, we just check localStorage
  if (token === null) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
