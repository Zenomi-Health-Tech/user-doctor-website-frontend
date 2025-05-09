import { Suspense, lazy } from "react";
import { Navigate, Outlet, useRoutes } from "react-router-dom";
import HomeLayout from "@/components/layout/HomeLayout";
import { ProtectedRoute } from "./ProtectedRoute";


const NotFound = lazy(() => import("@/pages/NotFound"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const LoginScreen = lazy(() => import("@/components/internal/Auth/DoctorLogin/login/loginScreen"));
const UserLoginScreen = lazy(() => import("@/components/internal/Auth/LoginUser/login/loginScreen"));
const ChooseRole = lazy(() => import("@/components/internal/Auth/ChooseRole/page"));
const OTPComponent = lazy(() => import("@/components/internal/Auth/DoctorLogin/otp/otpScreen"));
const UserOTPComponent = lazy(() => import("@/components/internal/Auth/LoginUser/otp/otpScreen"));
const RegisterScreen = lazy(() => import("@/components/internal/Auth/DoctorRegister/DoctorRegisterScreen"));
const UseregisterScreen = lazy(() => import("@/components/internal/Auth/UserRegister/RegisterScreen"));


export default function AppRouter() {
  const privateRoutes = [
    {
      path: "/",
      element: (
        <HomeLayout>
          <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
          </Suspense>
        </HomeLayout>
      ),
      children: [
        {
          element: <ProtectedRoute element={<Dashboard />} />,
          index: true,
        },
        {
          path: "/dashboard",
          element: <ProtectedRoute element={<Dashboard />} />,
        },
      ],
    },
  ];

  const publicRoutes = [
    {
      path: "/404",
      element: <Suspense fallback={<div>Loading...</div>}>
        <NotFound />
      </Suspense>,
    },
    {
      path: "/doctor/register",
      element: (
        <ProtectedRoute
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <RegisterScreen />
            </Suspense>
          }
          isPublic
          alreadyLoggedInRedirect="/dashboard"
        />
      ),
    },
    {
      path: "/user/register",
      element: (
        <ProtectedRoute
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <UseregisterScreen />
            </Suspense>
          }
          isPublic
          alreadyLoggedInRedirect="/dashboard"
        />
      ),
    },
    {
      path: "/doctor/login",
      element: (
        <ProtectedRoute
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <LoginScreen />
            </Suspense>
          }
          isPublic
          // alreadyLoggedInRedirect="/dashboard"
        />
      ),
    },
    {
      path: "/login",
      element: (
        <ProtectedRoute
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <UserLoginScreen />
            </Suspense>
          }
          isPublic
          // alreadyLoggedInRedirect="/dashboard"
        />
      ),
    },
    {
      path: "/chooserole",
      element: (
        <ProtectedRoute
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <ChooseRole />
            </Suspense>
          }
          isPublic
          // alreadyLoggedInRedirect="/dashboard"
        />
      ),
    },
    {
      path: "/login/otp",
      element: (
        <ProtectedRoute
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <OTPComponent />
            </Suspense>
          }
          isPublic
          alreadyLoggedInRedirect="/dashboard"
        />
      ),
    },
    {
      path: "/user/login/otp",
      element: (
        <ProtectedRoute
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <UserOTPComponent />
            </Suspense>
          }
          isPublic
          alreadyLoggedInRedirect="/dashboard"
        />
      ),
    },
    {
      path: "*",
      element: <Navigate to="/404" replace />,
    },
  ];

  const routes = useRoutes([...privateRoutes, ...publicRoutes]);
  return routes;
}
