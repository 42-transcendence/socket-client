"use client";

import { ByteBuffer } from "@/library/byte-buffer";
import { useWebSocket } from "@/websocket/websocket-hook";

export function RecvText() {
  const { lastPayload, sendPayload } = useWebSocket(
    "sock",
    0,
    (opcode, payload) => {
      const date: Date = payload.readDate();
      const loop = payload.read4();
      const array = new Array<string>();
      for (let i = 0; i < loop; i++) {
        array.push(payload.readString());
      }
      console.log("Effect: ", opcode, date, loop, array);

      const buffer = ByteBuffer.createWithOpcode(42);
      buffer.writeString("안녕");
      return buffer;
    }
  );
  useWebSocket("sock", 21, (_, payload) => {
    console.log("UUID: " + payload.readUUID());
  });

  if (lastPayload === undefined) {
    return <p>undefined</p>;
  } else {
    const date: Date = lastPayload.readDate();
    const loop = lastPayload.read4();
    const array = new Array<string>();
    for (let i = 0; i < loop; i++) {
      array.push(lastPayload.readString());
    }
    return (
      <>
        <p>Message</p>
        <p>Date = {date.toString()}</p>
        <p>Number = {loop}</p>
        {array.map((e, i) => (
          <p key={i}>{e}</p>
        ))}
      </>
    );
  }
}
