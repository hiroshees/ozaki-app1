"use client";

import { useState } from "react";
import { type AuthUserProviderProps } from "@/types/page";
import { type AuthUser } from "@/types/auth";
import { AuthUserContext } from "@/components/states/contexts/authUserContext";

export const AuthUserProvider = ({
  authUser: defaultValue,
  children,
}: AuthUserProviderProps) => {
  const [authUser, setAuthUser] = useState<AuthUser>(defaultValue);

  return (
    <AuthUserContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthUserContext.Provider>
  );
};
