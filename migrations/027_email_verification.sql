-- Email Verification Codes Table
-- Stores temporary verification codes sent during signup

CREATE TABLE IF NOT EXISTS email_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Index for fast lookups
    UNIQUE(email, code)
);

-- Index for cleanup of expired codes
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires ON email_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);

-- Cleanup function for expired codes (run periodically)
-- DELETE FROM email_verifications WHERE expires_at < NOW();
