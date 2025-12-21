// Google Sheets API Routes
// Handles OAuth, import, and mapping operations

import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../utils/database';
import { googleSheetsService } from '../services/google-sheets';
import {
  GoogleConnectSchema,
  ImportMappingSchema,
  ImportRequestSchema,
} from '../types/google-sheets';
import { ZodError } from 'zod';

const router = Router();

// Middleware to require authentication
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const clientId = (req.user as any)?.clientId;
  if (!clientId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

/**
 * GET /api/google/auth-url
 * Get OAuth authorization URL
 */
router.get('/auth-url', (req: Request, res: Response) => {
  try {
    const url = googleSheetsService.getAuthorizationUrl();
    res.json({ url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/google/connect
 * OAuth callback - exchange code for tokens and save
 */
router.post('/connect', requireAuth, async (req: Request, res: Response) => {
  const clientId = (req.user as any)?.clientId;

  try {
    const { code, state } = GoogleConnectSchema.parse(req.body);

    // Exchange code for tokens
    const tokens = await googleSheetsService.getTokensFromCode(code);

    // Save tokens to database
    await googleSheetsService.saveTokens(clientId, tokens);

    res.json({
      success: true,
      message: 'Google account connected successfully',
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Invalid request',
        details: error.errors,
      });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/google/status
 * Check if Google account is connected
 */
router.get('/status', requireAuth, async (req: Request, res: Response) => {
  const clientId = (req.user as any)?.clientId;

  try {
    const result = await pool.query(
      `SELECT client_id, is_active, expires_at, updated_at 
       FROM google_tokens 
       WHERE client_id = $1`,
      [clientId]
    );

    if (result.rows.length === 0) {
      return res.json({ connected: false });
    }

    const token = result.rows[0];
    res.json({
      connected: token.is_active,
      expiresAt: token.expires_at,
      lastUpdated: token.updated_at,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/google/sheets/:spreadsheetId
 * List sheets in a spreadsheet
 */
router.get('/sheets/:spreadsheetId', requireAuth, async (req: Request, res: Response) => {
  const clientId = (req.user as any)?.clientId;
  const { spreadsheetId } = req.params;

  try {
    const accessToken = await googleSheetsService.getValidTokens(clientId);
    const metadata = await googleSheetsService.listSheets(accessToken, spreadsheetId);

    res.json(metadata);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/google/preview
 * Preview data from a sheet range
 */
router.post('/preview', requireAuth, async (req: Request, res: Response) => {
  const clientId = (req.user as any)?.clientId;

  try {
    const { spreadsheetId, range, limit = 10 } = req.body;

    if (!spreadsheetId || !range) {
      return res.status(400).json({
        error: 'spreadsheetId and range are required',
      });
    }

    const accessToken = await googleSheetsService.getValidTokens(clientId);
    const rows = await googleSheetsService.readRange(
      accessToken,
      spreadsheetId,
      range
    );

    res.json({
      total: rows.length,
      preview: rows.slice(0, limit),
      headers: rows.length > 0 ? Object.keys(rows[0]) : [],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/google/mappings
 * Save or update a column mapping
 */
router.post('/mappings', requireAuth, async (req: Request, res: Response) => {
  const clientId = (req.user as any)?.clientId;

  try {
    const data = ImportMappingSchema.parse(req.body);

    await pool.query(
      `INSERT INTO import_mappings 
       (client_id, mapping_name, import_type, column_mapping, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (client_id, mapping_name)
       DO UPDATE SET column_mapping = $4, updated_at = NOW()`,
      [clientId, data.mapping_name, data.import_type, JSON.stringify(data.column_mapping)]
    );

    res.json({
      success: true,
      message: 'Mapping saved successfully',
      mapping_name: data.mapping_name,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Invalid mapping',
        details: error.errors,
      });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/google/mappings
 * Get all saved mappings for the client
 */
router.get('/mappings', requireAuth, async (req: Request, res: Response) => {
  const clientId = (req.user as any)?.clientId;
  const { importType } = req.query;

  try {
    let query = `SELECT mapping_name, import_type, column_mapping, created_at, updated_at
                 FROM import_mappings
                 WHERE client_id = $1`;
    const params: any[] = [clientId];

    if (importType) {
      query += ` AND import_type = $2`;
      params.push(importType);
    }

    query += ` ORDER BY updated_at DESC`;

    const result = await pool.query(query, params);

    const mappings = result.rows.map((row) => ({
      mapping_name: row.mapping_name,
      import_type: row.import_type,
      column_mapping: row.column_mapping,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    res.json(mappings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/google/import
 * Start an import job
 */
router.post('/import', requireAuth, async (req: Request, res: Response) => {
  const clientId = (req.user as any)?.clientId;

  try {
    const data = ImportRequestSchema.parse(req.body);

    // Get access token
    const accessToken = await googleSheetsService.getValidTokens(clientId);

    // Read sheet data
    const rows = await googleSheetsService.readRange(
      accessToken,
      data.spreadsheet_id,
      data.data_range || 'A:Z'
    );

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: 'No data found in sheet',
        totalRows: 0,
        successfulImports: 0,
        failedRows: 0,
      });
    }

    // Map and validate rows based on import type
    let validRows: any[] = [];
    let errorMap = new Map<number, string>();

    if (data.import_type === 'orders') {
      const result = googleSheetsService.mapRowsToOrders(rows, data.column_mapping);
      validRows = result.valid;
      errorMap = result.errors;
    } else if (data.import_type === 'customers') {
      const result = googleSheetsService.mapRowsToCustomers(rows, data.column_mapping);
      validRows = result.valid;
      errorMap = result.errors;
    } else if (data.import_type === 'products') {
      const result = googleSheetsService.mapRowsToProducts(rows, data.column_mapping);
      validRows = result.valid;
      errorMap = result.errors;
    }

    // Create import job record
    const jobResult = await pool.query(
      `INSERT INTO import_jobs 
       (client_id, import_type, spreadsheet_id, sheet_range, total_rows, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'completed', NOW(), NOW())
       RETURNING id`,
      [
        clientId,
        data.import_type,
        data.spreadsheet_id,
        data.data_range || 'A:Z',
        rows.length,
      ]
    );

    const jobId = jobResult.rows[0].id;

    // Log import details
    await pool.query(
      `UPDATE import_jobs 
       SET successful_imports = $1, failed_rows = $2, error_details = $3
       WHERE id = $4`,
      [validRows.length, errorMap.size, JSON.stringify(Array.from(errorMap)), jobId]
    );

    // Log each row (optionally - could be deferred for large imports)
    if (validRows.length > 0) {
      const values = validRows
        .map(
          (row, idx) =>
            `(${jobId}, ${idx + 1}, 'success', '${JSON.stringify(row).replace(/'/g, "''")}')`
        )
        .join(',');

      await pool.query(
        `INSERT INTO import_logs (import_job_id, row_number, status, mapped_data)
         VALUES ${values}`
      );
    }

    res.json({
      success: validRows.length > 0,
      jobId,
      totalRows: rows.length,
      successfulImports: validRows.length,
      failedRows: errorMap.size,
      errors: errorMap.size > 0 ? Object.fromEntries(errorMap) : null,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Invalid import request',
        details: error.errors,
      });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/google/imports
 * Get import history for the client
 */
router.get('/imports', requireAuth, async (req: Request, res: Response) => {
  const clientId = (req.user as any)?.clientId;
  const { limit = 20, offset = 0, importType } = req.query;

  try {
    let query = `SELECT id, import_type, total_rows, successful_imports, failed_rows, status, created_at
                 FROM import_jobs
                 WHERE client_id = $1`;
    const params: any[] = [clientId];

    if (importType) {
      query += ` AND import_type = $${params.length + 1}`;
      params.push(importType);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await pool.query(query, params);

    res.json({
      imports: result.rows,
      total: result.rows.length,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/google/imports/:jobId
 * Get details of a specific import job
 */
router.get('/imports/:jobId', requireAuth, async (req: Request, res: Response) => {
  const clientId = (req.user as any)?.clientId;
  const { jobId } = req.params;

  try {
    const jobResult = await pool.query(
      `SELECT id, import_type, total_rows, successful_imports, failed_rows, status, error_details, created_at
       FROM import_jobs
       WHERE id = $1 AND client_id = $2`,
      [jobId, clientId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Import job not found' });
    }

    const job = jobResult.rows[0];

    // Get log details
    const logsResult = await pool.query(
      `SELECT row_number, status, mapped_data, error_message
       FROM import_logs
       WHERE import_job_id = $1
       ORDER BY row_number`,
      [jobId]
    );

    res.json({
      ...job,
      logs: logsResult.rows,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/google/disconnect
 * Disconnect Google account
 */
router.post('/disconnect', requireAuth, async (req: Request, res: Response) => {
  const clientId = (req.user as any)?.clientId;

  try {
    await pool.query(
      `UPDATE google_tokens
       SET is_active = false, updated_at = NOW()
       WHERE client_id = $1`,
      [clientId]
    );

    res.json({
      success: true,
      message: 'Google account disconnected',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
