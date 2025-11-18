
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || '',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default pool;

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
function writeUsers(users: any) {
  throw new Error('Function not implemented.');
}


// Define User interface locally to fix import error
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: string;
}

/**
 * Read users from the database (stub implementation)
 */
async function readUsers(): Promise<User[]> {
  // TODO: Replace this stub with actual DB logic
  return [];
}

