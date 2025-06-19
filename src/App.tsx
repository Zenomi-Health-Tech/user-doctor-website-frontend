import AppRouter from "@/routes";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <AppRouter />
      <Toaster />
    </BrowserRouter>
    </AuthProvider>
  );
}