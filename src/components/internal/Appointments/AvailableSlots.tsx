import api from '@/utils/api';
import { useState } from 'react';

export default function AvailableSlots() {
  const [allSlots, setAllSlots] = useState<{ date: string; timeSlots: { startTime: string; endTime: string }[] }[]>([]);
  const [showAllSlots, setShowAllSlots] = useState(false);

  const handleShowAllSlots = async () => {
    setShowAllSlots(true);
    const response = await api.get('/doctors/availability/all-slots');
    const mappedSlots = (response.data.data || []).map((item: any) => ({
      date: item.availability,
      timeSlots: item.doctorAvailabilityTimeSlot || [],
    }));
    setAllSlots(mappedSlots);
  };

  return (
    <div className="p-4 sm:p-8 bg-white min-h-screen font-['Poppins']">
      <button
        className="mb-4 px-5 py-2 rounded-full bg-[#8B2D6C] text-white font-semibold hover:opacity-90 transition"
        onClick={handleShowAllSlots}
        type="button"
      >
        Show All Slots
      </button>
      {showAllSlots && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-base font-bold text-[#8B2D6C] mb-3">All Available Slots</h3>
          {allSlots.length === 0 ? (
            <p className="text-[#888] text-sm">No slots found.</p>
          ) : (
            <ul className="space-y-3">
              {allSlots.map((slotDay) => (
                <li key={slotDay.date}>
                  <div className="font-semibold text-[#8B2D6C] text-sm">
                    {new Date(slotDay.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(slotDay.timeSlots || []).map((slot, idx) => (
                      <span key={idx} className="inline-block px-3 py-1 rounded-full bg-[#F8F2F9] text-[#8B2D6C] text-xs font-medium">
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
    </div>
  );
}
