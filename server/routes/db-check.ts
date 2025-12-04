import type { RequestHandler } from "express";
import { ensureConnection } from "../utils/database";

// Returns basic DB connectivity details to confirm target database
export const handleDbCheck: RequestHandler = async (_req, res) => {
  try {
    const pool = await ensureConnection(2);
    const dbNameResult = await pool.query("SELECT current_database() as db");
    const versionResult = await pool.query("SELECT version() as version");
    const inetAddrResult = await pool.query(
      "SELECT inet_server_addr()::text as addr, inet_server_port() as port"
    );

    res.json({
      ok: true,
      database: dbNameResult.rows[0]?.db ?? null,
      server: versionResult.rows[0]?.version ?? null,
      socket: {
        addr: inetAddrResult.rows[0]?.addr ?? null,
        port: inetAddrResult.rows[0]?.port ?? null,
      },
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
};
