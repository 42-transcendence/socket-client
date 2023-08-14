"use client";

import { useWebSocket } from "@/websocket/websocket-hook";

export function RecvText() {
  const { lastPacket } = useWebSocket("chat", 0);

  if (lastPacket === undefined) {
    return <p>undefined</p>;
  } else {
    lastPacket.readDate();
    const loop = lastPacket.read4();
    const array = new Array<string>();
    for (let i = 0; i < loop; i++) {
      array.push(lastPacket.readString());
    }
    return (
      <>
        <p>Message</p>
        {array.map((e, i) => (
          <p key={i}>{e}</p>
        ))}
      </>
    );
  }
}
