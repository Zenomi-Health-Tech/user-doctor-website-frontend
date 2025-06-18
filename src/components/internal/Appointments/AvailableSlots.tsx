import api from '@/utils/api';
import { useState } from 'react';
import Cookies from 'js-cookie';

export default function AvailableSlots() {
  // ...existing state
  const [allSlots, setAllSlots] = useState<{ date: string; timeSlots: { startTime: string; endTime: string }[] }[]>([]);
  const [showAllSlots, setShowAllSlots] = useState(false);

  // ...existing code

  const handleShowAllSlots = async () => {
    setShowAllSlots(true);
    const authCookie = Cookies.get('auth');
    let token = '';
    if (authCookie) {
      try {
        token = JSON.parse(authCookie).token;
      } catch (e) {
        token = '';
      }
    }
    const response = await api.get('/doctors/availability/all-slots', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(response.data);
    
    setAllSlots(response.data.data || []);
  };

  return (
    <div className="p-8 bg-[#FAF8FB] min-h-screen font-['Poppins']">
      {/* ...existing UI */}
      <button
        className="mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#C6426E] text-white font-semibold"
        onClick={handleShowAllSlots}
        type="button"
      >
        Show All Slots
      </button>
      {showAllSlots && (
        <div className="bg-white rounded-xl p-4 shadow mb-6">
          <h3 className="text-lg font-bold mb-2">All Available Slots</h3>
          {allSlots.length === 0 ? (
            <p>No slots found.</p>
          ) : (
            <ul className="space-y-2">
              {allSlots.map((slotDay) => (
                <li key={slotDay.date}>
                  <div className="font-semibold">{slotDay.date}</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {slotDay.timeSlots.map((slot, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-3 py-1 rounded-full bg-[#8B2D6C1A] text-[#8B2D6C] text-sm"
                      >
                        {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {/* ...rest of your UI */}
    </div>
  );
}