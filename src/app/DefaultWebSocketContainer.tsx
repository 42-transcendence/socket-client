import { ByteBuffer } from "@/libs/byte-buffer";
import { WebSocketContainer } from "@/websocket/websocket-hook";

function defaultOnWebSocketOpen(event: Event): ByteBuffer {
  void event;
  const buffer = ByteBuffer.createWithOpcode(0);
  return buffer;
}

function defaultOnWebSocketClose(event: CloseEvent): void {
  void event;
  console.log("closed", event.code, event.reason);
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
      onOpen={defaultOnWebSocketOpen}
      onClose={defaultOnWebSocketClose}
    >
      {children}
    </WebSocketContainer>
  );
}
