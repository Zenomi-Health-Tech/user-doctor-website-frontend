// utils/errorHandler.ts
interface ApiErrorResponse {
    message?: string;
    error?: string;
    status?: string;
  }
  
  export const handleApiError = (error: any): string => {
    if (error.response) {
      const { data }: { data: ApiErrorResponse } = error.response;
      if (data.status === "error") {
        return data.error || data.message || "An unexpected error occurred.";
      }
      return data.message || "An unexpected error occurred.";
    }
    return "Network error. Please try again.";
  };
  