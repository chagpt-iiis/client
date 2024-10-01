export type base64UrlString = string;
export type base64String = string;
export type binaryString = string;
export type hexString = string;
export type BufferEntry = base64UrlString | base64String | binaryString | Uint8Array | hexString | bigint;
export type BufferTransform = (x: BufferEntry) => BufferEntry;
