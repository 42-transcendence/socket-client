"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  WebSocketRegisterOptions,
  WebSocketRegistry,
} from "./WebSocketRegistry";
import { WebSocketEntry } from "./WebSocketEntry";
import { ByteBuffer } from "@/libs/byte-buffer";

export function WebSocketRegistryContainer({
  children,
}: React.PropsWithChildren) {
  const registry = useMemo(() => new WebSocketRegistry(), []);
  return (
    <WebSocketRegistry.Context.Provider value={registry}>
      {children}
    </WebSocketRegistry.Context.Provider>
  );
}

export function WebSocketContainer(
  props: React.PropsWithChildren<WebSocketRegisterOptions>
) {
  const { children, ...rest } = props;
  const registry: WebSocketRegistry = useContext(WebSocketRegistry.Context);
  useEffect(() => {
    const socket = registry.computeWebSocketIfAbsent(rest);
    return () => socket.close();
  }, [registry, rest]);
  return children;
}

export function useWebSocket(name: string) {
  const registry: WebSocketRegistry = useContext(WebSocketRegistry.Context);
  const entry: WebSocketEntry = registry.get(name);
  return entry;
}

export function useWebSocketOpcode(name: string, opcode: number) {
  const [, forceUpdate] = useReducer(() => {}, undefined);
  const registry: WebSocketRegistry = useContext(WebSocketRegistry.Context);
  const entry: WebSocketEntry = registry.get(name);
  useEffect(
    () =>
      entry.listenOpcode(opcode, (e) => {
        console.log(e.currentTarget, ByteBuffer.from(e.data).toDumpString());
        forceUpdate();
      }),
    [entry, opcode]
  );
  return;
}
