// Define the form data interface
 export interface CreateProfileFormData {
    doctorMobileNumber: string; // Add phone number
    country: string;
    doctorEmail: string; // Updated field
    doctorName: string; // Updated field
    doctorId: string; // Updated field
    doctorDOB: string; // Updated field
    bloodType: string; // Updated field
    doctorQualification: string; // Updated field
    doctorAdditionalQualification: string; // Updated field
    doctorAddress: string; // Updated field
    practiceLocation: string; // Updated field
    areaOfSpecialization: string; // Updated field
    workplace: string; // Updated field
    doctorGender: string; // Updated field
    panCard: FileList; // Updated field
    medicalLicense: FileList; // Updated field
    aadharCard: FileList; // Updated field
    credentials: string; // Updated field for Credentials
    experience: string;  // Updated field for Experience
    doctorPhoto: FileList;
  }
   export const areaSpecializations = [
    "Internal medicine",
    "Pediatrics",
    "Dermatology",
    "Cardiology",
    "Neurology",
    "Orthopaedics",
    "Neurosurgery",
    "General Surgery",
    "Gastroenterology",
    "Ophthalmology",
    "ENT",
    "Gynaecology",
    "Surgical gastroenterology",
    "Pulmonology",
  ];

  export const bloodGroups = [
    "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "RhD+", "RhD-"
  ];

  // Constants
 export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB in bytes