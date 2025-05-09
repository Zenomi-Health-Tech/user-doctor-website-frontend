import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createRegisterAuthSlice, RegisterAuthState } from "./registerSlice";
import { createLoginAuthSlice, LoginAuthState } from "./login";

type StoreState = RegisterAuthState & LoginAuthState;

const useStore = create<StoreState>()(
  devtools((set, get, api) => ({
    ...createRegisterAuthSlice(set, get, api),
    ...createLoginAuthSlice(set, get, api),
  }))
);

export default useStore;
