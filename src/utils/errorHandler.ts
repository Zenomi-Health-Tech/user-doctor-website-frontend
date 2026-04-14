import { AxiosError } from "axios";

export const handleApiError = (error: AxiosError | any): string => {
  if (error.response) {
    // Server responded with error
    const data = error.response.data;
    if (data && typeof data === 'object' && data.message) {
      return data.message;
    }
    // Handle non-JSON responses (502, 503 HTML pages etc)
    if (typeof data === 'string') {
      return 'Server error. Please try again later.';
    }
    return `Error: ${error.response.status}`;
  } else if (error.request) {
    return "Network error. Please check your connection and try again.";
  }
  return error.message || "An unexpected error occurred.";
};
