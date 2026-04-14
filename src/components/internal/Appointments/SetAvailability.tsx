import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '@/utils/api';
import { useNavigate } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const TIME_SLOTS = {
  Morning: ['06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
  Afternoon: ['12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'],
  Evening: ['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM'],
};

const TABS = ['Morning', 'Afternoon', 'Evening'] as const;
type TabType = typeof TABS[number];

function toLocalISOString(date: Date) {
  // Returns YYYY-MM-DDTHH:mm:ss (no Z, so it's local time)
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':00'
  );
}

function getISODate(date: Date, time: string) {
  const [hourMin, period] = time.split(' ');
  let [hour, min] = hourMin.split(':').map(Number);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  const d = new Date(date);
  d.setHours(hour, min, 0, 0);
  return toLocalISOString(d);
}

function getEndISODate(date: Date, time: string, minutesToAdd: number) {
  const [hourMin, period] = time.split(' ');
  let [hour, min] = hourMin.split(':').map(Number);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  const d = new Date(date);
  d.setHours(hour, min + minutesToAdd, 0, 0);
  return toLocalISOString(d);
}

export default function SetAvailability() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('Morning');
  const router = useNavigate();
  const { toast } = useToast();
  const [allSlots, setAllSlots] = useState<{ date: string; timeSlots: { startTime: string; endTime: string }[] }[]>([]);

  useEffect(() => {
    const fetchAllSlots = async () => {
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
      const mappedSlots = (response.data.data || []).map((item: any) => ({
        date: item.availability,
        timeSlots: item.doctorAvailabilityTimeSlot || [],
      }));
      setAllSlots(mappedSlots);
    };
    fetchAllSlots();
  }, []);

  const isSlotPast = (slot: string): boolean => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (selectedDate.getTime() > today.getTime()) return false;
    if (selectedDate.getTime() < today.getTime()) return true;
    // Same day — check time
    const [hourMin, period] = slot.split(' ');
    let [hour, min] = hourMin.split(':').map(Number);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    const slotTime = new Date(selectedDate);
    slotTime.setHours(hour, min, 0, 0);
    return slotTime <= now;
  };

  const getAvailableSlots = (tab: TabType): string[] => {
    return TIME_SLOTS[tab].filter((slot) => !isSlotPast(slot));
  };

  const handleSelectAll = (tab: TabType) => {
    const available = getAvailableSlots(tab);
    const allSelected = available.every((s) => selectedSlots.includes(s));
    if (allSelected) {
      setSelectedSlots((prev) => prev.filter((s) => !available.includes(s)));
    } else {
      setSelectedSlots((prev) => [...new Set([...prev, ...available])]);
    }
  };

  const handleSlotClick = (slot: string) => {
    if (isSlotPast(slot)) return;
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
      endTime: getEndISODate(selectedDate, slot, 30),
    }));
    // Use selectedDate as YYYY-MM-DD (local, not UTC)
    const pad = (n: number) => n.toString().padStart(2, '0');
    const localDateString = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
    try {
      const response = await api.post(
        '/doctors/availability',
        {
          date: localDateString,
          timeSlots,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && response.data.success) {
        toast({
            title: "Success",
            description: "Slot selected Successfully!",
            variant: "default",
            className: "bg-green-500 text-white",
        });
        setSelectedSlots([]);
        router(-1);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set availability.',
        variant: "default",
        className: "bg-red-500 text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full  p-0 m-0 font-['Poppins'] min-h-[600px]">
      <div className="p-8 w-full">
        <h1 className="text-2xl md:text-3xl font-semibold mb-8 text-gray-800">Set Availability</h1>
        <div className="flex flex-col items-center w-full">
          {/* Calendar and Slots Card - full width, centered */}
          <div className="bg-white rounded-2xl p-6 shadow-md w-full max-w-2xl flex flex-col items-center mx-auto">
            <div className="mb-6 w-full flex flex-col items-center">
              <div className="text-lg font-semibold mb-2">{selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
              <DayPicker
                mode="single"
                selected={selectedDate}
                disabled={{ before: new Date() }}
                onSelect={(date) => {
                  if (date) {
                    // Always set time to midnight to avoid time drift
                    const cleanDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                    setSelectedDate(cleanDate);
                  }
                }}
                className="rounded-xl shadow-sm border"
                styles={{
                  caption: { color: '#1A2343', fontWeight: 600 },
                  day_selected: { background: 'linear-gradient(90deg, #8B2D6C 0%, #704180 100%)', color: 'white' },
                  day: { borderRadius: '9999px', fontWeight: 500 },
                }}
              />
            </div>
            {/* Slots Section */}
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-4">Slots Available</h2>
              <div className="flex border-b mb-4">
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
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {getAvailableSlots(activeTab).length === 0 ? (
                  <p className="text-gray-400 col-span-3 text-center py-4">No available slots</p>
                ) : (
                  getAvailableSlots(activeTab).map((slot: string) => (
                    <button
                      key={slot}
                      className={`py-2 rounded-full border w-full ${
                        selectedSlots.includes(slot)
                          ? 'bg-gradient-to-r from-[#8B2D6C] to-[#704180] text-white border-none'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                      onClick={() => handleSlotClick(slot)}
                      type="button"
                    >
                      {slot}
                    </button>
                  ))
                )}
              </div>
              {getAvailableSlots(activeTab).length > 0 && (
                <div className="flex justify-end mb-4">
                  <button
                    type="button"
                    onClick={() => handleSelectAll(activeTab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                      getAvailableSlots(activeTab).every((s) => selectedSlots.includes(s))
                        ? 'bg-[#8B2D6C] text-white'
                        : 'bg-[#8B2D6C1A] text-[#8B2D6C]'
                    }`}
                  >
                    {getAvailableSlots(activeTab).every((s) => selectedSlots.includes(s)) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              )}
              <button
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#8B2D6C] to-[#704180] text-white font-semibold text-lg shadow hover:opacity-90 transition"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Setting...' : 'Set Availability'}
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
                      {(slotDay.timeSlots || []).map((slot, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-3 py-1 rounded-full bg-[#8B2D6C1A] text-[#8B2D6C] text-sm"
                        >
                          {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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