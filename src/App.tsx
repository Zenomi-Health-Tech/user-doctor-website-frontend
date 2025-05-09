import AppRouter from "@/routes";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { UserProvider } from '@/context/UserContext';

export default function App() {
  return (
    <UserProvider>
    <BrowserRouter>
      <AppRouter />
      <Toaster />
    </BrowserRouter>
    </UserProvider>
  );
}