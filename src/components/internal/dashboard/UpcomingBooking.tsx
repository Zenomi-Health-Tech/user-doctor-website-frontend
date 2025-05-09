import React, { useEffect, useState } from 'react';
import api from '@/utils/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AxiosError } from 'axios';

type Appointment = {
  patientId: string;
  patientName: string;
  patientPhoneNumber: string;
  patientEmail: string;
  patientAppointmentDate: string;
  patientAppointmentType: string;
  patientAppointmentTime: string | null;
};

const AppointmentsTable: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetching the appointments data from the API using axios (with bearer token)
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/hospital/dashboard/getUpcomingAppointments');
        const data = response.data;

        if (data.success) {
          setAppointments(data.data);
        } else {
          setError('Failed to fetch appointments');
        }
      } catch (err) {
        if (err instanceof AxiosError) {
          setError('An error occurred while fetching appointments');
        } else {
          setError('Unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <>
      <h1 className='text-[#013DC0] p-4 text-xl'>Upcoming Bookings</h1>
      <div className='border border-[#E8F1FD] rounded-xl'>

        <Table>
          <TableHeader className="bg-[#E9F4FF]">
            <TableRow>
              <TableHead>Serial No.</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Appointment Date</TableHead>
              <TableHead>Appointment Type</TableHead>
              <TableHead>Appointment Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment, index) => (
              <TableRow key={appointment.patientId}>
                <TableCell>{index + 1}.</TableCell> {/* Serial number (1-based index) */}
                <TableCell>{appointment.patientName}</TableCell>
                <TableCell>{appointment.patientPhoneNumber}</TableCell>
                <TableCell>{appointment.patientEmail}</TableCell>
                <TableCell>{new Date(appointment.patientAppointmentDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge
                    className={`${appointment.patientAppointmentType === 'ONLINE'
                      ? 'bg-[#FEECEB] text-[#F36960] rounded-full' // Custom colors for ONLINE
                      : 'bg-[#E7F8F0] text-[#41C588]' // Custom colors for OFFLINE
                      } px-4 py-1 rounded-full`}
                  >
                    {appointment.patientAppointmentType}
                  </Badge>
                </TableCell>
                <TableCell>{appointment.patientAppointmentTime ?? 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div></>
  );
};

export default AppointmentsTable;
