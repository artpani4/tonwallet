import * as base64 from 'https://deno.land/std@0.184.0/encoding/base64.ts';
import { Buffer } from 'https://deno.land/std@0.177.0/node/buffer.ts';
export function bufToStr(buf: Buffer) {
  return base64.encode(buf.buffer);
}

export function strToBuf(str: string) {
  return Buffer.from(base64.decode(str));
}
