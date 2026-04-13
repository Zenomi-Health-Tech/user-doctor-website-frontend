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
  console.log("[ProtectedRoute]", { isPublic, hasToken: !!authUser?.token, alreadyLoggedInRedirect, path: window.location.pathname });

  // If logged in and on a public route, redirect to dashboard
  if (isPublic && authUser && authUser.token) {
    return <Navigate to={alreadyLoggedInRedirect || "/dashboard"} replace />;
  }

  // If not logged in and on a private route, redirect to chooserole
  if (!isPublic && (!authUser || !authUser.token)) {
    return <Navigate to="/chooserole" replace />;
  }

  return element;
};
