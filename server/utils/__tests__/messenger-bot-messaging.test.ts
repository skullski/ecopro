import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import {
  sendMessengerMessageDirect,
  sendMessengerOrderConfirmationDirect,
} from '../bot-messaging';

describe('Messenger bot messaging payloads', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn(async (_url: any, _init: any) => {
      return {
        ok: true,
        status: 200,
        json: async () => ({ message_id: 'mid.123' }),
      } as any;
    }) as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('sendMessengerMessageDirect uses MESSAGE_TAG (POST_PURCHASE_UPDATE)', async () => {
    const res = await sendMessengerMessageDirect('PAGE_TOKEN', 'PSID_1', 'hello');
    expect(res.success).toBe(true);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [_url, init] = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(init.body);

    expect(body.messaging_type).toBe('MESSAGE_TAG');
    expect(body.tag).toBe('POST_PURCHASE_UPDATE');
    expect(body.recipient.id).toBe('PSID_1');
    expect(body.message.text).toBe('hello');
  });

  it('sendMessengerOrderConfirmationDirect sends button template with approve/decline postbacks (MESSAGE_TAG)', async () => {
    const res = await sendMessengerOrderConfirmationDirect('PAGE_TOKEN', 'PSID_2', {
      text: 'Please confirm',
      orderId: 42,
    });
    expect(res.success).toBe(true);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [_url, init] = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(init.body);

    expect(body.messaging_type).toBe('MESSAGE_TAG');
    expect(body.tag).toBe('POST_PURCHASE_UPDATE');

    const buttons = body.message.attachment.payload.buttons;
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toMatchObject({
      type: 'postback',
      title: '✅ Confirm',
      payload: 'CONFIRM_ORDER_42',
    });
    expect(buttons[1]).toMatchObject({
      type: 'postback',
      title: '❌ Decline',
      payload: 'DECLINE_ORDER_42',
    });
  });
});
