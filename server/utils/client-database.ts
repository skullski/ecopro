/**
 * Database utilities for client users
 */
import { pool } from "./database";

export interface Client {
  id: number;
  email: string;
  password: string;
  name: string;
  company_name?: string;
  phone?: string;
  address?: string;
  role: string;
  subscription_tier: string;
  subscription_status: string;
  stripe_customer_id?: string;
  subscription_ends_at?: Date;
  features?: any;
  created_at: Date;
  updated_at: Date;
}

/**
 * Find client by email
 */
export async function findClientByEmail(email: string): Promise<Client | null> {
  const result = await pool.query(
    "SELECT * FROM clients WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
}

/**
 * Find client by ID
 */
export async function findClientById(id: string | number): Promise<Client | null> {
  const result = await pool.query(
    "SELECT * FROM clients WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Create new client
 */
export async function createClient(client: {
  email: string;
  password: string;
  name: string;
  company_name?: string;
  phone?: string;
  role?: string;
}): Promise<Client> {
  const result = await pool.query(
    `INSERT INTO clients (email, password, name, company_name, phone, role) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [
      client.email, 
      client.password, 
      client.name, 
      client.company_name || null,
      client.phone || null,
      client.role || 'client'
    ]
  );
  return result.rows[0];
}

/**
 * Update client
 */
export async function updateClient(
  id: string | number,
  updates: Partial<Client>
): Promise<Client | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== "id" && key !== "created_at") {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    return findClientById(id);
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE clients SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

/**
 * Delete client
 */
export async function deleteClient(id: string | number): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM clients WHERE id = $1 RETURNING id",
    [id]
  );
  return result.rowCount !== null && result.rowCount > 0;
}
