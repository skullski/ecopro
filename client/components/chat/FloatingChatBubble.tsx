import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, ArrowLeft } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { safeJsonParse } from '@/utils/safeJson';
import { apiFetch } from '@/lib/api';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';

const POS_KEY = 'floating_chat_bubble_pos_v1';
const HIDDEN_KEY = 'floating_chat_bubble_hidden_v1';
const CHAT_LAST_SEEN_KEY = 'chat_last_seen_at';
const PHONE_POS_KEY = 'floating_chat_phone_pos_v1';
const PHONE_SIZE_KEY = 'floating_chat_phone_size_v1';
const DOCKED_KEY = 'floating_chat_docked_v1';

type Pos = { x: number; y: number };
type Size = { w: number; h: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function FloatingChatBubble() {
  const location = useLocation();
  const { unreadMessagesCount } = useNotifications();

  const user = typeof window !== 'undefined' ? safeJsonParse(localStorage.getItem('user'), null as any) : null;
  const isAdmin = user?.role === 'admin' || user?.user_type === 'admin';
  const userRole: 'client' | 'admin' = isAdmin ? 'admin' : 'client';
  const userId: number = Number(user?.clientId || user?.id || 0);

  const isHiddenSurface = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith('/store/')) return true;
    if (p.startsWith('/kernel-portal')) return true;
    if (p === '/platform-admin/chat' || p === '/chat') return true;
    return false;
  }, [location.pathname]);

  const [hidden, setHidden] = useState<boolean>(() => {
    const saved = localStorage.getItem(HIDDEN_KEY);
    return safeJsonParse(saved, false);
  });

  const [pos, setPos] = useState<Pos>(() => {
    const saved = localStorage.getItem(POS_KEY);
    const parsed = safeJsonParse(saved, null as any);
    if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
      return parsed;
    }
    return { x: 20, y: 120 };
  });

  const [docked, setDocked] = useState<boolean>(() => {
    const saved = localStorage.getItem(DOCKED_KEY);
    const parsed = safeJsonParse(saved, true);
    return typeof parsed === 'boolean' ? parsed : true;
  });

  const [phoneSize, setPhoneSize] = useState<Size>(() => {
    const saved = localStorage.getItem(PHONE_SIZE_KEY);
    const parsed = safeJsonParse(saved, null as any);
    if (parsed && typeof parsed.w === 'number' && typeof parsed.h === 'number') {
      return { w: parsed.w, h: parsed.h };
    }
    return { w: 360, h: 620 };
  });

  const [phonePos, setPhonePos] = useState<Pos>(() => {
    const saved = localStorage.getItem(PHONE_POS_KEY);
    const parsed = safeJsonParse(saved, null as any);
    if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
      return parsed;
    }
    // Default: docked next to bubble
    return { x: 92, y: 120 };
  });

  const draggingRef = useRef(false);
  const dragStartRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const lastPointerIdRef = useRef<number | null>(null);

  const bubblePosRef = useRef<Pos>(pos);
  useEffect(() => {
    bubblePosRef.current = pos;
  }, [pos]);

  const [open, setOpen] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const openFromRef = useRef<{ x: number; y: number } | null>(null);
  const [chatId, setChatId] = useState<number | null>(null);
  const [adminSelectedChatId, setAdminSelectedChatId] = useState<number | null>(null);
  const [bootingChat, setBootingChat] = useState(false);

  const phoneDraggingRef = useRef(false);
  const phoneDragStartRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const phonePointerIdRef = useRef<number | null>(null);

  const resizingRef = useRef(false);
  const resizeStartRef = useRef<{ px: number; py: number; ow: number; oh: number } | null>(null);
  const resizePointerIdRef = useRef<number | null>(null);

  // Auto-unhide if new messages arrive
  useEffect(() => {
    if (unreadMessagesCount > 0) {
      setHidden(false);
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(false));
    }
  }, [unreadMessagesCount]);

  // Ensure the client has an admin chat when opening
  useEffect(() => {
    const ensureChat = async () => {
      if (!open) return;
      if (!user || !userId) return;

      // Mark chat as "seen" when opening messenger
      localStorage.setItem(CHAT_LAST_SEEN_KEY, new Date().toISOString());
      window.dispatchEvent(new CustomEvent('ecopro:chat-seen'));

      if (isAdmin) return;
      if (chatId) return;

      setBootingChat(true);
      try {
        const resp = await apiFetch<any>('/api/chat/create-admin-chat', {
          method: 'POST',
          body: JSON.stringify({ tier: 'support' }),
        });
        const id = Number(resp?.chat?.id ?? resp?.chat_id ?? resp?.chatId ?? resp?.id);
        if (Number.isFinite(id) && id > 0) {
          setChatId(id);
        }
      } catch {
        // ignore
      } finally {
        setBootingChat(false);
      }
    };

    void ensureChat();
  }, [open, user, userId, isAdmin, chatId]);

  // Keep position in bounds on resize
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setPos((p) => ({
        x: clamp(p.x, 8, Math.max(8, w - 72)),
        y: clamp(p.y, 8, Math.max(8, h - 72)),
      }));

      setPhonePos((p) => ({
        x: clamp(p.x, 8, Math.max(8, w - phoneSize.w - 8)),
        y: clamp(p.y, 8, Math.max(8, h - phoneSize.h - 8)),
      }));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [phoneSize.h, phoneSize.w]);

  useEffect(() => {
    localStorage.setItem(POS_KEY, JSON.stringify(pos));
  }, [pos]);

  useEffect(() => {
    localStorage.setItem(PHONE_POS_KEY, JSON.stringify(phonePos));
  }, [phonePos]);

  useEffect(() => {
    localStorage.setItem(PHONE_SIZE_KEY, JSON.stringify(phoneSize));
  }, [phoneSize]);

  useEffect(() => {
    localStorage.setItem(DOCKED_KEY, JSON.stringify(docked));
  }, [docked]);

  // If docked, keep the phone tethered to bubble.
  useEffect(() => {
    if (!docked) return;
    setPhonePos((p) => {
      // If user already positioned it once, keep relative offset.
      const offsetX = p.x - bubblePosRef.current.x;
      const offsetY = p.y - bubblePosRef.current.y;
      // If offset is tiny/invalid, choose a nice default.
      const ox = Number.isFinite(offsetX) && Math.abs(offsetX) > 12 ? offsetX : 72;
      const oy = Number.isFinite(offsetY) && Math.abs(offsetY) > 12 ? offsetY : -20;
      const w = window.innerWidth;
      const h = window.innerHeight;
      return {
        x: clamp(bubblePosRef.current.x + ox, 8, Math.max(8, w - phoneSize.w - 8)),
        y: clamp(bubblePosRef.current.y + oy, 8, Math.max(8, h - phoneSize.h - 8)),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docked]);

  if (!user) return null;
  if (hidden || isHiddenSurface) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = false;
    lastPointerIdRef.current = e.pointerId;
    dragStartRef.current = { px: e.clientX, py: e.clientY, ox: pos.x, oy: pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (lastPointerIdRef.current !== e.pointerId) return;
    const start = dragStartRef.current;
    if (!start) return;

    const dx = e.clientX - start.px;
    const dy = e.clientY - start.py;

    if (Math.abs(dx) + Math.abs(dy) > 6) draggingRef.current = true;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const nextBubble = {
      x: clamp(start.ox + dx, 8, Math.max(8, w - 72)),
      y: clamp(start.oy + dy, 8, Math.max(8, h - 72)),
    };

    setPos(nextBubble);

    if (open && docked) {
      // Move the phone with the bubble
      setPhonePos((pp) => ({
        x: clamp(pp.x + (nextBubble.x - bubblePosRef.current.x), 8, Math.max(8, w - phoneSize.w - 8)),
        y: clamp(pp.y + (nextBubble.y - bubblePosRef.current.y), 8, Math.max(8, h - phoneSize.h - 8)),
      }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (lastPointerIdRef.current !== e.pointerId) return;
    lastPointerIdRef.current = null;
    dragStartRef.current = null;

    if (!draggingRef.current) {
      // record bubble center for open animation
      openFromRef.current = { x: pos.x + 28, y: pos.y + 28 };
      setOpen(true);
    }
  };

  const closeMessenger = () => {
    setOpen(false);
    setAnimateIn(false);
  };

  const activeChatId = isAdmin ? adminSelectedChatId : chatId;

  // Kick off animation after open
  useEffect(() => {
    if (!open) return;
    setAnimateIn(false);
    const raf = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // Allow quick hide via Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMessenger();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const phoneCenter = {
    x: phonePos.x + phoneSize.w / 2,
    y: phonePos.y + phoneSize.h / 2,
  };

  const from = openFromRef.current;
  const openTransform = from
    ? `translate(${from.x - phoneCenter.x}px, ${from.y - phoneCenter.y}px) scale(0.18)`
    : 'scale(0.18)';

  const onPhonePointerDown = (e: React.PointerEvent) => {
    // Don't start dragging when interacting with header controls
    const target = e.target as HTMLElement | null;
    if (target && target.closest('button, a, input, textarea, select')) return;
    // only drag with primary button/touch
    phoneDraggingRef.current = false;
    phonePointerIdRef.current = e.pointerId;
    phoneDragStartRef.current = { px: e.clientX, py: e.clientY, ox: phonePos.x, oy: phonePos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPhonePointerMove = (e: React.PointerEvent) => {
    if (phonePointerIdRef.current !== e.pointerId) return;
    const start = phoneDragStartRef.current;
    if (!start) return;

    const dx = e.clientX - start.px;
    const dy = e.clientY - start.py;
    if (Math.abs(dx) + Math.abs(dy) > 4) phoneDraggingRef.current = true;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const nextPhone = {
      x: clamp(start.ox + dx, 8, Math.max(8, w - phoneSize.w - 8)),
      y: clamp(start.oy + dy, 8, Math.max(8, h - phoneSize.h - 8)),
    };

    setPhonePos(nextPhone);

    if (docked) {
      // Keep bubble and phone wired together
      setPos((bp) => ({
        x: clamp(bp.x + dx, 8, Math.max(8, w - 72)),
        y: clamp(bp.y + dy, 8, Math.max(8, h - 72)),
      }));
    }
  };

  const onPhonePointerUp = (e: React.PointerEvent) => {
    if (phonePointerIdRef.current !== e.pointerId) return;
    phonePointerIdRef.current = null;
    phoneDragStartRef.current = null;
  };

  const onResizeHandleDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    resizingRef.current = true;
    resizePointerIdRef.current = e.pointerId;
    resizeStartRef.current = { px: e.clientX, py: e.clientY, ow: phoneSize.w, oh: phoneSize.h };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onResizeHandleMove = (e: React.PointerEvent) => {
    if (resizePointerIdRef.current !== e.pointerId) return;
    const start = resizeStartRef.current;
    if (!start) return;
    const dx = e.clientX - start.px;
    const dy = e.clientY - start.py;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const nextSize = {
      w: clamp(start.ow + dx, 300, Math.max(300, w - phonePos.x - 8)),
      h: clamp(start.oh + dy, 380, Math.max(380, h - phonePos.y - 8)),
    };
    setPhoneSize(nextSize);
  };

  const onResizeHandleUp = (e: React.PointerEvent) => {
    if (resizePointerIdRef.current !== e.pointerId) return;
    resizePointerIdRef.current = null;
    resizeStartRef.current = null;
    resizingRef.current = false;
  };

  return (
    <>
      {/* Bubble */}
      <div
        className="fixed z-[9999]"
        style={{ left: pos.x, top: pos.y }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="relative">
          <button
            type="button"
            className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-600 shadow-2xl border border-white/20 flex items-center justify-center text-white hover:from-indigo-700 hover:to-cyan-700 transition-colors"
            aria-label="Open messenger"
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          {unreadMessagesCount > 0 && (
            <div
              className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse"
              aria-label={`${unreadMessagesCount} unread messages`}
            >
              {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setHidden(true);
              localStorage.setItem(HIDDEN_KEY, JSON.stringify(true));
            }}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center border border-white/20 hover:bg-black/80"
            aria-label="Hide chat bubble"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Phone-style messenger (modeless window) */}
      {open && (
        <div className="fixed inset-0 z-[10000] pointer-events-none">
          <div
            className="absolute pointer-events-auto"
            style={{
              left: phonePos.x,
              top: phonePos.y,
              width: phoneSize.w,
              height: phoneSize.h,
              filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.35))',
              transition: animateIn ? 'transform 240ms ease, opacity 240ms ease' : 'none',
              transform: animateIn ? 'translate(0px, 0px) scale(1)' : openTransform,
              opacity: animateIn ? 1 : 0.5,
              transformOrigin: 'center',
            }}
          >
            <div className="relative h-full rounded-[2.25rem] bg-slate-950 border border-white/15 overflow-hidden">
              {/* Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full bg-black/40 border border-white/10" />

              {/* Draggable header */}
              <div
                className="absolute top-0 left-0 right-0 h-14 pt-6 px-3 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent cursor-grab active:cursor-grabbing"
                onPointerDown={onPhonePointerDown}
                onPointerMove={onPhonePointerMove}
                onPointerUp={onPhonePointerUp}
                aria-label="Move messenger"
              >
                <div className="flex items-center gap-2">
                  {isAdmin && activeChatId && (
                    <button
                      type="button"
                      className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 text-white flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAdminSelectedChatId(null);
                      }}
                      aria-label="Back"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <div className="text-white select-none">
                    <div className="text-xs opacity-80">Support</div>
                    <div className="text-sm font-semibold">Messenger</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`px-2 h-9 rounded-xl text-xs font-semibold border transition ${
                      docked
                        ? 'bg-white/10 hover:bg-white/15 text-white border-white/15'
                        : 'bg-amber-500/15 hover:bg-amber-500/20 text-amber-200 border-amber-300/25'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDocked((d) => !d);
                    }}
                    aria-label={docked ? 'Undock messenger' : 'Dock messenger'}
                    title={docked ? 'Docked' : 'Free move'}
                  >
                    {docked ? 'Docked' : 'Free'}
                  </button>

                  <button
                    type="button"
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 text-white flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeMessenger();
                    }}
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="pt-14 h-full">
                {isAdmin ? (
                  activeChatId ? (
                    <div className="h-full bg-white">
                      <ChatWindow chatId={activeChatId} userRole="admin" userId={userId} onClose={closeMessenger} />
                    </div>
                  ) : (
                    <div className="h-full">
                      <ChatList
                        userRole="admin"
                        selectedChatId={adminSelectedChatId ?? undefined}
                        onSelectChat={(id) => setAdminSelectedChatId(id)}
                      />
                    </div>
                  )
                ) : (
                  <div className="h-full bg-white">
                    {bootingChat || !activeChatId ? (
                      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3" />
                          <p className="text-gray-700 font-medium">Opening support…</p>
                        </div>
                      </div>
                    ) : (
                      <ChatWindow chatId={activeChatId} userRole={userRole} userId={userId} onClose={closeMessenger} />
                    )}
                  </div>
                )}
              </div>

              {/* Resize handle */}
              <div
                className="absolute bottom-2 right-2 w-6 h-6 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15"
                onPointerDown={onResizeHandleDown}
                onPointerMove={onResizeHandleMove}
                onPointerUp={onResizeHandleUp}
                role="separator"
                aria-label="Resize messenger"
                style={{ cursor: 'nwse-resize' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
