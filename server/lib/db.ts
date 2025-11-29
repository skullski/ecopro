import { Address, ChatMessage, Conversation, ID, Order, Product, Review, User } from "@shared/marketplace";

const now = () => Date.now();
const id = () => Math.random().toString(36).slice(2);

export const db = {
  users: new Map<ID, User>(),
  products: new Map<ID, Product>(),
  reviews: new Map<ID, Review>(),
  orders: new Map<ID, Order>(),
  conversations: new Map<ID, Conversation>(),
  messages: new Map<ID, ChatMessage[]>(), // by conversationId
};

function seed() {
  if (db.users.size > 0) return;

  const seller: User = {
    id: "u_seller",
    name: "Seller One",
    email: "seller@example.com",
    addresses: [],
  };
  const buyer: User = {
    id: "u_buyer",
    name: "Buyer One",
    email: "buyer@example.com",
    addresses: [
      {
        id: "addr1",
        line1: "123 Market St",
        city: "Metropolis",
        postalCode: "12345",
        country: "US",
        phone: "555-555-5555",
      },
    ],
    defaultAddressId: "addr1",
  };
  db.users.set(seller.id, seller);
  db.users.set(buyer.id, buyer);

  const p1: Product = {
    id: "p1",
    title: "Eco Bottle",
    description: "Reusable stainless steel bottle.",
    price: 2999,
    sellerId: seller.id,
    likes: new Set<ID>(),
    createdAt: now(),
    imageUrl: "https://picsum.photos/seed/bottle/600/400",
  };
  const p2: Product = {
    id: "p2",
    title: "Organic Tote Bag",
    description: "Durable tote bag made from organic cotton.",
    price: 1999,
    sellerId: seller.id,
    likes: new Set<ID>(),
    createdAt: now(),
    imageUrl: "https://picsum.photos/seed/tote/600/400",
  };
  db.products.set(p1.id, p1);
  db.products.set(p2.id, p2);

  const r1: Review = {
    id: id(),
    productId: p1.id,
    userId: buyer.id,
    rating: 5,
    comment: "Great quality and keeps water cold!",
    createdAt: now(),
  };
  db.reviews.set(r1.id, r1);
}
seed();

export function getUserOrThrow(userId: ID): User {
  const u = db.users.get(userId);
  if (!u) throw new Error("User not found");
  return u;
}

export function ensureConversation(productId: ID, buyerId: ID, sellerId: ID): Conversation {
  for (const conv of db.conversations.values()) {
    if (conv.productId === productId && conv.buyerId === buyerId && conv.sellerId === sellerId) {
      return conv;
    }
  }
  const conv: Conversation = {
    id: id(),
    productId,
    buyerId,
    sellerId,
    createdAt: now(),
  };
  db.conversations.set(conv.id, conv);
  db.messages.set(conv.id, []);
  return conv;
}

export function addMessage(convId: ID, msg: Omit<ChatMessage, "id" | "createdAt">): ChatMessage {
  const full: ChatMessage = { id: id(), createdAt: now(), ...msg };
  const arr = db.messages.get(convId) ?? [];
  arr.push(full);
  db.messages.set(convId, arr);
  const conv = db.conversations.get(convId);
  if (conv) conv.lastMessageAt = full.createdAt;
  return full;
}
