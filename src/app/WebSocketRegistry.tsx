"use client";

import { createContext } from "react";
import { ByteBuffer } from "@/libs/byte-buffer";
import { WebSocketEntry } from "./WebSocketEntry";

export type WebSocketRegisterProps = {
  name: string;
  url: string | URL;
  protocols?: string | string[] | undefined;
  onOpen?: ((evt: Event) => ByteBuffer | undefined) | undefined;
  onClose?: ((evt: CloseEvent) => void) | undefined;
};

export class WebSocketRegistry {
  static readonly DEFAULT = new WebSocketRegistry();

  static readonly Context = createContext<WebSocketRegistry>(this.DEFAULT);

  private readonly registry = new Map<string, WebSocketEntry>();

  get(name: string): WebSocketEntry | undefined {
    return this.registry.get(name);
  }

  computeWebSocketIfAbsent(props: WebSocketRegisterProps): WebSocketEntry {
    const prevEntry: WebSocketEntry | undefined = this.registry.get(props.name);
    if (prevEntry !== undefined) {
      return prevEntry;
    }

    const socket = new WebSocket(props.url, props.protocols);
    const entry = new WebSocketEntry(socket);

    socket.addEventListener("open", (e) => {
      console.log("wow");
      if (props.onOpen === undefined) {
        return;
      }

      const buffer: ByteBuffer | undefined = props.onOpen(e);
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
      if (props.onClose === undefined) {
        return;
      }

      props.onClose(e);
    });

    this.registry.set(props.name, entry);
    return entry;
  }
}
