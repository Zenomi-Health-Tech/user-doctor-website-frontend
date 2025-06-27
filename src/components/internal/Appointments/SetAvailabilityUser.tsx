import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '@/utils/api';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';




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
  const [loading] = useState(false);
  const [allSlots] = useState<{ date: string; slots: string[] }[]>([]);

  const selectedDateUTC = selectedDate.toISOString().split('T')[0];



  useEffect(() => {
    const fetchSlots = async () => {
      const authCookie = Cookies.get("auth");
      let token = "";
      if (authCookie) try { token = JSON.parse(authCookie).token; } catch {}
      const res = await api.get("/users/get-user-available-slots", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(res);
      
      setDoctors(res.data.data || []);
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

    const preferredDate = selectedDateUTC;
    const preferredTimeSlot = slot.startTime.slice(11, 16);

    const authCookie = Cookies.get("auth");
    let token = "";
    if (authCookie) try { token = JSON.parse(authCookie).token; } catch {}
    await api.post("/users/book-appointment", {
      doctorId: doctor.doctorId,
      preferredDate,
      preferredTimeSlot
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  if (!doctors.length) {
    return <div className="p-8">Loading doctor info...</div>;
  }

  // Doctor Card UI
  const doctor = doctors[0];
  const initials = doctor.doctorName.split(' ').map(n => n[0]).join('').toUpperCase();
  const truncatedSpec = doctor.specialization.length > 22 ? doctor.specialization.slice(0, 20) + '..' : doctor.specialization;

  return (
    <div className="w-full p-0 m-0 font-['Poppins'] min-h-[600px]">
      <div className="p-8 w-full">
        {/* Doctor Card at the top */}
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
              {/* <div className="flex border-b mb-4">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 text-base font-medium focus:outline-none transition border-b-2 ${activeTab === tab ? 'border-[#8B2D6C] text-[#8B2D6C]' : 'border-transparent text-gray-500'}`}
                    onClick={() => setActiveTab(tab)}
                    type="button"
                  >
                    {tab}
                  </button>
                ))}
              </div> */}
              {(() => {
                const doctor = doctors[0];
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
              })()}
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
        {/* All Available Slots Section - full width */}
        <div className="w-full mt-8">
          <div className="bg-white rounded-2xl p-8 shadow flex flex-col gap-6">
            <h3 className="text-2xl font-bold mb-2">All Available Slots</h3>
            {allSlots.length === 0 ? (
              <p className="text-gray-500">No slots found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allSlots.map((slotDay) => (
                  <div key={slotDay.date} className="border rounded-xl p-4 bg-[#FAF8FB]">
                    <div className="font-semibold text-[#8B2D6C] mb-2">
                      {new Date(slotDay.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(slotDay.slots || []).map((slot, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-3 py-1 rounded-full bg-[#8B2D6C1A] text-[#8B2D6C] text-sm"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}