-- ShadowSig Database Schema
-- Privacy-Preserving Multisig Platform

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- MULTISIGS
-- ============================================================
CREATE TABLE multisigs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    threshold INTEGER NOT NULL CHECK (threshold > 0),
    member_count INTEGER NOT NULL CHECK (member_count >= threshold),
    merkle_root BYTEA NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_multisigs_status ON multisigs(status);
CREATE INDEX idx_multisigs_created_at ON multisigs(created_at DESC);

-- ============================================================
-- MEMBERS (Shielded)
-- ============================================================
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    multisig_id UUID NOT NULL REFERENCES multisigs(id) ON DELETE CASCADE,
    commitment BYTEA NOT NULL,
    leaf_index INTEGER NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(multisig_id, leaf_index),
    UNIQUE(multisig_id, commitment)
);

CREATE INDEX idx_members_multisig_id ON members(multisig_id);

-- ============================================================
-- PROPOSALS
-- ============================================================
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    multisig_id UUID NOT NULL REFERENCES multisigs(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    action_type VARCHAR(100) NOT NULL,
    action_data JSONB,
    approval_count INTEGER NOT NULL DEFAULT 0,
    threshold INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_proposals_multisig_id ON proposals(multisig_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX idx_proposals_expires_at ON proposals(expires_at) WHERE status = 'pending';

-- ============================================================
-- APPROVALS (Anonymous)
-- ============================================================
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    nullifier BYTEA NOT NULL UNIQUE,
    proof BYTEA NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_approvals_proposal_id ON approvals(proposal_id);
CREATE UNIQUE INDEX idx_approvals_nullifier ON approvals(nullifier);

-- ============================================================
-- NULLIFIERS (Double-Vote Prevention)
-- ============================================================
CREATE TABLE nullifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nullifier_hash BYTEA NOT NULL UNIQUE,
    proposal_id UUID NOT NULL REFERENCES proposals(id),
    consumed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_nullifiers_hash ON nullifiers(nullifier_hash);
CREATE INDEX idx_nullifiers_proposal ON nullifiers(proposal_id);

-- ============================================================
-- EXECUTIONS
-- ============================================================
CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id),
    tx_hash BYTEA,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_executions_proposal_id ON executions(proposal_id);
CREATE INDEX idx_executions_status ON executions(status);

-- ============================================================
-- VERIFIER LOGS (Audit Trail)
-- ============================================================
CREATE TABLE verifier_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proof_id UUID,
    verifier_program VARCHAR(255) NOT NULL,
    result BOOLEAN NOT NULL,
    compute_units BIGINT,
    latency_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verifier_logs_created_at ON verifier_logs(created_at DESC);
CREATE INDEX idx_verifier_logs_result ON verifier_logs(result);

-- ============================================================
-- TREASURY ACTIONS
-- ============================================================
CREATE TABLE treasury_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    multisig_id UUID NOT NULL REFERENCES multisigs(id),
    action_type VARCHAR(100) NOT NULL,
    asset VARCHAR(255),
    amount NUMERIC(38, 18),
    recipient BYTEA,
    execution_id UUID REFERENCES executions(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_treasury_multisig ON treasury_actions(multisig_id);
CREATE INDEX idx_treasury_execution ON treasury_actions(execution_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_multisigs_updated_at
    BEFORE UPDATE ON multisigs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
