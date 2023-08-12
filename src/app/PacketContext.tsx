"use client";

import { createContext, useContext } from "react";
import { Paper, styled } from "@mui/material";

const PacketItem = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const PacketContext = createContext<string[]>(["undefined"]);

export function PacketContextProvider({ children }: React.PropsWithChildren) {
  return (
    <PacketContext.Provider
      value={[...new Array(128)].map((e, i) => `test message ${i}`)}
    >
      {children}
    </PacketContext.Provider>
  );
}

export function PacketItemList() {
  const ctx: string[] = useContext(PacketContext);
  return (
    <>
      {ctx.map((e, i) => (
        <PacketItem key={i}>{e}</PacketItem>
      ))}
    </>
  );
}
