import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const DOCTOR_TERMS = `1. Introduction
These Terms & Conditions govern the use of the Zenomi Health platform ("Platform") by registered medical professionals ("Doctor"). By accessing or using the Platform, the Doctor agrees to comply with and be bound by these Terms.

2. Clinical Responsibility
2.1 The Platform is designed to support, not replace, professional medical judgment.
2.2 The Doctor retains full and sole responsibility for all clinical decisions, including diagnosis, treatment plans, prescriptions, and patient management.
2.3 Zenomi Health shall not be held liable for any clinical outcomes arising from consultations conducted via or supported by the Platform.

3. No Guaranteed Outcomes
3.1 The Platform provides tools, insights, assessments, and structured programs intended to assist healthcare delivery.
3.2 Zenomi Health does not guarantee any specific medical, psychological, or therapeutic outcomes.
3.3 Patient improvement, recovery, or treatment success depends solely on clinical judgment, patient adherence, and external factors beyond the Platform's control.

4. Referral Usage Policy
4.1 Any referral system provided by Zenomi Health is strictly for the registered Doctor's use.
4.2 Referrals are non-transferable and may not be shared, sold, or reassigned without explicit authorization.
4.3 Any misuse, manipulation, or fraudulent use of referral mechanisms may result in suspension or permanent termination of Platform access.

5. Platform Role & Scope of Services
5.1 Zenomi Health acts as a digital support system and provides the following services:
  • Patient assessments
  • Analytical reports and summaries
  • Structured mental health programs and tools
5.2 The Platform does not:
  • Prescribe medication or treatment
  • Override or interfere with clinical decisions
  • Participate in or influence direct doctor-patient consultations
5.3 All interactions between Doctor and patient remain independent of Zenomi Health's control or liability.

6. Professional Conduct
6.1 The Doctor agrees to adhere to all applicable medical laws, ethical guidelines, and professional standards while using the Platform.
6.2 The Doctor must ensure patient confidentiality, data protection, and informed consent in all interactions.
6.3 Any misuse of the Platform for unethical, illegal, or non-medical purposes may result in immediate suspension.

7. Limitation of Liability
7.1 Zenomi Health shall not be liable for:
  • Clinical decisions made by the Doctor
  • Patient outcomes or dissatisfaction
  • Misinterpretation or misuse of Platform-generated insights
7.2 The Platform is provided on an "as-is" and "as-available" basis without warranties of any kind.

8. Suspension & Termination
8.1 Zenomi Health reserves the right to suspend or terminate access if:
  • These Terms are violated
  • Referral misuse is detected
  • Any activity compromises patient safety or Platform integrity

9. Amendments
Zenomi Health reserves the right to update or modify these Terms at any time. Continued use of the Platform constitutes acceptance of the revised Terms.

10. Acceptance
By using the Zenomi Health Platform, the Doctor acknowledges that they have read, understood, and agreed to these Terms & Conditions.`;

const PATIENT_TERMS = `1. Nature of Service
Zenomi is a digital wellness and mental health support platform that provides assessments, insights, and guided programs.
It is not a medical, psychiatric, or diagnostic service.

2. No Medical Advice or Treatment
Zenomi does not provide medical advice, diagnosis, or treatment.
The content, reports, and recommendations are for informational and self-improvement purposes only.
Use of the platform does not create a doctor–patient or therapist–client relationship.

3. No Guaranteed Outcomes
Zenomi does not guarantee specific results, outcomes, or improvements.
Individual results may vary based on:
  • User consistency
  • Lifestyle factors
  • Pre-existing conditions
The program is designed to support improvement, not ensure it.

4. User Responsibility & Engagement
The effectiveness of the program depends on your active participation and consistency.
You agree that:
  • Skipping modules, exercises, or assessments may reduce effectiveness
  • You are responsible for implementing recommendations in your daily routine
  • Zenomi is not responsible for outcomes resulting from non-compliance or inconsistent usage

5. Health & Medical Disclaimer
Zenomi is not a substitute for professional medical or psychological care.
You are strongly advised to:
  • Continue consulting your doctor, psychologist, or licensed healthcare provider
  • Seek professional advice before making significant health or lifestyle changes

6. Emergency & Crisis Limitation
Zenomi does not provide emergency or crisis intervention services.
If you experience severe distress, suicidal thoughts, or mental health emergencies, you must immediately contact:
  • A licensed medical professional
  • Local emergency services
  • A mental health helpline

7. Data & Self-Reported Information
Insights and reports are generated based on self-reported data and user inputs.
Zenomi does not guarantee the accuracy of results if information provided is incomplete, inaccurate, or inconsistent.

8. Digital Tool Limitations
Features such as sleep tracking and nutrition tracking:
  • Provide indicative insights, not clinical measurements
  • Should not be relied upon for medical decision-making

9. Appropriate Use
The platform is intended for personal, non-commercial use only.
Misuse of the platform, including manipulation of assessments or data, may result in suspension or termination of access.

10. Alignment with Industry Standards
Zenomi's policies and limitations are aligned with widely accepted practices followed by global digital mental health platforms, including:
  • Clear distinction between wellness support and medical treatment
  • Emphasis on user responsibility and engagement
  • Strict non-emergency usage boundaries
  • Transparency around data-driven insights and limitations

11. Acceptance of Terms
By using Zenomi, you acknowledge that:
  • You have read and understood these Terms & Conditions
  • You agree to use the platform responsibly
  • You understand the scope and limitations of the service`;

interface TermsDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
  type: "doctor" | "patient";
}

export default function TermsDialog({ open, onAccept, onDecline, type }: TermsDialogProps) {
  const [accepted, setAccepted] = useState(false);
  const isDoctor = type === "doctor";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onDecline(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div
          className="px-6 py-5 rounded-t-lg"
          style={{ background: isDoctor ? "linear-gradient(135deg, #704180, #8B2D6C)" : "linear-gradient(135deg, #8B2D6C, #704180)" }}
        >
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-['Poppins']">Terms & Conditions</DialogTitle>
            <DialogDescription className="text-white/70 font-['Poppins']">
              Zenomi Health Platform – {isDoctor ? "Doctor" : "Patient"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line font-['Poppins']">
          {isDoctor ? DOCTOR_TERMS : PATIENT_TERMS}
        </div>

        <div className="border-t bg-gray-50 px-6 py-4 rounded-b-lg">
          <label className="flex items-start gap-3 cursor-pointer mb-4" onClick={() => setAccepted(!accepted)}>
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#704180]"
            />
            <span className="text-sm text-gray-700 font-['Poppins']">
              I have read and agree to the Terms & Conditions
            </span>
          </label>
          <DialogFooter className="flex-row gap-3">
            <button
              onClick={onDecline}
              className="flex-1 h-11 rounded-xl border border-[#704180] text-[#704180] font-semibold text-sm font-['Poppins'] hover:bg-[#704180]/5 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              disabled={!accepted}
              className="flex-1 h-11 rounded-xl bg-[#704180] text-white font-semibold text-sm font-['Poppins'] hover:bg-[#5a3468] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Accept & Continue
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
