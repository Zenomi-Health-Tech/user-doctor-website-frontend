import { useNavigate } from "react-router-dom";
import useStore from "@/zustand/store";
import { useState } from "react";

export function useLogout() {
  const navigate = useNavigate();
  const logout = useStore((state) => state.logout);
  const [open, setOpen] = useState(false);

  const handleLogout = () => setOpen(true);
  const confirmLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  return {
    open,
    setOpen,
    handleLogout,
    confirmLogout,
  };
}
