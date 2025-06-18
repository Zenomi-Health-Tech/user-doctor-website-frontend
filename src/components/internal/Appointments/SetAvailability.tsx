import  { useState } from 'react';
import Cookies from 'js-cookie';
import api from '@/utils/api';

const TIME_SLOTS = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM',
  '12:30 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
];

function getISODate(date: Date, time: string) {
  // Converts "10:00 AM" to ISO string for the selected date
  const [hourMin, period] = time.split(' ');
  let [hour, min] = hourMin.split(':').map(Number);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  const d = new Date(date);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

function getEndISODate(date: Date, time: string, minutesToAdd: number) {
  const [hourMin, period] = time.split(' ');
  let [hour, min] = hourMin.split(':').map(Number);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  const d = new Date(date);
  d.setHours(hour, min + minutesToAdd, 0, 0);
  return d.toISOString();
}

export default function SetAvailability() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  

  const handleSlotClick = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    const authCookie = Cookies.get('auth');
    let token = '';
    if (authCookie) {
      try {
        token = JSON.parse(authCookie).token;
      } catch (e) {
        token = '';
      }
    }
    const timeSlots = selectedSlots.map((slot) => ({
      startTime: getISODate(selectedDate, slot),
      endTime: getEndISODate(selectedDate, slot, 30), // 30 minutes slot
    }));
    await api.post(
      '/doctors/availability',
      {
        date: selectedDate.toISOString().split('T')[0],
        timeSlots,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setLoading(false);
    // Optionally show a success message or redirect
  };

  return (
    <div className="p-8 bg-[#FAF8FB] min-h-screen font-['Poppins']">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Set Availability</h1>
      <div className="bg-white rounded-2xl p-6 shadow-md w-full max-w-lg mx-auto">
        {/* Calendar */}
        <div className="mb-6">
          <input
            type="date"
            className="text-lg font-semibold mb-2"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
        </div>
        {/* Slots */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Slots Available</h2>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                className={`py-2 rounded-full border ${
                  selectedSlots.includes(slot)
                    ? 'bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                onClick={() => handleSlotClick(slot)}
                type="button"
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
        <button
          className="w-full py-3 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white font-semibold text-lg"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Setting...' : 'Set Availability'}
        </button>
      </div>
    </div>
  );
}