//
import AppRouter from "@/routes";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = "501849278705-vtlm485bkkvqh08d2qe9ms7f92dc73c1.apps.googleusercontent.com";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AuthProvider>
    <BrowserRouter>
      <AppRouter />
      <Toaster />
    </BrowserRouter>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}