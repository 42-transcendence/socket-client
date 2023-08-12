"use client";

import { ByteBuffer } from "@/libs/byte-buffer";
import { createContext, useContext, useEffect, useState } from "react";

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
}

const webSocketRegistry = new Map<string, WebSocketEntry>();

function computeWebSocketIfAbsent(
  name: string,
  url: string,
  onOpen: (evt: Event) => ByteBuffer | undefined
): WebSocketEntry {
  const prevEntry: WebSocketEntry | undefined = webSocketRegistry.get(name);
  if (prevEntry !== undefined) {
    return prevEntry;
  }

  const socket = new WebSocket(url);
  const entry = new WebSocketEntry(socket);

  socket.addEventListener("open", (e) => {
    const buffer: ByteBuffer | undefined = onOpen(e);
    if (buffer !== undefined) {
      entry.sendPacket(buffer);
    }
  });

  socket.binaryType = "arraybuffer";

  socket.addEventListener("message", (e) => {
    const arraybuffer = e.data as ArrayBuffer;
    const buffer = ByteBuffer.from(arraybuffer);
    const opcode: number = buffer.readOpcode();
    entry.dispatchOpcode(opcode, new MessageEvent<ArrayBuffer>(arraybuffer));
  });

  webSocketRegistry.set(name, entry);
  return entry;
}

const WebSocketContext = createContext<WebSocket | undefined>(undefined);

export function WebSocketProvider({
  children,
  name,
  url,
}: React.PropsWithChildren<{
  name: string;
  url: string | URL;
}>) {
  const [webSocket, setWebSocket] = useState<WebSocket | undefined>(undefined);
  useEffect(() => {
    const socket = new WebSocket(url);
    socket.binaryType = "arraybuffer";

    socket.addEventListener("open", function (event) {
      console.log("open", event);
      const buf = ByteBuffer.createWithOpcode(42);
      this.send(buf.toArray());
    });

    socket.addEventListener("message", function (event) {
      console.log("message 1", ByteBuffer.from(event.data));
    });
    socket.addEventListener("message", function (event) {
      console.log("message 2", ByteBuffer.from(event.data));
    });
  }, [name, url]);
  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket(name: string) {
  const ctx: WebSocket | undefined = useContext(WebSocketContext);
  return ctx;
}
