import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const DB_PATH = path.join(__dirname, "../../data/users.json");

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "user" | "admin" | "vendor";
  createdAt: string;
}

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  const dataDir = path.dirname(DB_PATH);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

/**
 * Read all users from database
 */
export async function readUsers(): Promise<User[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    return [];
  }
}

/**
 * Write users to database
 */
export async function writeUsers(users: User[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2), "utf-8");
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await readUsers();
  return users.find((u) => u.email === email) || null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  const users = await readUsers();
  return users.find((u) => u.id === id) || null;
}

/**
 * Create new user
 */
export async function createUser(user: Omit<User, "id" | "createdAt">): Promise<User> {
  const users = await readUsers();
  
  const newUser: User = {
    ...user,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  await writeUsers(users);
  
  return newUser;
}

/**
 * Update user
 */
export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const users = await readUsers();
  const index = users.findIndex((u) => u.id === id);
  
  if (index === -1) {
    return null;
  }
  
  users[index] = { ...users[index], ...updates };
  await writeUsers(users);
  
  return users[index];
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<boolean> {
  const users = await readUsers();
  const filteredUsers = users.filter((u) => u.id !== id);
  
  if (filteredUsers.length === users.length) {
    return false; // User not found
  }
  
  await writeUsers(filteredUsers);
  return true;
}

/**
 * Initialize database with default admin user
 */
export async function initializeDatabase(adminPassword: string): Promise<void> {
  const users = await readUsers();
  
  // Check if admin already exists
  const adminExists = users.some((u) => u.email === "admin@ecopro.com");
  
  if (!adminExists) {
    await createUser({
      email: "admin@ecopro.com",
      password: adminPassword,
      name: "Admin User",
      role: "admin",
    });
    console.log("✅ Default admin user created: admin@ecopro.com");
  }
}
