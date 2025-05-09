// ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { getAuthCookies } from "@/utils/cookies"; // Import your cookie utility function

interface ProtectedRouteProps {
  element: JSX.Element;
  isPublic?: boolean; // Prop to determine if route is public
  alreadyLoggedInRedirect?: string; // Custom redirect if already logged in
}
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, isPublic, alreadyLoggedInRedirect }) => {
  const authUser = getAuthCookies();

  // If the user is already logged in and trying to access login/register, redirect to a different page
  if (authUser && authUser.token && isPublic) {
    return <Navigate to={alreadyLoggedInRedirect || "/"} replace />;
  }

  // Check if the route is public and user is authenticated, redirect to the dashboard
  if (isPublic && authUser && authUser.token) {
    return <Navigate to="/" replace />;
  }

  // Check if the user is authenticated for protected routes
  if (!isPublic && (!authUser || !authUser.token)) {
    return <Navigate to="/chooserole" replace />;
  }

  // If the user is allowed, render the requested element
  return element;
};
