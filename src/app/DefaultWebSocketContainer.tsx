"use client";

import { ByteBuffer } from "@/libs/byte-buffer";
import { WebSocketContainer } from "./WebSocketContainer";

function defaultOnWebSocketOpen(event: Event): ByteBuffer {
  const buffer = ByteBuffer.createWithOpcode(0);
  return buffer;
}

export function DefaultWebSocketContainer({
  children,
  name,
  url,
}: React.PropsWithChildren<{
  name: string;
  url: string;
}>) {
  return (
    <WebSocketContainer
      name={name}
      url={url}
      onOpen={(e) => defaultOnWebSocketOpen(e)}
    >
      {children}
    </WebSocketContainer>
  );
}
