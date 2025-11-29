import { Router } from "express";
import { db, addMessage } from "../lib/db";
import { messageBodySchema } from "../lib/validators";

export const chatRouter = Router();

chatRouter.use((req, _res, next) => {
  (req as any).userId = req.header("X-User-Id") || "u_buyer";
  next();
});

chatRouter.get("/conversations/:id/messages", (req, res) => {
  const conv = db.conversations.get(req.params.id);
  if (!conv) return res.status(404).json({ error: "Conversation not found" });
  const messages = db.messages.get(conv.id) ?? [];
  res.json({ items: messages });
});

chatRouter.post("/conversations/:id/messages", (req, res) => {
  const userId = (req as any).userId as string;
  const conv = db.conversations.get(req.params.id);
  if (!conv) return res.status(404).json({ error: "Conversation not found" });

  const parsed = messageBodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

  const toUserId = userId === conv.buyerId ? conv.sellerId : conv.buyerId;
  const msg = addMessage(conv.id, {
    conversationId: conv.id,
    productId: conv.productId,
    fromUserId: userId,
    toUserId,
    body: parsed.data.body,
  });
  res.status(201).json(msg);
});

chatRouter.get("/conversations", (req, res) => {
  const userId = (req as any).userId as string;
  const items = Array.from(db.conversations.values()).filter(
    (c) => c.buyerId === userId || c.sellerId === userId
  );
  res.json({ items });
});
