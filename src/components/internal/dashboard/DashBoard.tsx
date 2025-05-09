import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import Overview from "./Overview";
import MonthlyRevenue from "./MonthlyRevenue";
import Departments from "./Departments";
import SkeletonLoader from "@/pages/common/SkeletionLoader";
import AppointmentsTable from "./UpcomingBooking";

type OverviewData = {
  totalPatients: number;
  admissionRate: string;
  ongoingCases: number;
};

type Revenue = {
  monthly: { month: string; revenue: number }[];
};

type Department = {
  name: string;
  patientCount: number;
  id: string;
};

type DashboardData = {
  overview: OverviewData;
  revenue: Revenue;
  departments: Department[];
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [todayData, setTodayData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'overall' | 'today'>('overall');

  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetching overall stats
        const overallResponse = await api.get("/hospital/dashboard");
        if (overallResponse.data.success) {
          setData(overallResponse.data.data);
        } else {
          throw new Error("Data retrieval unsuccessful");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (view === 'today') {
      const fetchTodayData = async () => {
        setLoading(true);
        try {
          const todayDate = getTodayDate();
          // Fetching today's stats
          const todayResponse = await api.get(`/hospital/dashboard/getStatsforDate?date=${todayDate}`);
          if (todayResponse.data.success) {
            setTodayData(todayResponse.data.data);
          } else {
            throw new Error("Today's data retrieval unsuccessful");
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("An unknown error occurred");
          }
        } finally {
          setLoading(false);
        }
      };

      fetchTodayData();
    }
  }, [view]);

  if (loading) {
    return <SkeletonLoader fullPage className="rounded-3xl" />;
  }

  if (error) {
    return <div className="text-center py-8 text-lg text-red-500">Error: {error}</div>;
  }

  const statsData = view === 'today' ? todayData : data;

  return (
    <div className="p-6">
      {/* Buttons for Stats View */}
      <div className="flex justify-end">
        <div className="flex items-center justify-center gap-4 mr-9 bg-[#E9F4FF] w-[345px] py-2 rounded-xl">
          <button
            onClick={() => setView('overall')}
            className={`px-4 py-2 rounded-xl font-semibold text-sm w-40 ${view === 'overall' ? 'bg-[#013DC0] text-white' : 'text-[#013DC0]'
              }`}
          >
            Overall Statistics
          </button>
          <button
            onClick={() => setView('today')}
            className={`px-4 py-2 rounded-xl w-40 font-semibold text-sm ${view === 'today' ? 'bg-[#013DC0] text-white' : 'text-[#013DC0]'
              }`}
          >
            Todays Statistics
          </button>
        </div>
      </div>
      {/* Overview Section */}
      <Overview
        totalPatients={statsData?.overview.totalPatients || 0}
        admissionRate={statsData?.overview.admissionRate || "0.00"}
        ongoingCases={statsData?.overview.ongoingCases || 0}
      />

      {/* Flex Row: Monthly Revenue and Departments */}
      <div className="flex flex-row justify-between p-4">
        <MonthlyRevenue monthly={statsData?.revenue.monthly || []} />
        <Departments departments={statsData?.departments || []} />
      </div>

      <div className="p-4">
        <AppointmentsTable />
      </div>
    </div>
  );
};

export default Dashboard;