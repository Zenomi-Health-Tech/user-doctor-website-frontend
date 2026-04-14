// ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  element: JSX.Element;
  isPublic?: boolean;
  alreadyLoggedInRedirect?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, isPublic, alreadyLoggedInRedirect }) => {
  const { isAuthenticated } = useAuth();

  if (isPublic && isAuthenticated) {
    return <Navigate to={alreadyLoggedInRedirect || "/"} replace />;
  }

  if (!isPublic && !isAuthenticated) {
    return <Navigate to="/chooserole" replace />;
  }

  return element;
};
