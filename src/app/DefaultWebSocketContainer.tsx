"use client";

import { ByteBuffer } from "@/library/byte-buffer";
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
  urlBase,
  token,
}: React.PropsWithChildren<{ name: string; urlBase: string; token: string }>) {
  const url = new URL(urlBase);
  url.searchParams.set("token", token);
  return (
    <WebSocketContainer
      name={name}
      url={url}
      protocols={["1", "2", "3"]}
      handshake={defaultOnWebSocketOpen}
      onClose={defaultOnWebSocketClose}
      onError={defaultOnError}
    >
      {children}
    </WebSocketContainer>
  );
}
