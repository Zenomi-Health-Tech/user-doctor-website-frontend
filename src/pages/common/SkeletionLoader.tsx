import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonLoaderProps {
  fullPage?: boolean; // If true, show a full-page skeleton
  className?: string; // Additional Tailwind CSS classes for custom styling
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ fullPage = false, className = "" }) => {
  if (fullPage) {
    return (
      <div className="w-full h-screen">
        <Skeleton className={`w-full h-full ${className}`} />
      </div>
    );
  }

  return <Skeleton className={className} />;
};

export default SkeletonLoader;