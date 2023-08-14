"use client";

import { ByteBuffer } from "@/libs/byte-buffer";
import { WebSocketContainer } from "@/websocket/websocket-hook";

function defaultOnWebSocketOpen(event: Event): Uint8Array {
  void event;
  const buffer = ByteBuffer.createWithOpcode(0);
  return buffer.toArray();
}

function defaultOnWebSocketClose(event: CloseEvent): void {
  void event;
  console.log("closed", event.code, event.reason);
}

function defaultOnError(event: Event): void {
  console.log("이거 왜 터짐?", event);
}

export function DefaultWebSocketContainer({
  children,
  name,
  url,
}: React.PropsWithChildren<{ name: string; url: string }>) {
  return (
    <WebSocketContainer
      name={name}
      url={url}
      handshake={defaultOnWebSocketOpen}
      onClose={defaultOnWebSocketClose}
      onError={defaultOnError}
    >
      {children}
    </WebSocketContainer>
  );
}
