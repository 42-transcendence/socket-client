"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { WebSocketRegisterProps, WebSocketRegistry } from "./WebSocketRegistry";
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
  props: React.PropsWithChildren<WebSocketRegisterProps>
) {
  const { children, ...rest } = props;
  const registry: WebSocketRegistry = useContext(WebSocketRegistry.Context);
  useEffect(() => {
    console.log("너냐?");
    const socket: WebSocketEntry = registry.computeWebSocketIfAbsent(rest);
    return () => socket.close();
  }, [registry, rest]);
  return children;
}

export function useWebSocketControl(
  name: string
): [
  InstanceType<typeof WebSocketEntry>["sendPacket"] | undefined,
  InstanceType<typeof WebSocketEntry>["close"] | undefined
] {
  const registry: WebSocketRegistry = useContext(WebSocketRegistry.Context);
  const entry: WebSocketEntry | undefined = registry.get(name);
  return [entry?.sendPacket, entry?.close];
}

export function useWebSocketOpcode(
  name: string,
  opcode: number
): [
  ByteBuffer | undefined,
  InstanceType<typeof WebSocketEntry>["sendPacket"] | undefined,
  InstanceType<typeof WebSocketEntry>["close"] | undefined
] {
  const [lastPacket, setLastPacket] = useState<ByteBuffer | undefined>(
    undefined
  );
  const registry: WebSocketRegistry = useContext(WebSocketRegistry.Context);
  const entry: WebSocketEntry | undefined = registry.get(name);
  useEffect(() => {
    if (entry !== undefined) {
      console.log("마참내!");
      return entry.listenOpcode(opcode, (e) => {
        console.log(e.currentTarget, ByteBuffer.from(e.data).toDumpString()); //XXX: just for DEBUG
        setLastPacket(ByteBuffer.from(e.data));
      });
    } else {
      console.log("뭐가 먼저 뜨니?");
    }
  }, [name, registry, entry, opcode]);
  return [lastPacket, entry?.sendPacket, entry?.close];
}
