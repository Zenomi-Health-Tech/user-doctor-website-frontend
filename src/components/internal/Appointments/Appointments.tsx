import { useEffect, useState, useMemo } from "react";
import api from "@/utils/api";
import { Calendar, Clock, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// ── Types ──

interface DoctorAppointment {
  id: string; userId: string; doctorId: string; preferredDate: string; preferredTime: string;
  status?: string; user: { id: string; name: string; profilePicture: string | null };
}

interface UserAppointment {
  id: string; doctorId: string; preferredDate?: string; preferredTime?: string;
  bookingSlotTime?: string; bookingSlotStatus?: string; status?: string;
  createdAt: string; updatedAt: string;
  doctor: {
    id?: string; doctorId?: string; name?: string; doctorName?: string;
    specialization?: string; areaOfSpecialization?: string;
    photoUrl?: string | null; doctorPhoto?: string;
    qualification?: string; consultationFee?: number; doctorCharges?: number;
    workLocation?: string; medicalLicenseNumber?: string;
  };
}

type SlotItem = { id?: string; startTime: string };
type AvailabilityItem = { date: string; timeSlots: SlotItem[] };
type AvailableDoctor = {
  doctorId: string; doctorName: string; specialization: string;
  qualification: string; workLocation: string; consultationFee: number;
  medicalLicenseNumber: string; availabilities: AvailabilityItem[];
};

// ── Helpers ──

const getName = (a: UserAppointment) => a.doctor?.doctorName || a.doctor?.name || "";
const getSpec = (a: UserAppointment) => a.doctor?.areaOfSpecialization || a.doctor?.specialization || "";
const getStatus = (a: UserAppointment) => a.bookingSlotStatus || a.status || "";
const fmtDateLong = (s: string) => { try { return new Date(s).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }); } catch { return s; } };
const fmtTime12 = (s: string) => { try { return new Date(s).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }); } catch { return s; } };
const fmtTimeRange = (s: string) => { try { const d = new Date(s); const end = new Date(d.getTime() + 30 * 60000); return `${fmtTime12(s)} - ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}`; } catch { return s; } };
const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Appointments() {
  const { isDoctor, isUser } = useAuth();
  const navigate = useNavigate();

  // Doctor state
  const [docAppts, setDocAppts] = useState<{ previous: DoctorAppointment[]; upcoming: DoctorAppointment[] }>({ previous: [], upcoming: [] });
  const [docLoading, setDocLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [docTab, setDocTab] = useState("All");

  // User state
  const [userAppts, setUserAppts] = useState<{ previous: UserAppointment[]; upcoming: UserAppointment[] }>({ previous: [], upcoming: [] });
  const [userLoading, setUserLoading] = useState(true);
  const [userTab, setUserTab] = useState(0); // 0=Upcoming, 1=Completed, 2=Book Slot

  useEffect(() => {
    if (isDoctor) {
      (async () => { setDocLoading(true); try { const { data: d } = await api.get("/doctors/appointments"); if (d.success && d.data) setDocAppts({ previous: d.data.previous_appointments || [], upcoming: d.data.upcoming_appointments || [] }); } catch {} finally { setDocLoading(false); } })();
    }
    if (isUser) {
      (async () => { setUserLoading(true); try { const { data: d } = await api.get("/users/get-user-appointments"); if (d.success && d.data) setUserAppts({ previous: d.data.previous_appointments || [], upcoming: d.data.upcoming_appointments || [] }); } catch {} finally { setUserLoading(false); } })();
    }
  }, [isDoctor, isUser]);

  // ── Doctor UI (unchanged) ──
  if (isDoctor) {
    const TABS = ["All", "Completed", "Rescheduled", "Rejected", "Upcoming"];
    const list = docTab === "Upcoming" ? docAppts.upcoming : docAppts.previous;
    const filtered = (docTab === "All" || docTab === "Upcoming" ? list : list.filter(a => a.status === docTab.toUpperCase())).filter(a => a.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div className="p-4 sm:p-8 min-h-screen font-['Poppins']">
        <h1 className="text-2xl font-semibold mb-6 text-[#8B2D6C]">Appointment Details</h1>
        <div className="flex justify-end mb-4"><button className="px-6 py-2 rounded-lg bg-[#8B2D6C] text-white font-semibold" onClick={() => navigate("/appointments/set-availability")}>Set Availability</button></div>
        <div className="flex border-b mb-6 overflow-x-auto">{TABS.map(t => <button key={t} className={`px-4 pb-2 text-base font-medium whitespace-nowrap ${docTab === t ? "border-b-2 border-[#8B2D6C] text-[#8B2D6C]" : "text-gray-400"}`} onClick={() => setDocTab(t)}>{t}</button>)}</div>
        {docLoading ? <p className="text-center text-gray-400 mt-10">Loading...</p> : filtered.length === 0 ? <p className="text-center text-gray-400 mt-10">No appointments</p> : (
          <div className="space-y-4">{filtered.map(a => <div key={a.id} onClick={() => navigate(`/patients/${a.userId}`)} className="bg-white cursor-pointer rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-[#F8F2F9] flex items-center justify-center text-[#8B2D6C] font-semibold text-lg">{a.user?.name?.split(" ").map(n => n[0]).join("").toUpperCase()}</div><div><p className="font-semibold text-black">{a.user?.name}</p><p className="text-xs text-[#636363]">{fmtDateLong(a.preferredDate)} · {fmtTime12(a.preferredTime)}</p></div></div>{a.status && <span className="text-xs font-medium text-[#636363]">{a.status}</span>}</div>)}</div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════
  // USER UI — matches UserCalendarTab exactly
  // ═══════════════════════════════════════

  const TAB_LABELS = ['Upcoming', 'Completed', 'Book Slot'];

  return (
    <div className="min-h-screen font-['Poppins'] bg-white">
      {/* Header: back + "Appointments" */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-black" />
        </button>
        <h1 className="text-[22px] font-bold text-black">Appointments</h1>
        <div className="w-10" />
      </div>

      {/* Pill Tab Bar — gradient active, #F6EEF3 bg */}
      <div className="px-5 py-2.5">
        <div className="h-[45px] rounded-[25px] bg-[#F6EEF3] flex overflow-hidden">
          {TAB_LABELS.map((label, i) => (
            <button key={label} onClick={() => setUserTab(i)}
              className={`flex-1 text-[13px] font-semibold rounded-[25px] transition-all ${userTab === i ? 'text-white' : 'text-black/50'}`}
              style={userTab === i ? { background: 'linear-gradient(90deg, #704180, #8B2D6C)' } : {}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-0 pb-24">
        {userTab === 0 && <AppointmentList appointments={userAppts.upcoming} loading={userLoading} isUpcoming />}
        {userTab === 1 && <AppointmentList appointments={userAppts.previous} loading={userLoading} isUpcoming={false} />}
        {userTab === 2 && <BookSlotTab />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// AppointmentList — matches _buildAppointmentList
// Empty state: icon + title + subtitle
// ═══════════════════════════════════════

function AppointmentList({ appointments, loading, isUpcoming }: { appointments: UserAppointment[]; loading: boolean; isUpcoming: boolean }) {
  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-3 border-[#8B2D6C] border-t-transparent rounded-full animate-spin" /></div>;

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8">
        <Calendar className={`w-14 h-14 mb-4 ${isUpcoming ? 'text-[#8B2D6C]/30' : 'text-[#8B2D6C]/30'}`} />
        <p className="text-base font-semibold text-black mb-2">
          {isUpcoming ? 'No Upcoming Appointments' : 'No Completed Appointments'}
        </p>
        <p className="text-[13px] text-[#808080] text-center">
          {isUpcoming ? 'Book a slot with your doctor to get started.' : 'Your completed appointments will appear here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="pt-4 pb-4">
      {appointments.map(appt => <AppointmentTile key={appt.id} appt={appt} />)}
    </div>
  );
}

// ═══════════════════════════════════════
// AppointmentTile — matches UserApointmentTile exactly
// 66px rounded-20 avatar | name + spec | status icon
// calendar + date | clock + time range
// ═══════════════════════════════════════

function AppointmentTile({ appt }: { appt: UserAppointment }) {
  const doctorName = getName(appt);
  const spec = getSpec(appt);
  const status = getStatus(appt);
  const preferredTime = appt.bookingSlotTime || appt.preferredTime || "";
  const preferredDate = appt.preferredDate || appt.bookingSlotTime || "";

  const nameParts = doctorName.split(' ');
  const initials = ((nameParts[0]?.[0] || '') + (nameParts[1]?.[0] || '')).toUpperCase() || 'XX';

  const statusIcon = status === 'COMPLETED' ? '✅' : status === 'CANCELLED' ? '❌' : '⏳';

  return (
    <div className="mx-4 mb-4 p-4 bg-white rounded-xl border border-[#DEDEDE]" style={{ boxShadow: '2px 12px 20px 0px #E9E9E9' }}>
      {/* Row 1: Avatar + Name + Spec + Status */}
      <div className="flex items-center gap-2.5">
        <div className="w-[66px] h-[66px] rounded-[20px] bg-[#8B2D6C]/10 flex items-center justify-center flex-shrink-0">
          <span className="text-[#8B2D6C] text-xl font-bold">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-black truncate">{doctorName}</p>
          <p className="text-sm text-[#636363] truncate">{spec}</p>
        </div>
        <span className="text-xl">{statusIcon}</span>
      </div>

      {/* Row 2: Date + Time */}
      <div className="flex items-start justify-between mt-4 px-2.5">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <Calendar className="w-4 h-4 text-[#636363] flex-shrink-0" />
          <span className="text-xs font-medium text-black truncate">{fmtDateLong(preferredDate)}</span>
        </div>
        <div className="w-3" />
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <Clock className="w-4 h-4 text-[#636363] flex-shrink-0" />
          <span className="text-xs text-[#636363] truncate">{fmtTimeRange(preferredTime)}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// BookSlotTab — matches BookAnAppointments exactly
// Doctor card | "Choose a slot" | date chips | time grid | Book button
// ═══════════════════════════════════════

function BookSlotTab() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<AvailableDoctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateIdx, setSelectedDateIdx] = useState<number | null>(null);
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number | null>(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/users/get-user-available-slots');
        const docs = data.data || [];
        if (docs.length > 0) {
          const d = docs[0];
          setDoctor({
            doctorId: d.doctorId, doctorName: d.doctorName, specialization: d.specialization || '',
            qualification: d.qualification || '', workLocation: d.workLocation || '',
            consultationFee: d.consultationFee || 0, medicalLicenseNumber: d.medicalLicenseNumber || '',
            availabilities: d.availabilities || [],
          });
          if ((d.availabilities || []).length > 0) setSelectedDateIdx(0);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleBook = async () => {
    if (!doctor || selectedDateIdx === null || selectedSlotIdx === null) return;
    setBooking(true);
    try {
      const avail = doctor.availabilities[selectedDateIdx];
      const slot = avail.timeSlots[selectedSlotIdx];
      const date = avail.date.split('T')[0];
      const time = slot.startTime.slice(11, 16);
      await api.post('/users/book-appointment', { doctorId: doctor.doctorId, preferredDate: date, preferredTimeSlot: time });
      navigate('/appointments');
    } catch {}
    setBooking(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-3 border-[#8B2D6C] border-t-transparent rounded-full animate-spin" /></div>;

  // Empty state
  if (!doctor || doctor.availabilities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8">
        <Calendar className="w-14 h-14 text-[#8B2D6C]/30 mb-4" />
        <p className="text-base font-semibold text-black mb-2">No Open Slots</p>
        <p className="text-[13px] text-[#808080] text-center">Your doctor hasn't opened any slots yet.</p>
      </div>
    );
  }

  const selectedSlots = selectedDateIdx !== null ? doctor.availabilities[selectedDateIdx]?.timeSlots || [] : [];

  return (
    <div className="pb-8">
      {/* Doctor Card */}
      <div className="mx-4 mt-2 mb-4 p-4 bg-white rounded-xl border border-[#DEDEDE]" style={{ boxShadow: '2px 12px 20px 0px #E9E9E9' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-[66px] h-[66px] rounded-[20px] bg-[#8B2D6C]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-[#8B2D6C] text-xl font-bold">{doctor.doctorName?.[0] || ''}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-black truncate">{doctor.doctorName}</p>
            <p className="text-sm text-[#636363] truncate">{doctor.specialization}</p>
            {doctor.qualification && <p className="text-xs text-[#636363] truncate mt-1">{doctor.qualification}</p>}
          </div>
        </div>
        {(doctor.medicalLicenseNumber || doctor.workLocation || doctor.consultationFee > 0) && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
            {doctor.medicalLicenseNumber && <InfoRow icon="🪪" text={`License: ${doctor.medicalLicenseNumber}`} />}
            {doctor.workLocation && <InfoRow icon="📍" text={doctor.workLocation} />}
            {doctor.consultationFee > 0 && <InfoRow icon="₹" text={`Consultation Fee: ₹${doctor.consultationFee}`} />}
          </div>
        )}
      </div>

      {/* "Choose a slot" */}
      <p className="px-4 text-base font-bold text-black mb-3">Choose a slot</p>

      {/* Date chips — 72px wide, gradient selected, day+date+month */}
      <div className="flex gap-2.5 overflow-x-auto px-2.5 pb-3" style={{ scrollbarWidth: 'none' }}>
        {doctor.availabilities.map((avail, i) => {
          const dt = new Date(avail.date);
          const active = i === selectedDateIdx;
          return (
            <button key={avail.date} onClick={() => { setSelectedDateIdx(i); setSelectedSlotIdx(null); }}
              className={`w-[72px] min-w-[72px] py-3 px-1 rounded-[10px] flex flex-col items-center transition ${active ? 'text-white border-0' : 'bg-white border border-[#E5E7EB] text-[#18181B]'}`}
              style={active ? { background: 'linear-gradient(90deg, #704180, #8B2D6C)' } : {}}>
              <span className="text-xs font-medium">{DAY_NAMES[dt.getDay()]}</span>
              <span className="text-xl font-bold">{dt.getDate()}</span>
              <span className="text-[10px] font-bold">{MONTHS[dt.getMonth()]}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-2.5 border-t border-gray-300 mb-3" />

      {/* Time slots — 3-col grid, gradient selected */}
      <div className="grid grid-cols-3 gap-2.5 px-2.5">
        {selectedSlots.map((slot, i) => {
          const active = i === selectedSlotIdx;
          const timeStr = fmtTime12(slot.startTime);
          return (
            <button key={slot.startTime + i} onClick={() => setSelectedSlotIdx(i)}
              className={`py-2.5 rounded-[10px] text-sm font-medium transition ${active ? 'text-white border-0' : 'bg-white border border-[#E5E7EB] text-[#18181B]'}`}
              style={active ? { background: 'linear-gradient(90deg, #704180, #8B2D6C)' } : {}}>
              {timeStr}
            </button>
          );
        })}
      </div>

      {/* Book button */}
      {selectedDateIdx !== null && selectedSlotIdx !== null && (
        <div className="px-2.5 mt-4">
          <button onClick={handleBook} disabled={booking}
            className="w-full py-3.5 rounded-[70px] text-white font-medium text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg, #704180, #8B2D6C)' }}>
            {booking ? 'Booking...' : 'Book the Appointment'}
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{icon}</span>
      <span className="text-[13px] text-[#636363]">{text}</span>
    </div>
  );
}
