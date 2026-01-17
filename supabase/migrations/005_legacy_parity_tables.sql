-- Migration 005: Legacy Parity Tables
-- Supporting Specialist Hub, Inventory Matrix, Financial Matrix, and Diagnostic IQ
-- Specialist Registry
CREATE TABLE public.specialists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    role TEXT NOT NULL,
    -- 'Physician', 'Nurse', 'Affiliate'
    status TEXT DEFAULT 'Active',
    -- 'Active', 'On Call', 'Inactive'
    clinical_iq INTEGER DEFAULT 90,
    credentialed BOOLEAN DEFAULT TRUE,
    email TEXT,
    phone TEXT,
    last_encounter_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.user_profiles(id)
);
-- Inventory Registry
CREATE TABLE public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    stock_level INTEGER DEFAULT 0,
    min_reorder_level INTEGER DEFAULT 10,
    unit_price DECIMAL(10, 2),
    warehouse_location TEXT,
    status TEXT DEFAULT 'stable',
    -- 'stable', 'warning', 'critical'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Financial Telemetry (Revenue Pulse & AR Aging)
CREATE TABLE public.financial_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE DEFAULT CURRENT_DATE,
    revenue_pulse DECIMAL(15, 2),
    ar_0_30 DECIMAL(15, 2) DEFAULT 0,
    ar_31_60 DECIMAL(15, 2) DEFAULT 0,
    ar_61_90 DECIMAL(15, 2) DEFAULT 0,
    ar_91_plus DECIMAL(15, 2) DEFAULT 0,
    clinical_blockers_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Diagnostic Audits (Data Integrity Gaps)
CREATE TABLE public.diagnostic_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    -- 'Patient', 'Prescription', 'Specialist'
    entity_id UUID NOT NULL,
    issue_type TEXT NOT NULL,
    -- 'Missing Encounter', 'Credential Expiry', 'Orphaned Thread'
    severity TEXT DEFAULT 'Medium',
    -- 'Low', 'Medium', 'High'
    status TEXT DEFAULT 'Open',
    -- 'Open', 'Resolved', 'Investigating'
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    notes TEXT
);
-- Purchasing & Procurement
CREATE TABLE public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number TEXT UNIQUE NOT NULL,
    vendor_name TEXT NOT NULL,
    status TEXT DEFAULT 'Draft',
    -- 'Draft', 'Sent', 'Received', 'Invoiced'
    total_amount DECIMAL(15, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.user_profiles(id)
);
-- Indexes for performance
CREATE INDEX idx_specialists_specialty ON public.specialists(specialty);
CREATE INDEX idx_inventory_item_code ON public.inventory_items(item_code);
CREATE INDEX idx_diagnostic_audits_issue ON public.diagnostic_audits(issue_type);
CREATE INDEX idx_financial_metrics_date ON public.financial_metrics(metric_date);
-- Enable RLS
ALTER TABLE public.specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
-- Triggers for updated_at
CREATE TRIGGER update_specialists_updated_at BEFORE
UPDATE ON public.specialists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE
UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE
UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();