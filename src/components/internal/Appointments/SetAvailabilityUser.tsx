import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';




type Slot = {
  id: string;
  startTime: string; // ISO
  endTime: string;   // ISO
};
type Availability = {
  date: string; // ISO
  timeSlots: Slot[];
};
type Doctor = {
  doctorId: string;
  doctorName: string;
  specialization: string;
  photoUrl?: string;
  consultationFee: number;
  availabilities: Availability[];
};


export default function SetAvailabilityUser() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const selectedDateUTC = selectedDate.toISOString().split('T')[0];



  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await api.get("/users/get-user-available-slots");
        setDoctors(res.data.data || []);
      } catch (e) {
        console.error("Failed to fetch slots", e);
      }
    };
    fetchSlots();
  }, []);



  const handleBook = async () => {
    if (!selectedSlot) return;
    const doctor = doctors[0];
    const availability = doctor.availabilities.find(a =>
      a.date.split('T')[0] === selectedDateUTC
    );
    if (!availability) return;
    const slot = availability.timeSlots.find(s => s.id === selectedSlot);
    if (!slot) return;

    setLoading(true);
    try {
      const preferredDate = selectedDateUTC;
      const preferredTimeSlot = slot.startTime.slice(11, 16);
      await api.post("/users/book-appointment", {
        doctorId: doctor.doctorId,
        preferredDate,
        preferredTimeSlot
      });
      toast({ title: "Success", description: "Appointment booked!", variant: "default", className: "bg-green-500 text-white" });
      navigate('/appointments');
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Booking failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Doctor Card UI
  const doctor = doctors[0];
  const initials = doctor?.doctorName?.split(' ').map(n => n[0]).join('').toUpperCase() || '';
  const truncatedSpec = doctor?.specialization?.length > 22 ? doctor.specialization.slice(0, 20) + '..' : doctor?.specialization || '';

  return (
    <div className="w-full p-0 m-0 font-['Poppins'] min-h-[600px]">
      <div className="p-8 w-full">
        {/* Doctor Card at the top (if doctor data exists) */}
        {doctor ? (
        <div className="flex items-center bg-white rounded-2xl border border-[#E5E5E5] p-4 mb-8 shadow-sm max-w-md">
          {doctor.photoUrl ? (
            <img src={doctor.photoUrl} alt={doctor.doctorName} className="w-14 h-14 rounded-xl object-cover bg-[#F8F2F9] mr-4" />
          ) : (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#F8F2F9] text-[#8B2D6C] text-xl font-bold mr-4">
              {initials}
            </div>
          )}
          <div>
            <div className="font-bold text-lg text-black">Dr.{doctor.doctorName}</div>
            <div className="text-sm text-gray-700">Specialist in {truncatedSpec}</div>
          </div>
        </div>
        ) : (
          <div className="w-full flex justify-center py-8">
            <div className="flex items-center bg-white rounded-2xl border border-[#E5E5E5] p-4 mb-8 shadow-sm max-w-md w-full">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#F8F2F9] text-[#8B2D6C] text-xl font-bold mr-4">
                --
              </div>
              <div>
                <div className="font-bold text-lg text-black">No Doctor Available</div>
                <div className="text-sm text-gray-700">No specialization info</div>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center w-full">
          {/* Calendar and Slots Card - full width, centered */}
          <div className="bg-white rounded-2xl p-6 shadow-md w-full max-w-2xl flex flex-col items-center mx-auto">
            <div className="mb-6 w-full flex flex-col items-center">
              <div className="text-lg font-semibold mb-2">{selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    // Always set time to midnight UTC
                    const cleanDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                    setSelectedDate(cleanDate);
                  }
                }}
                className="rounded-xl shadow-sm border"
                styles={{
                  caption: { color: '#1A2343', fontWeight: 600 },
                  day_selected: { background: 'linear-gradient(90deg, #8B2D6C 0%, #C6426E 100%)', color: 'white' },
                  day: { borderRadius: '9999px', fontWeight: 500 },
                }}
              />
            </div>
            {/* Slots Section */}
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-4">Slots Available</h2>
              {doctor && doctor.availabilities ? (() => {
                const availability = doctor.availabilities.find(a =>
                  a.date.split('T')[0] === selectedDateUTC
                );
                if (!availability || !availability.timeSlots.length) {
                  return <div className="text-gray-500 mb-4">No slots available for this date.</div>;
                }
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    {availability.timeSlots.map((slot) => {
                      // Show slot time exactly as in backend (UTC HH:mm)
                      const slotTime = slot.startTime.slice(11, 16);
                      return (
                        <button
                          key={slot.id}
                          className={`py-2 rounded-full border w-full ${selectedSlot === slot.id ? 'bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white border-none' : 'bg-white text-gray-700 border-gray-300'}`}
                          onClick={() => setSelectedSlot(slot.id === selectedSlot ? null : slot.id)}
                          type="button"
                        >
                          {slotTime}
                        </button>
                      );
                    })}
                  </div>
                );
              })() : <div className="text-gray-500 mb-4">No slots available for this date.</div>}
              <button
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white font-semibold text-lg shadow hover:opacity-90 transition"
                onClick={handleBook}
                disabled={loading || !selectedSlot}
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}