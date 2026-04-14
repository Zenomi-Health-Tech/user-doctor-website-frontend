import { useState, useEffect, useMemo } from 'react';
import api from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, ChevronLeft } from 'lucide-react';
import LottieLoader from '@/components/shared/LottieLoader';

// ── Types ──

type Slot = { id?: string; slotTime: string; availableDate: string };
type DoctorDetail = {
  doctorId: string;
  doctorName: string;
  doctorPhoto: string;
  doctorHospital: string;
  doctorHospitalPhoto: string;
  areaOfSpecialization: string;
  experience: string;
  doctorRating: number;
  doctorCharges: number;
};

// ── Helpers ──

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function SetAvailabilityUser() {
  const { doctorId: paramDoctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [availability, setAvailability] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [consultationType, setConsultationType] = useState<0 | 1>(0); // 0=offline, 1=online
  const [pageLoading, setPageLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // Booking dialog
  const [showDialog, setShowDialog] = useState(false);
  const [description, setDescription] = useState('Routine check-up');
  const [symptoms, setSymptoms] = useState('');
  const [dialogBookingType, setDialogBookingType] = useState<'OFFLINE' | 'ONLINE'>('OFFLINE');

  const setDoctorAndSlots = (doctorData: DoctorDetail, slots: Slot[]) => {
    setDoctor(doctorData);
    setAvailability(slots);
    const dates = [...new Set(slots.map(s => s.availableDate.split('T')[0]))].sort();
    if (dates.length > 0) setSelectedDate(dates[0]);
  };

  const fetchGenericSlots = async () => {
    const { data } = await api.get('/users/get-user-available-slots');
    const docs = data.data || [];
    if (docs.length > 0) {
      const d = docs[0];
      const slots: Slot[] = [];
      (d.availabilities || []).forEach((a: any) => {
        (a.timeSlots || []).forEach((ts: any) => {
          slots.push({ id: ts.id, slotTime: ts.startTime?.slice(11, 16) || '', availableDate: a.date });
        });
      });
      setDoctorAndSlots({
        doctorId: d.doctorId, doctorName: d.doctorName, doctorPhoto: d.photoUrl || '',
        doctorHospital: d.hospitalName || '', doctorHospitalPhoto: d.hospitalPhoto || '',
        areaOfSpecialization: d.specialization || '', experience: d.experience || '',
        doctorRating: d.rating || 0, doctorCharges: d.consultationFee || 0,
      }, slots);
    }
  };

  // ── Fetch doctor details + availability ──
  useEffect(() => {
    (async () => {
      setPageLoading(true);
      try {
        if (paramDoctorId) {
          const { data } = await api.get(`/users/getDoctorDetailsWithAvailability/${paramDoctorId}`);
          if (data.doctor) {
            const slots: Slot[] = (data.availability || []).map((s: any) => ({
              slotTime: s.slotTime || '', availableDate: s.availableDate || '', id: s.id,
            }));
            setDoctorAndSlots(data.doctor, slots);
          } else {
            await fetchGenericSlots();
          }
        } else {
          await fetchGenericSlots();
        }
      } catch {
        try { await fetchGenericSlots(); } catch { /* empty */ }
      } finally {
        setPageLoading(false);
      }
    })();
  }, [paramDoctorId]);

  // ── Derived data ──
  const uniqueDates = useMemo(() => {
    const dates = [...new Set(availability.map(s => s.availableDate.split('T')[0]))].sort();
    return dates.map(d => {
      const dt = new Date(d + 'T00:00:00');
      return { dateStr: d, day: dt.getDate(), dayName: DAY_NAMES[dt.getDay()] };
    });
  }, [availability]);

  const slotsForDate = useMemo(() => {
    return availability
      .filter(s => s.availableDate.split('T')[0] === selectedDate)
      .sort((a, b) => a.slotTime.localeCompare(b.slotTime));
  }, [availability, selectedDate]);

  // Group slots by Morning / Afternoon / Evening
  const groupedSlots = useMemo(() => {
    const morning: Slot[] = [];
    const afternoon: Slot[] = [];
    const evening: Slot[] = [];
    for (const slot of slotsForDate) {
      const t = slot.slotTime; // "HH:mm" or "hh:mm AM"
      let hour = 0;
      if (t.includes(':')) {
        hour = parseInt(t.split(':')[0], 10);
        // Handle 12-hour format
        if (/pm/i.test(t) && hour !== 12) hour += 12;
        if (/am/i.test(t) && hour === 12) hour = 0;
      }
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    }
    return { morning, afternoon, evening };
  }, [slotsForDate]);

  // ── Book appointment ──
  const handleConfirmBooking = async () => {
    if (!selectedSlot || !doctor) return;
    setBooking(true);
    try {
      const bookingDateTime = `${selectedDate}T${selectedSlot.slotTime.includes(':') ? selectedSlot.slotTime : '00:00'}:00.000Z`;
      await api.post('/users/book-appointment', {
        doctorId: doctor.doctorId,
        bookingSlotTime: bookingDateTime,
        bookingSlotType: dialogBookingType,
        description,
        symptomsFullDescription: symptoms,
        preferredDate: selectedDate,
        preferredTimeSlot: selectedSlot.slotTime,
      });
      toast({ title: 'Success', description: 'Slot booked successfully', variant: 'default', className: 'bg-green-500 text-white' });
      setShowDialog(false);
      navigate('/appointments');
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Booking failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setBooking(false);
    }
  };

  // ── Loading ──
  if (pageLoading) return <LottieLoader text="Loading doctor availability..." />;

  // ── No availability ──
  const noSlots = availability.length === 0;

  return (
    <div className="min-h-screen font-['Poppins'] bg-white flex flex-col">
      {/* ── AppBar: "Doctor's Appointment" ── */}
      <div className="px-4 sm:px-6 py-4 flex items-center gap-3 border-b border-gray-100">
        <button onClick={() => navigate('/appointments')} className="p-1 hover:bg-gray-100 rounded-lg transition">
          <ChevronLeft className="w-5 h-5 text-[#8B2D6C]" />
        </button>
        <h1 className="text-lg font-bold text-[#8B2D6C]">Doctor's Appointment</h1>
      </div>

      <div className="px-4 sm:px-6 py-4 flex-1 flex flex-col">
        {/* ═══════════════════════════════════════ */}
        {/* Doctor Profile Card — matches app exactly */}
        {/* CircleAvatar(45) with rating badge | name, hospital, spec, experience, fee */}
        {/* ═══════════════════════════════════════ */}
        {doctor && (
          <div className="flex items-center gap-3 mb-5">
            {/* Avatar + Rating badge */}
            <div className="relative flex-shrink-0">
              <div className="pb-4">
                {doctor.doctorPhoto ? (
                  <img src={doctor.doctorPhoto} alt={doctor.doctorName} className="w-[90px] h-[90px] rounded-full object-cover" />
                ) : (
                  <div className="w-[90px] h-[90px] rounded-full bg-[#F8F2F9] flex items-center justify-center text-[#8B2D6C] text-2xl font-bold">
                    {doctor.doctorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
              </div>
              {doctor.doctorRating > 0 && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#F8F2F9] rounded-[10px] px-1.5 py-0.5 flex items-center gap-1 border border-[#F8F2F9]">
                  <Star className="w-3.5 h-3.5 text-[#8B2D6C] fill-[#8B2D6C]" />
                  <span className="text-xs font-medium">{doctor.doctorRating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#8B2D6C] text-base truncate">{doctor.doctorName}</p>
              <div className="flex items-center gap-1.5">
                {doctor.doctorHospitalPhoto && (
                  <img src={doctor.doctorHospitalPhoto} className="w-6 h-6 rounded-lg object-cover" />
                )}
                <div className="min-w-0">
                  {doctor.doctorHospital && <p className="text-xs text-[#888] font-bold truncate">{doctor.doctorHospital}</p>}
                  <p className="text-xs text-[#888] font-bold truncate">{doctor.areaOfSpecialization}</p>
                </div>
              </div>
              {doctor.experience && <p className="text-xs text-[#888] italic">{doctor.experience} of experience</p>}
              <p className="text-sm font-bold text-[#8B2D6C] mt-1">₹{Math.round(doctor.doctorCharges)}/- consultation</p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* No slots state */}
        {/* ═══════════════════════════════════════ */}
        {noSlots && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
            <p className="text-xl font-bold text-[#8B2D6C] mb-3">No Open Appointments</p>
            <p className="text-sm text-[#888]">The doctor currently has no available appointment slots</p>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* Offline / Video Consultation Toggle */}
        {/* ═══════════════════════════════════════ */}
        {!noSlots && (
          <>
            <div className="flex gap-2.5 mb-4 justify-center">
              {(['Offline Consultation', 'Video Consultation'] as const).map((label, i) => (
                <button
                  key={label}
                  className={`h-12 px-4 rounded-lg text-sm font-medium transition ${consultationType === i ? 'bg-[#8B2D6C] text-white' : 'bg-[#F8F2F9] text-black'}`}
                  onClick={() => { setConsultationType(i as 0 | 1); setDialogBookingType(i === 0 ? 'OFFLINE' : 'ONLINE'); }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ═══════════════════════════════════════ */}
            {/* Schedule / Reviews tabs — matches app's OfflineConsultation TabBar */}
            {/* ═══════════════════════════════════════ */}
            <div className="flex border-b border-gray-200 mb-4">
              <button className="px-4 pb-2 text-sm font-medium border-b-[3px] border-[#8B2D6C] text-[#8B2D6C]">Schedule</button>
              <button className="px-4 pb-2 text-sm font-medium text-gray-400 border-b-[3px] border-transparent">Reviews</button>
            </div>

            {/* ═══════════════════════════════════════ */}
            {/* Date — horizontal scrollable date pills */}
            {/* Each: 50px wide, rounded-12, border, dayName(10) + dayNumber(16 bold) */}
            {/* ═══════════════════════════════════════ */}
            <p className="text-base font-bold mb-3">Date</p>
            <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3" style={{ scrollbarWidth: 'none' }}>
              {uniqueDates.map(({ dateStr, day, dayName }) => {
                const isActive = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    className={`w-[50px] min-w-[50px] h-[55px] rounded-xl border flex flex-col items-center justify-center transition ${isActive ? 'bg-[#8B2D6C] border-[#8B2D6C]' : 'bg-white border-gray-300'}`}
                    onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
                  >
                    <span className={`text-[10px] ${isActive ? 'text-white' : 'text-gray-400'}`}>{dayName}</span>
                    <span className={`text-base font-bold ${isActive ? 'text-white' : 'text-black'}`}>{day}</span>
                  </button>
                );
              })}
            </div>

            {/* ═══════════════════════════════════════ */}
            {/* Time Slots — grouped by Morning / Afternoon / Evening */}
            {/* ═══════════════════════════════════════ */}
            <div className="mb-6 px-2.5">
              {([
                { label: '🌅 Morning', slots: groupedSlots.morning },
                { label: '☀️ Afternoon', slots: groupedSlots.afternoon },
                { label: '🌙 Evening', slots: groupedSlots.evening },
              ] as const).map(({ label, slots }) => slots.length > 0 && (
                <div key={label} className="mb-4">
                  <p className="text-sm font-semibold text-[#888] mb-2">{label}</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {slots.map((slot, i) => {
                      const isSelected = selectedSlot?.slotTime === slot.slotTime && selectedSlot?.availableDate === slot.availableDate;
                      return (
                        <button
                          key={`${slot.availableDate}-${slot.slotTime}-${i}`}
                          className={`py-2.5 rounded-full border text-sm transition ${isSelected ? 'border-[#8B2D6C] border-2 text-[#8B2D6C] font-bold bg-white' : 'border-[#F2EAF6] border bg-white text-black font-normal'}`}
                          onClick={() => setSelectedSlot(isSelected ? null : slot)}
                        >
                          {slot.slotTime}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {slotsForDate.length === 0 && (
                <p className="text-[#888] text-sm">No slots available for this date.</p>
              )}
            </div>

            {/* ═══════════════════════════════════════ */}
            {/* Book Appointment Button — full width, rounded-8, blue, disabled if no slot */}
            {/* ═══════════════════════════════════════ */}
            <div className="mt-auto pt-2 pb-4">
              <button
                className="w-full h-[50px] rounded-lg bg-[#8B2D6C] text-white font-medium text-base shadow hover:opacity-90 transition disabled:opacity-40"
                disabled={!selectedSlot}
                onClick={() => setShowDialog(true)}
              >
                Book Appointment
              </button>
            </div>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* Booking Details Dialog — matches app's _showBookingDetailsDialog */}
      {/* Consultation Type dropdown, Reason for visit, Symptoms, Cancel/Confirm */}
      {/* ═══════════════════════════════════════ */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowDialog(false)}>
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[#8B2D6C] mb-4">Booking Details</h2>

            <label className="text-xs text-[#888] mb-1 block">Consultation Type</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B2D6C]"
              value={dialogBookingType}
              onChange={e => setDialogBookingType(e.target.value as 'OFFLINE' | 'ONLINE')}
            >
              <option value="OFFLINE">Offline Consultation</option>
              <option value="ONLINE">Video Consultation</option>
            </select>

            <label className="text-xs text-[#888] mb-1 block">Reason for visit</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B2D6C]"
              placeholder="e.g. Routine check-up"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />

            <label className="text-xs text-[#888] mb-1 block">Symptoms</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B2D6C] resize-none"
              rows={3}
              placeholder="Describe your symptoms..."
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 text-sm text-[#8B2D6C] font-medium" onClick={() => setShowDialog(false)}>Cancel</button>
              <button
                className="px-5 py-2 rounded-lg bg-[#8B2D6C] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-40"
                disabled={booking}
                onClick={handleConfirmBooking}
              >
                {booking ? 'Booking...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
