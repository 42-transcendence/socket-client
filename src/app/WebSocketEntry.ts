import { ByteBuffer } from "@/libs/byte-buffer";

export class WebSocketEntry {
  private readonly operationDictionary = new Map<number, WebSocketOperation>();

  constructor(private readonly socket: WebSocket) {}

  private getOrCreateOpcodeEventTarget(opcode: number): WebSocketOperation {
    const prevOperation: WebSocketOperation | undefined =
      this.operationDictionary.get(opcode);
    if (prevOperation !== undefined) {
      return prevOperation;
    }

    const operation = new WebSocketOperation();
    this.operationDictionary.set(opcode, operation);
    return operation;
  }

  listenOpcode(
    opcode: number,
    listener: (this: WebSocket, evt: MessageEvent<ArrayBuffer>) => void
  ): () => void {
    const operation: WebSocketOperation =
      this.getOrCreateOpcodeEventTarget(opcode);
    operation.addEventListener("message", listener);
    return () => operation.removeEventListener("message", listener);
  }

  dispatchOpcode(opcode: number, event: MessageEvent<ArrayBuffer>): void {
    const operation: WebSocketOperation | undefined =
      this.operationDictionary.get(opcode);
    if (operation !== undefined) {
      operation.dispatchEvent(event);
    }
  }

  sendPacket(buffer: ByteBuffer): void {
    this.socket.send(buffer.toArray());
  }

  close(code?: number, reason?: string): void {
    this.socket.close(code, reason);
  }
}

interface WebSocketOperationEventMap {
  message: MessageEvent<ArrayBuffer>;
}

class WebSocketOperation extends EventTarget {
  override addEventListener<K extends keyof WebSocketOperationEventMap>(
    type: K,
    callback: (this: WebSocket, evt: WebSocketOperationEventMap[K]) => void,
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

  override removeEventListener<K extends keyof WebSocketOperationEventMap>(
    type: K,
    callback: (this: WebSocket, ev: WebSocketOperationEventMap[K]) => void,
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
