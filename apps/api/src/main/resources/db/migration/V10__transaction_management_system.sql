-- ============================================================================
-- GramMart AI - Enterprise Transaction Management System
-- Migration V10
-- 
-- Creates tables for:
-- - Transaction Audit Trail
-- - Customer Transaction Timeline
-- - Complete modification tracking
-- - Reversal and restoration support
-- ============================================================================

-- ============================================================================
-- Transaction Audits Table
-- Complete audit trail for all transaction modifications
-- ============================================================================

CREATE TABLE transaction_audits (
    id UUID PRIMARY KEY,
    shop_id UUID NOT NULL,
    transaction_id UUID,
    transaction_type VARCHAR(50),
    customer_id UUID,
    target_customer_id UUID,
    action VARCHAR(50) NOT NULL,
    reversal_reason VARCHAR(50),
    custom_reason VARCHAR(500),
    admin_username VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    device_info VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    amount_affected DECIMAL(12,2),
    balance_before DECIMAL(12,2),
    balance_after DECIMAL(12,2),
    notification_sent BOOLEAN DEFAULT FALSE,
    notes VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_audit_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    CONSTRAINT fk_audit_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_target_customer FOREIGN KEY (target_customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_transaction ON transaction_audits(transaction_id, created_at DESC);
CREATE INDEX idx_audit_customer ON transaction_audits(customer_id, created_at DESC);
CREATE INDEX idx_audit_shop_action ON transaction_audits(shop_id, action, created_at DESC);
CREATE INDEX idx_audit_admin ON transaction_audits(admin_username, created_at DESC);
CREATE INDEX idx_audit_reversal ON transaction_audits(shop_id, reversal_reason) WHERE reversal_reason IS NOT NULL;

COMMENT ON TABLE transaction_audits IS 'Complete audit trail for all transaction modifications - never delete';
COMMENT ON COLUMN transaction_audits.transaction_id IS 'ID of the bill, payment, or ledger entry being modified';
COMMENT ON COLUMN transaction_audits.action IS 'Type of modification: BILL_REVERSED, BILL_TRANSFERRED, etc.';
COMMENT ON COLUMN transaction_audits.reversal_reason IS 'Predefined reason code for the reversal/modification';
COMMENT ON COLUMN transaction_audits.custom_reason IS 'Additional details provided by admin';
COMMENT ON COLUMN transaction_audits.old_value IS 'JSON snapshot of state before modification';
COMMENT ON COLUMN transaction_audits.new_value IS 'JSON snapshot of state after modification';

-- ============================================================================
-- Transaction Timeline Table
-- Customer-facing visual timeline of all activities
-- ============================================================================

CREATE TABLE transaction_timeline (
    id UUID PRIMARY KEY,
    shop_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    related_transaction_id UUID,
    event_icon VARCHAR(10),
    event_title VARCHAR(255) NOT NULL,
    event_description VARCHAR(1000),
    amount DECIMAL(12,2),
    balance_after DECIMAL(12,2),
    admin_username VARCHAR(100),
    metadata TEXT,
    is_reversal BOOLEAN DEFAULT FALSE,
    reversal_reason VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_timeline_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    CONSTRAINT fk_timeline_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX idx_timeline_customer_created ON transaction_timeline(customer_id, created_at DESC);
CREATE INDEX idx_timeline_shop_event ON transaction_timeline(shop_id, event_type, created_at DESC);
CREATE INDEX idx_timeline_transaction ON transaction_timeline(related_transaction_id);
CREATE INDEX idx_timeline_reversals ON transaction_timeline(customer_id, is_reversal) WHERE is_reversal = TRUE;
CREATE INDEX idx_timeline_date ON transaction_timeline(customer_id, created_at);

COMMENT ON TABLE transaction_timeline IS 'Customer transaction timeline - visual chronological history';
COMMENT ON COLUMN transaction_timeline.event_type IS 'Type of event: PURCHASE_ADDED, PAYMENT_RECEIVED, etc.';
COMMENT ON COLUMN transaction_timeline.event_icon IS 'Emoji icon for UI display: ✓, 💰, ↩, 🔄, etc.';
COMMENT ON COLUMN transaction_timeline.is_reversal IS 'True if this event represents a reversal/correction';

-- ============================================================================
-- Update Bills Table - Add soft delete support
-- ============================================================================

ALTER TABLE bills ADD COLUMN IF NOT EXISTS reversed BOOLEAN DEFAULT FALSE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS reversed_at TIMESTAMP NULL;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS reversed_by VARCHAR(100) NULL;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS reversal_reason VARCHAR(50) NULL;

CREATE INDEX idx_bills_reversed ON bills(shop_id, reversed, created_at DESC) WHERE reversed = TRUE;

COMMENT ON COLUMN bills.reversed IS 'True if bill has been reversed - never physically deleted';
COMMENT ON COLUMN bills.reversed_at IS 'Timestamp when bill was reversed';
COMMENT ON COLUMN bills.reversed_by IS 'Admin username who reversed the bill';

-- ============================================================================
-- Update Ledger Entries - Add reversal tracking
-- ============================================================================

ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS is_reversal BOOLEAN DEFAULT FALSE;
ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS reversal_reason VARCHAR(50) NULL;
ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS reverses_entry_id UUID NULL;

CREATE INDEX idx_ledger_reversals ON ledger_entries(customer_id, is_reversal) WHERE is_reversal = TRUE;

COMMENT ON COLUMN ledger_entries.is_reversal IS 'True if this entry reverses a previous entry';
COMMENT ON COLUMN ledger_entries.reverses_entry_id IS 'ID of the original entry being reversed';

-- ============================================================================
-- Create View for Transaction History
-- Combined view of bills, payments, and timeline events
-- ============================================================================

CREATE OR REPLACE VIEW customer_transaction_history AS
SELECT 
    t.id,
    t.customer_id,
    t.event_type AS transaction_type,
    t.event_title AS description,
    t.amount,
    t.balance_after,
    t.is_reversal,
    t.reversal_reason,
    t.admin_username,
    t.created_at,
    'TIMELINE' AS source_table
FROM transaction_timeline t
ORDER BY t.created_at DESC;

COMMENT ON VIEW customer_transaction_history IS 'Combined view of all customer transactions for reporting';

-- ============================================================================
-- Create Function for Automatic Timeline Creation
-- Trigger function to auto-create timeline events on certain actions
-- ============================================================================

CREATE OR REPLACE FUNCTION create_timeline_event_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-create timeline event when bill is confirmed
    IF (TG_TABLE_NAME = 'bills' AND NEW.status = 'CONFIRMED' AND (OLD.status IS NULL OR OLD.status != 'CONFIRMED')) THEN
        INSERT INTO transaction_timeline (
            id, shop_id, customer_id, event_type, related_transaction_id,
            event_icon, event_title, event_description, amount, balance_after,
            admin_username, is_reversal, created_at, updated_at
        )
        SELECT 
            gen_random_uuid(),
            NEW.shop_id,
            NEW.customer_id,
            'PURCHASE_ADDED',
            NEW.id,
            '✓',
            'Purchase Added',
            'Credit sale of Rs.' || NEW.total_amount,
            NEW.total_amount,
            (SELECT outstanding_balance FROM customers WHERE id = NEW.customer_id),
            COALESCE(current_setting('app.current_user', true), 'system'),
            FALSE,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP;
    END IF;
    
    -- Auto-create timeline event when bill is reversed
    IF (TG_TABLE_NAME = 'bills' AND NEW.reversed = TRUE AND (OLD.reversed IS NULL OR OLD.reversed = FALSE)) THEN
        INSERT INTO transaction_timeline (
            id, shop_id, customer_id, event_type, related_transaction_id,
            event_icon, event_title, event_description, amount, balance_after,
            admin_username, is_reversal, reversal_reason, created_at, updated_at
        )
        SELECT 
            gen_random_uuid(),
            NEW.shop_id,
            NEW.customer_id,
            'TRANSACTION_REVERSED',
            NEW.id,
            '↩',
            'Transaction Reversed',
            'Bill worth Rs.' || NEW.total_amount || ' reversed',
            -NEW.total_amount,
            (SELECT outstanding_balance FROM customers WHERE id = NEW.customer_id),
            NEW.reversed_by,
            TRUE,
            NEW.reversal_reason,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS bills_timeline_trigger ON bills;
CREATE TRIGGER bills_timeline_trigger
    AFTER INSERT OR UPDATE ON bills
    FOR EACH ROW
    EXECUTE FUNCTION create_timeline_event_trigger();

-- ============================================================================
-- Insert Sample Reversal Reasons Documentation
-- ============================================================================

CREATE TABLE IF NOT EXISTS reversal_reasons_metadata (
    reason_code VARCHAR(50) PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    display_name_ta VARCHAR(100),
    display_name_hi VARCHAR(100),
    description VARCHAR(500),
    severity VARCHAR(20) DEFAULT 'MEDIUM',
    requires_custom_reason BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO reversal_reasons_metadata (reason_code, display_name, display_name_ta, display_name_hi, description, severity) VALUES
('WRONG_CUSTOMER', 'Wrong customer selected', 'தவறான வாடிக்கையாளர்', 'गलत ग्राहक', 'Selected wrong person from customer list', 'MEDIUM'),
('WRONG_PRODUCT', 'Wrong product selected', 'தவறான பொருள்', 'गलत उत्पाद', 'Added incorrect product', 'LOW'),
('WRONG_QUANTITY', 'Incorrect quantity entered', 'தவறான அளவு', 'गलत मात्रा', 'Entered wrong quantity', 'LOW'),
('WRONG_PRICE', 'Incorrect price entered', 'தவறான விலை', 'गलत कीमत', 'Used wrong price', 'MEDIUM'),
('DUPLICATE_ENTRY', 'Duplicate transaction entry', 'நகல் பதிவு', 'डुप्लिकेट एंट्री', 'Same transaction entered twice', 'HIGH'),
('CANCELLED_PURCHASE', 'Purchase cancelled by customer', 'வாங்குதல் ரத்து', 'खरीद रद्द', 'Customer changed mind', 'LOW'),
('PAYMENT_ERROR', 'Payment entered by mistake', 'தவறான பணம்', 'गलत भुगतान', 'Payment recorded incorrectly', 'HIGH'),
('INVENTORY_CORRECTION', 'Inventory count correction', 'சரக்கு திருத்தம்', 'इन्वेंटरी सुधार', 'Stock verification adjustment', 'MEDIUM'),
('CUSTOMER_REQUEST', 'Customer requested change', 'வாடிக்கையாளர் கோரிக்கை', 'ग्राहक अनुरोध', 'Customer disputed the transaction', 'MEDIUM'),
('ADMIN_ERROR', 'Administrative error', 'நிர்வாக பிழை', 'प्रशासनिक त्रुटि', 'Shopkeeper made mistake', 'MEDIUM'),
('SYSTEM_ERROR', 'System error or bug', 'கணினி பிழை', 'सिस्टम एरर', 'Software malfunction', 'HIGH'),
('OTHER', 'Other reason', 'மற்ற காரணம்', 'अन्य कारण', 'Any other scenario', 'LOW')
ON CONFLICT (reason_code) DO NOTHING;

-- ============================================================================
-- Grant Permissions
-- ============================================================================

-- Assuming roles: grammart_admin, grammart_app
GRANT SELECT, INSERT, UPDATE ON transaction_audits TO grammart_app;
GRANT SELECT, INSERT, UPDATE ON transaction_timeline TO grammart_app;
GRANT SELECT ON reversal_reasons_metadata TO grammart_app;
GRANT SELECT ON customer_transaction_history TO grammart_app;

-- ============================================================================
-- Create Indexes for Performance
-- ============================================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_timeline_customer_date_type ON transaction_timeline(customer_id, created_at DESC, event_type);
CREATE INDEX idx_audit_shop_date ON transaction_audits(shop_id, created_at DESC);
CREATE INDEX idx_bills_shop_reversed ON bills(shop_id, reversed, created_at DESC);

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Record migration
INSERT INTO schema_migrations (version, description, installed_on)
VALUES ('V10', 'Enterprise Transaction Management System', CURRENT_TIMESTAMP)
ON CONFLICT (version) DO NOTHING;

COMMENT ON SCHEMA public IS 'GramMart AI - Transaction Management System V10 - Ready for Production';
