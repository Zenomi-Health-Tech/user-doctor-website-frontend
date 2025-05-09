import React from "react";
import totalPatientImg from "@/assets/PatientsDashboard.svg";
import AdmissionRateImg from "@/assets/AdmissionRate.svg";
import OngoingCases from "@/assets/PatientOnbarded.svg";
import { Card } from "@/components/ui/card";

type OverviewProps = {
  totalPatients: number;
  admissionRate: string;
  ongoingCases: number;
};

const Overview: React.FC<OverviewProps> = ({
  totalPatients,
  admissionRate,
  ongoingCases,
}) => {
  const stats = [
    {
      label: "Total registered patients",
      value: `${totalPatients}`,
      text: "Patients",
      imgSrc: totalPatientImg,
    },
    {
      label: "Admission Rate",
      value: `${admissionRate}`,
      text: "% Admissions this month",
      imgSrc: AdmissionRateImg,
    },
    {
      label: "Ongoing Cases",
      value: `${ongoingCases}`,
      text: "Patients",
      imgSrc: OngoingCases,
    },
  ];

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex justify-between space-x-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="flex-1 shadow-[8px_12px_18px_0px_#DADEE8] rounded-lg p-4 w-[350px] h-[159px]  text-start  relative border border-[#DEEBFD]"
          >
            <div className="flex items-center space-x-3">
              {/* Image at the top left corner */}
              <img
                src={stat.imgSrc}
                alt={stat.label}
                className="w-12 h-12"
              />
              <p className="text-lg font-semibold">{stat.label}</p>
            </div>
            {/* Stats with number and text stacked */}
            <div className="text-3xl font-semibold  text-[#013DC0] ml-16">
              <p className="">{stat.value}</p>
              <p className="text-base">{stat.text}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Overview;
