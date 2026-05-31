-- PostgreSQL Schema for BuildFlow Application
-- This script creates all tables for the BuildFlow project management system

CREATE SCHEMA IF NOT EXISTS core;
SET search_path = core, public;

-- Drop existing tables if they exist (in correct dependency order)
DROP TABLE IF EXISTS core.ai_signals CASCADE;
DROP TABLE IF EXISTS core.award_tasks CASCADE;
DROP TABLE IF EXISTS core.negotiation_logs CASCADE;
DROP TABLE IF EXISTS core.pre_tender_criteria CASCADE;
DROP TABLE IF EXISTS core.submission_files CASCADE;
DROP TABLE IF EXISTS core.generated_boq_items CASCADE;
DROP TABLE IF EXISTS core.drawing_uploads CASCADE;
DROP TABLE IF EXISTS core.estimate_rows CASCADE;
DROP TABLE IF EXISTS core.nrm_modes CASCADE;
DROP TABLE IF EXISTS core.tender_stages CASCADE;
DROP TABLE IF EXISTS core.tenders CASCADE;
DROP TABLE IF EXISTS core.tender_options CASCADE;
DROP TABLE IF EXISTS core.tasks CASCADE;
DROP TABLE IF EXISTS core.projects CASCADE;

-- Create ENUM types
CREATE TYPE IF NOT EXISTS semantic_tone AS ENUM ('blue', 'green', 'amber', 'red', 'slate');
CREATE TYPE IF NOT EXISTS project_status AS ENUM ('At Risk', 'On Track', 'On budget', 'Over budget');
CREATE TYPE IF NOT EXISTS task_status AS ENUM ('In Progress', 'Pending', 'Delayed', 'Completed');
CREATE TYPE IF NOT EXISTS task_priority AS ENUM ('High', 'Medium', 'Low');
CREATE TYPE IF NOT EXISTS tender_stage_status AS ENUM ('complete', 'active', 'locked');
CREATE TYPE IF NOT EXISTS drawing_status AS ENUM ('Parsed', 'Queued', 'Needs review');
CREATE TYPE IF NOT EXISTS submission_status AS ENUM ('Verified', 'Draft review', 'Missing', 'Ready');

-- Projects Table
CREATE TABLE core.projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(100),
    status VARCHAR(100),
    progress INTEGER DEFAULT 0,
    value VARCHAR(50),
    budget_variance VARCHAR(50),
    budget_status VARCHAR(50),
    deadline VARCHAR(50),
    location VARCHAR(255),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    phase VARCHAR(100),
    team VARCHAR[] DEFAULT ARRAY[]::VARCHAR[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE core.tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    project_id INTEGER REFERENCES core.projects(id) ON DELETE CASCADE,
    project_name VARCHAR(255),
    contractor VARCHAR(255),
    assignee VARCHAR(255),
    status task_status,
    priority task_priority,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tender Options Table
CREATE TABLE core.tender_options (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tender Summary Table (single record expected per tender cycle)
CREATE TABLE core.tenders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    client VARCHAR(255),
    value VARCHAR(50),
    bid_due DATE,
    countdown VARCHAR(50),
    confidence INTEGER,
    margin VARCHAR(50),
    risk VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tender Stages Table
CREATE TABLE core.tender_stages (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    short_label VARCHAR(50),
    status tender_stage_status DEFAULT 'locked',
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NRM Modes Table
CREATE TABLE core.nrm_modes (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Estimate Rows Table
CREATE TABLE core.estimate_rows (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES core.tenders(id) ON DELETE CASCADE,
    code VARCHAR(50),
    item VARCHAR(255),
    supplier VARCHAR(255),
    quantity VARCHAR(100),
    cost VARCHAR(50),
    delta VARCHAR(50),
    tone semantic_tone DEFAULT 'slate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drawing Uploads Table
CREATE TABLE core.drawing_uploads (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES core.tenders(id) ON DELETE CASCADE,
    name VARCHAR(255),
    discipline VARCHAR(100),
    status drawing_status,
    tone semantic_tone DEFAULT 'slate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated BOQ Items Table
CREATE TABLE core.generated_boq_items (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES core.tenders(id) ON DELETE CASCADE,
    nrm VARCHAR(50),
    nrm2 VARCHAR(50),
    item VARCHAR(255),
    source VARCHAR(100),
    quantity VARCHAR(100),
    confidence INTEGER,
    action VARCHAR(255),
    tone semantic_tone DEFAULT 'slate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Submission Files Table
CREATE TABLE core.submission_files (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES core.tenders(id) ON DELETE CASCADE,
    name VARCHAR(255),
    owner VARCHAR(100),
    status submission_status,
    tone semantic_tone DEFAULT 'slate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pre-Tender Criteria Table
CREATE TABLE core.pre_tender_criteria (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES core.tenders(id) ON DELETE CASCADE,
    label VARCHAR(255),
    score INTEGER,
    tone semantic_tone DEFAULT 'slate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Negotiation Logs Table
CREATE TABLE core.negotiation_logs (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES core.tenders(id) ON DELETE CASCADE,
    time VARCHAR(50),
    title TEXT,
    impact VARCHAR(100),
    tone semantic_tone DEFAULT 'slate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Award Tasks Table
CREATE TABLE core.award_tasks (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES core.tenders(id) ON DELETE CASCADE,
    task_description TEXT,
    order_index INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Signals Table
CREATE TABLE core.ai_signals (
    id SERIAL PRIMARY KEY,
    tender_id INTEGER REFERENCES core.tenders(id) ON DELETE CASCADE,
    label VARCHAR(255),
    value VARCHAR(100),
    tone semantic_tone DEFAULT 'slate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_projects_code ON core.projects(code);
CREATE INDEX idx_projects_status ON core.projects(status);
CREATE INDEX idx_tasks_project_id ON core.tasks(project_id);
CREATE INDEX idx_tasks_status ON core.tasks(status);
CREATE INDEX idx_estimate_rows_tender_id ON core.estimate_rows(tender_id);
CREATE INDEX idx_drawing_uploads_tender_id ON core.drawing_uploads(tender_id);
CREATE INDEX idx_generated_boq_items_tender_id ON core.generated_boq_items(tender_id);
CREATE INDEX idx_submission_files_tender_id ON core.submission_files(tender_id);
CREATE INDEX idx_pre_tender_criteria_tender_id ON core.pre_tender_criteria(tender_id);
CREATE INDEX idx_negotiation_logs_tender_id ON core.negotiation_logs(tender_id);
CREATE INDEX idx_award_tasks_tender_id ON core.award_tasks(tender_id);
CREATE INDEX idx_ai_signals_tender_id ON core.ai_signals(tender_id);
