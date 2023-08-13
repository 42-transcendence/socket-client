"use client";

import { createContext } from "react";
import { ByteBuffer } from "@/libs/byte-buffer";
import { WebSocketEntry } from "./WebSocketEntry";

export type WebSocketRegisterOptions = {
  name: string;
  url: string | URL;
  protocols?: string | string[] | undefined;
  onOpen?: ((evt: Event) => ByteBuffer | undefined) | undefined;
  onClose?: ((evt: CloseEvent) => void) | undefined;
};

export class WebSocketRegistry {
  static readonly Default = new WebSocketRegistry();
  static readonly Context = createContext<WebSocketRegistry>(
    WebSocketRegistry.Default
  );

  readonly registry = new Map<string, WebSocketEntry>();

  get(name: string): WebSocketEntry {
    const entry: WebSocketEntry | undefined = this.registry.get(name);
    if (entry === undefined) {
      throw new SyntaxError();
    }

    return entry;
  }

  computeWebSocketIfAbsent(options: WebSocketRegisterOptions): WebSocketEntry {
    const prevEntry: WebSocketEntry | undefined = this.registry.get(
      options.name
    );
    if (prevEntry !== undefined) {
      return prevEntry;
    }

    const socket = new WebSocket(options.url, options.protocols);
    const entry = new WebSocketEntry(socket);

    socket.addEventListener("open", (e) => {
      if (options.onOpen === undefined) {
        return;
      }

      const buffer: ByteBuffer | undefined = options.onOpen(e);
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

    socket.addEventListener("close", (e) => {
      e.code;
      e.reason;
    });

    this.registry.set(options.name, entry);
    return entry;
  }
}
