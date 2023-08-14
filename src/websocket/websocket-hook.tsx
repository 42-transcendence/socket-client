"use client";

import { ByteBuffer } from "@/libs/byte-buffer";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import {
  SocketCloseResult,
  SocketState,
  WebSocketListenProps,
  WebSocketRegisterProps,
  WebSocketRegistry,
} from "./websocket-registry";

const RegistryContext = createContext(WebSocketRegistry.DEFAULT);

export function WebSocketRegistryContainer({
  children,
}: React.PropsWithChildren) {
  const registry = useMemo(() => {
    return new WebSocketRegistry();
  }, []);
  return (
    <RegistryContext.Provider value={registry}>
      {children}
    </RegistryContext.Provider>
  );
}

export function WebSocketContainer({
  children,
  ...rest
}: React.PropsWithChildren<WebSocketRegisterProps>) {
  const registry: WebSocketRegistry = useContext(RegistryContext);
  useEffect(() => {
    return registry.register(rest);
  }, [registry, rest]);
  return children;
}

type WebSocketListenerHooks = {
  dangerouslyGetWebSocketRef: React.MutableRefObject<WebSocket | undefined>;
  socketState: SocketState;
  socketCloseResult: SocketCloseResult | undefined;
  lastOpcode: number | undefined;
  lastPacket: ByteBuffer | undefined;
  sendPacket: (value: ByteBuffer) => void;
};

export function useWebSocket(
  name: string,
  opcode?: number | undefined
): WebSocketListenerHooks {
  const registry: WebSocketRegistry = useContext(RegistryContext);
  const webSocketRef = useRef<WebSocket>();
  const [socketState, setSocketState] = useState(SocketState.INITIAL);
  const [socketCloseResult, setSocketCloseResult] =
    useState<SocketCloseResult>();
  const [lastMessage, _setLastMessage] = useState<ArrayBuffer>();
  const lastPacket = useMemo<ByteBuffer | undefined>(() => {
    if (lastMessage === undefined) {
      return undefined;
    }

    return ByteBuffer.from(lastMessage);
  }, [lastMessage]);
  const lastOpcode = useMemo<number | undefined>(() => {
    if (lastPacket === undefined) {
      return undefined;
    }

    return lastPacket.readOpcode();
  }, [lastPacket]);
  const sendPacket = useCallback((value: ByteBuffer): void => {
    webSocketRef.current?.send(value.toArray());
  }, []);
  useEffect(() => {
    const setLastMessage = (
      value: React.SetStateAction<ArrayBuffer | undefined>
    ): void => {
      flushSync(() => {
        _setLastMessage(value);
      });
    };
    const filter =
      opcode !== undefined
        ? (value: ArrayBuffer): boolean => {
            const buffer = ByteBuffer.from(value);
            const opcode = buffer.readOpcode();
            return opcode === opcode;
          }
        : undefined;
    const props: WebSocketListenProps = {
      name,
      webSocketRef,
      setSocketState,
      setSocketCloseResult,
      setLastMessage,
      filter,
    };
    return registry.listen(props);
  }, [registry, name, opcode]);

  const hooks: WebSocketListenerHooks = {
    dangerouslyGetWebSocketRef: webSocketRef,
    socketState,
    socketCloseResult,
    lastOpcode,
    lastPacket,
    sendPacket,
  };

  return hooks;
}
