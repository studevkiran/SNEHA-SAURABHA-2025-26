-- database/whatsapp-send-log-table.sql
-- Create table to track bulk WhatsApp sends

CREATE TABLE IF NOT EXISTS whatsapp_send_log (
  id SERIAL PRIMARY KEY,
  mode VARCHAR(50) NOT NULL,              -- 'single', 'selected', 'all', 'sponsors'
  total_count INTEGER DEFAULT 0,          -- Total registrations attempted
  sent_count INTEGER DEFAULT 0,           -- Successfully sent
  failed_count INTEGER DEFAULT 0,         -- Failed sends
  filters JSONB,                          -- Filter criteria used
  errors JSONB,                           -- Array of error details
  sent_by VARCHAR(255),                   -- Admin user who triggered send
  sent_at TIMESTAMP DEFAULT NOW(),        -- When bulk send was executed
  duration_seconds INTEGER,               -- How long it took
  notes TEXT                              -- Optional notes
);

-- Index for querying send history
CREATE INDEX idx_whatsapp_log_date ON whatsapp_send_log(sent_at DESC);
CREATE INDEX idx_whatsapp_log_mode ON whatsapp_send_log(mode);

-- View for send statistics
CREATE OR REPLACE VIEW whatsapp_send_stats AS
SELECT 
  mode,
  COUNT(*) as send_count,
  SUM(total_count) as total_attempted,
  SUM(sent_count) as total_sent,
  SUM(failed_count) as total_failed,
  ROUND(AVG(sent_count::NUMERIC / NULLIF(total_count, 0) * 100), 2) as avg_success_rate,
  MAX(sent_at) as last_sent
FROM whatsapp_send_log
GROUP BY mode
ORDER BY send_count DESC;

COMMENT ON TABLE whatsapp_send_log IS 'Tracks bulk WhatsApp confirmation sends for auditing';
COMMENT ON VIEW whatsapp_send_stats IS 'Summary statistics of WhatsApp send operations';
