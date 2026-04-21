import { Suspense, lazy, useEffect, useState } from "react";
import { Navigate, Outlet, useRoutes } from "react-router-dom";
import HomeLayout from "@/components/layout/HomeLayout";

function SuspenseLoader() {
  const [animData, setAnimData] = useState<any>(null);
  useEffect(() => { import('lottie-react').catch(() => {}); fetch('/meditation.json').then(r => r.json()).then(setAnimData).catch(() => {}); }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      {animData ? (() => { try { const Lottie = require('lottie-react').default; return <Lottie animationData={animData} loop style={{ height: 180 }} />; } catch { return null; } })() : (
        <div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-4 border-[#F0EBF4]" /><div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#8B2D6C] animate-spin" /></div>
      )}
    </div>
  );
}
import { ProtectedRoute } from "./ProtectedRoute";


const NotFound = lazy(() => import("@/pages/NotFound"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Results = lazy(() => import("@/pages/Results"));
const Patients = lazy(() => import("@/pages/Patients"));
const Appointments = lazy(() => import("@/pages/Appointments"));
const Profile = lazy(() => import("@/pages/Profile"));
const Notifications = lazy(() => import("@/pages/Notification"));
const Settings = lazy(() => import("@/pages/Setting"));
const Support = lazy(() => import("@/pages/Support"));
const LoginScreen = lazy(() => import("@/components/internal/Auth/DoctorLogin/login/loginScreen"));
const UserLoginScreen = lazy(() => import("@/components/internal/Auth/LoginUser/login/loginScreen"));
const ChooseRole = lazy(() => import("@/components/internal/Auth/ChooseRole/page"));
const RegisterScreen = lazy(() => import("@/components/internal/Auth/DoctorRegister/DoctorRegisterScreen"));
const UseregisterScreen = lazy(() => import("@/components/internal/Auth/UserRegister/RegisterScreen"));
const PatientDetails = lazy(() => import("@/components/internal/Patients/PatientDetails"));
const PaymentOnboard = lazy(() => import("@/components/internal/Auth/PaymentOnboard/PaymentOnboard"));
const ReferredPatients = lazy(() => import("@/components/internal/ReferredPatients/ReferredPatients"));
const SetAvailability = lazy(() => import("@/components/internal/Appointments/SetAvailability"));
const SetAvailabilityUser = lazy(() => import("@/components/internal/Appointments/SetAvailabilityUser"));
const AvailableSlotsPage = lazy(() => import("@/components/internal/Appointments/AvailableSlots"));
const SleepTracker = lazy(() => import("@/pages/SleepTracker"));


export default function AppRouter() {
  // Only wrap dashboard and other main pages in HomeLayout
  const privateRoutes = [
    {
      path: "/",
      element: (
        <ProtectedRoute
          element={
            <HomeLayout>
              <Suspense fallback={<SuspenseLoader />}>
                <Outlet />
              </Suspense>
            </HomeLayout>
          }
        />
      ),
      children: [
        {
          element: <Dashboard />,
          index: true,
        },
        {
          path: "/dashboard",
          element: <Dashboard />,
        },
        {
          path: "/results",
          element: <Results />,
        },
        {
          path: "/patients",
          children: [
            {
              index: true,
              element: <Patients />,
            },
            {
              path: ":id",
              element: <PatientDetails />,
            },
          ],
        },
        {
          path: "/appointments",
          element: <Appointments />,
        },
        {
          path: "/appointments/set-availability",
          element: <SetAvailability />,
        },
        {
          path: "/appointments/set-availability-user",
          element: <SetAvailabilityUser />,
        },
        {
          path: "/appointments/doctor/:doctorId",
          element: <SetAvailabilityUser />,
        },
        {
          path: "/appointments/available-slots",
          element: <AvailableSlotsPage />,
        },
        {
          path: "/referred-patients",
          element: <ReferredPatients />,
        },
        {
          path: "/sleep-tracker",
          element: <SleepTracker />,
        },
        {
          path: "/sleep-tracker",
          element: <ProtectedRoute element={<SleepTracker />} />,
        },
        {
          path: "/profile",
          element: <Profile />,
        },
        {
          path: "/notifications",
          element: <Notifications />,
        },
        {
          path: "/settings",
          element: <Settings />,
        },
        {
          path: "/support",
          element: <Support />,
        },
      ],
    },
  ];

  // Public routes (no layout)
  const publicRoutes = [
    {
      path: "/404",
      element: <Suspense fallback={<SuspenseLoader />}>
        <NotFound />
      </Suspense>,
    },
    {
      path: "/doctor/register",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <RegisterScreen />
        </Suspense>
      ),
    },
    {
      path: "/user/register",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <UseregisterScreen />
        </Suspense>
      ),
    },
    {
      path: "/doctor/login",
      element: (
        <ProtectedRoute
          element={
            <Suspense fallback={<SuspenseLoader />}>
              <LoginScreen />
            </Suspense>
          }
          isPublic
          alreadyLoggedInRedirect="/dashboard"
        />
      ),
    },
    
    {
      path: "/login",
      element: (
        <ProtectedRoute
          element={
            <Suspense fallback={<SuspenseLoader />}>
              <UserLoginScreen />
            </Suspense>
          }
          isPublic
          alreadyLoggedInRedirect="/dashboard"
        />
      ),
    },
    {
      path: "/chooserole",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <ChooseRole />
        </Suspense>
      ),
    },
    {
      path: "/doctor/payment-onboard",
      element: (
        // <ProtectedRoute
          // element={
            <Suspense fallback={<SuspenseLoader />}>
              <PaymentOnboard />
            </Suspense>
          // }
        
        // />
      ),
    },
    {
      path: "*",
      element: <Navigate to="/404" replace />,
    },
  ];

  const routes = useRoutes([...publicRoutes, ...privateRoutes]);
  return routes;
}
