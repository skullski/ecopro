import { EventEmitter } from 'events';

export type SecurityEventPayload = {
  id?: number | null;
  created_at?: string | null;
  event_type?: string;
  severity?: string | null;
  method?: string | null;
  path?: string | null;
  status_code?: number | null;
  ip?: string | null;
  user_agent?: string | null;
  fingerprint?: string | null;
  country_code?: string | null;
  region?: string | null;
  city?: string | null;
  user_id?: string | null;
  user_type?: string | null;
  role?: string | null;
  metadata?: any;
};

const bus = new EventEmitter();
bus.setMaxListeners(200);

export function emitSecurityEvent(e: SecurityEventPayload) {
  try {
    bus.emit('security:event', e);
  } catch {
    // ignore
  }
}

export function onSecurityEvent(cb: (e: SecurityEventPayload) => void) {
  bus.on('security:event', cb);
  return () => bus.off('security:event', cb);
}

export default bus;
