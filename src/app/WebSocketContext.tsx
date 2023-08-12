"use client";

import { ByteBuffer } from "@/libs/byte-buffer";
import { createContext, useContext, useEffect, useRef, useState } from "react";

interface OpcodeEventMap {
  message: MessageEvent<ArrayBuffer>;
}

class OpcodeEventTarget extends EventTarget {
  override addEventListener<K extends keyof OpcodeEventMap>(
    type: K,
    callback: (this: WebSocket, evt: OpcodeEventMap[K]) => void,
    options?: AddEventListenerOptions | boolean
  ): void;
  override addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;

  override addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean
  ): void {
    super.addEventListener(type, callback, options);
  }

  override removeEventListener<K extends keyof OpcodeEventMap>(
    type: K,
    callback: (this: WebSocket, ev: OpcodeEventMap[K]) => void,
    options?: EventListenerOptions | boolean
  ): void;
  override removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject,
    options?: EventListenerOptions | boolean
  ): void;

  override removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean
  ): void {
    super.removeEventListener(type, callback, options);
  }
}

class WebSocketEntry {
  private readonly opcodeEventTargetMap = new Map<number, OpcodeEventTarget>();

  constructor(private readonly socket: WebSocket) {}

  private getOrCreateOpcodeEventTarget(opcode: number): OpcodeEventTarget {
    const prevTarget: OpcodeEventTarget | undefined =
      this.opcodeEventTargetMap.get(opcode);
    if (prevTarget !== undefined) {
      return prevTarget;
    }

    const target = new OpcodeEventTarget();
    this.opcodeEventTargetMap.set(opcode, target);
    return target;
  }

  listenOpcode(
    opcode: number,
    listener: (this: WebSocket, evt: MessageEvent<ArrayBuffer>) => void
  ): void {
    const target: OpcodeEventTarget = this.getOrCreateOpcodeEventTarget(opcode);
    target.addEventListener("message", listener);
  }

  dispatchOpcode(opcode: number, event: MessageEvent<ArrayBuffer>): void {
    const target: OpcodeEventTarget | undefined =
      this.opcodeEventTargetMap.get(opcode);
    if (target !== undefined) {
      target.dispatchEvent(event);
    }
  }

  sendPacket(buffer: ByteBuffer): void {
    this.socket.send(buffer.toArray());
  }

  close(code?: number, reason?: string): void {
    this.socket.close(code, reason);
  }
}

const webSocketRegistry = new Map<string, WebSocketEntry>();

function computeWebSocketIfAbsent(
  name: string,
  url: string | URL,
  onOpen?: ((evt: Event) => ByteBuffer | undefined) | undefined
): WebSocketEntry {
  const prevEntry: WebSocketEntry | undefined = webSocketRegistry.get(name);
  if (prevEntry !== undefined) {
    return prevEntry;
  }

  const socket = new WebSocket(url);
  const entry = new WebSocketEntry(socket);

  socket.addEventListener("open", (e) => {
    if (onOpen === undefined) {
      return;
    }

    const buffer: ByteBuffer | undefined = onOpen(e);
    if (buffer !== undefined) {
      entry.sendPacket(buffer);
    }
  });

  socket.binaryType = "arraybuffer";

  socket.addEventListener("message", (e) => {
    const buffer = ByteBuffer.from(e.data);
    const opcode: number = buffer.readOpcode();
    entry.dispatchOpcode(opcode, e);
  });

  webSocketRegistry.set(name, entry);
  return entry;
}

const WebSocketContext = createContext<WebSocketEntry | undefined>(undefined);

export function WebSocketProvider({
  children,
  name,
  url,
  onOpen,
}: React.PropsWithChildren<{
  name: string;
  url: string | URL;
  onOpen?: ((evt: Event) => ByteBuffer | undefined) | undefined;
}>) {
  const socket = useRef<WebSocketEntry | undefined>(undefined);
  useEffect(() => {
    const newSocket = computeWebSocketIfAbsent(name, url, onOpen);
    socket.current = newSocket;
  }, [name, url, onOpen]);
  return (
    <WebSocketContext.Provider value={socket.current}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket(name: string) {
  const [, rerender] = useState();
  const ctx: WebSocketEntry | undefined = useContext(WebSocketContext);
  return ctx;
}
