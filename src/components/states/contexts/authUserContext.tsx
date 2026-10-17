import { createContext } from "react";
import { type AuthUserContext as CtxType } from "@/types/auth";

const ctxDefaultValue: CtxType = {
  authUser: {
    userName: "",
    email: "",
    avatarUrl: "",
  },
  setAuthUser: () => {},
};

export const AuthUserContext = createContext<CtxType>(ctxDefaultValue);
