/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { Message } from 'google-protobuf';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { RequestMock } from 'testcafe';

/**
 * Create a grpc web conform response buffer to mock
 * calls. This is copied from the following location:
 * https://github.com/grpc/grpc-web/blob/
 * 48f547f4bb71e6cf4da439f2000d534ace05dc5b/javascript/net/grpc/web/grpcwebclientbase.js#L198-L209
 * @param message The grpc message to encode.
 */
function createResponseBuffer(message: Message): Buffer {
  const serialized = message.serializeBinary();
  let len = serialized.length;
  const bytesArray = [0, 0, 0, 0];
  const payload = new Uint8Array(5 + len);
  for (let i = 3; i >= 0; i--) {
    bytesArray[i] = len % 256;
    len = len >>> 8;
  }
  payload.set(new Uint8Array(bytesArray), 1);
  payload.set(serialized, 5);
  return Buffer.from(payload);
}

const apiHeaders = {
  'access-control-allow-credentials': 'true',
  'access-control-allow-origin': 'http://localhost:4200',
  'access-control-expose-headers': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET, PUT, POST, DELETE, OPTIONS',
  'access-control-max-age': '86400',
  'content-type': 'application/grpc-web+proto',
  'grpc-encoding': 'identity',
  status: '200',
};

export function mock(filter: RegExp, response?: Message): RequestMock {
  return RequestMock()
    .onRequestTo(filter)
    .respond(createResponseBuffer(response ?? new Empty()), 200, apiHeaders);
}
