"use client";

import { useContext } from "react";
import { AuthUserContext as CtxType } from "@/types/auth";
import { AuthUserContext } from "@/components/states/contexts/authUserContext";

export function useAuthUser() {
  return useContext<CtxType>(AuthUserContext);
}
