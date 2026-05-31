-- PostgreSQL Data Insertion for BuildFlow Application
-- This script inserts all sample data into the created tables

SET search_path = core, public;

-- Insert Projects
INSERT INTO projects (id, name, code, type, status, progress, value, budget_variance, budget_status, deadline, location, latitude, longitude, phase, team)
VALUES
    (1, 'Canary Wharf Fit-Out', 'PRJ-0042', 'Fit-out', 'At Risk', 55, '£2.54M', '+£8K', 'On budget', 'Oct 2025', 'Canary Wharf, London', 51.5054, -0.0235, 'Phase 3 of 5', ARRAY['GA', 'PR', 'LT']),
    (2, 'Central Station Refurb', 'PRJ-0039', 'Refurb', 'On Track', 44, '£3.1M', '+£5K', 'On budget', 'Dec 2025', 'Birmingham', 52.4862, -1.8904, 'Phase 2 of 5', ARRAY['TH', 'SW', 'NP']),
    (3, 'Highbury Estate Phase 2', 'PRJ-0038', 'Residential', 'At Risk', 23, '£2.1M', '+£28K', 'Over budget', 'Mar 2026', 'Highbury', 51.5465, -0.1026, 'Phase 1 of 4', ARRAY['AB', 'KS']);

-- Insert Tasks
INSERT INTO tasks (id, title, project_id, project_name, contractor, assignee, status, priority, due_date, completed)
VALUES
    (1, 'Install HVAC ducting', 1, 'Canary Wharf Fit-Out', 'Elite Mechanical Ltd', 'James Walker', 'In Progress', 'High', '2025-10-14', FALSE),
    (2, 'Fire safety inspection', 2, 'Central Station Refurb', 'SafeBuild Compliance', 'Sarah Mitchell', 'Pending', 'Medium', '2025-09-30', FALSE),
    (3, 'Concrete foundation pour', 3, 'Highbury Estate Phase 2', 'UrbanCore Construction', 'Michael Brown', 'Delayed', 'High', '2025-09-22', FALSE),
    (4, 'Electrical first fix', 1, 'Canary Wharf Fit-Out', 'VoltEdge Services', 'Emma Collins', 'Completed', 'Medium', '2025-08-18', TRUE),
    (5, 'Roof waterproofing', NULL, 'Riverside Tower', 'Skyline Roofing', 'Daniel Harris', 'Completed', 'Low', '2025-07-30', TRUE);

-- Insert Tender Options
INSERT INTO tender_options (name)
VALUES
    ('Cambridge Civic Quarter'),
    ('Bristol Hospital Retrofit'),
    ('Leeds Student Living');

-- Insert Main Tender Summary
INSERT INTO tenders (id, name, client, value, bid_due, countdown, confidence, margin, risk)
VALUES
    (1, 'Cambridge Civic Quarter', 'Cambridge City Council', '£8.6M', '2026-06-12', '18d 04h', 78, '11.8%', 'Medium');

-- Insert Tender Stages
INSERT INTO tender_stages (id, label, short_label, status, order_index)
VALUES
    ('pre-tender', 'Pre-Tender', 'Pre', 'complete', 1),
    ('estimating', 'Estimating', 'Estimate', 'active', 2),
    ('submission', 'Submission', 'Submit', 'locked', 3),
    ('negotiation', 'Negotiation', 'Negotiate', 'locked', 4),
    ('award', 'Award', 'Award', 'locked', 5);

-- Insert NRM Modes
INSERT INTO nrm_modes (id, label, description)
VALUES
    ('NRM1', 'NRM1', 'Order of cost estimate and cost planning structure'),
    ('NRM2', 'NRM2', 'Detailed measurement rules for tender BoQ production'),
    ('NRM1 + NRM2', 'NRM1 + NRM2', 'Cost-plan alignment with measured work item detail');

-- Insert Estimate Rows
INSERT INTO estimate_rows (tender_id, code, item, supplier, quantity, cost, delta, tone)
VALUES
    (1, '1.0', 'Site preliminaries', 'BuildFlow internal', '16 wks', '£428K', '+2.1%', 'amber'),
    (1, '2.0', 'Substructure package', 'East Anglia Groundworks', '1 lot', '£1.42M', '-1.8%', 'green'),
    (1, '2.1', 'Piling attendance', 'Fen Piling Ltd', '112 piles', '£386K', '+4.6%', 'red'),
    (1, '3.0', 'Frame and envelope', 'Northern Steelworks', '1 lot', '£2.31M', '+0.4%', 'blue');

-- Insert Drawing Uploads
INSERT INTO drawing_uploads (tender_id, name, discipline, status, tone)
VALUES
    (1, 'A-101 Ground floor GA.pdf', 'Architecture', 'Parsed', 'green'),
    (1, 'S-220 Substructure sections.dwg', 'Structural', 'Queued', 'blue'),
    (1, 'M-310 Plant room layout.pdf', 'MEP', 'Needs review', 'amber');

-- Insert Generated BOQ Items
INSERT INTO generated_boq_items (tender_id, nrm, nrm2, item, source, quantity, confidence, action, tone)
VALUES
    (1, 'NRM1 2.1', 'NRM2 E10', 'Reinforced concrete strip foundations', 'S-220', '184 m3', 86, 'Ready for pricing', 'green'),
    (1, 'NRM1 2.2', 'NRM2 F10', 'Ground floor slab with insulation build-up', 'A-101', '1,420 m2', 79, 'Check build-up', 'amber'),
    (1, 'NRM1 3.1', 'NRM2 G20', 'Structural steel frame and connections', 'S-410', '286 t', 72, 'Drawing missing', 'red'),
    (1, 'NRM1 8.1', 'NRM2 T31', 'Mechanical plant distribution allowance', 'M-310', '1 item', 68, 'Estimator review', 'amber');

-- Insert Submission Files
INSERT INTO submission_files (tender_id, name, owner, status, tone)
VALUES
    (1, 'Form of tender', 'Commercial', 'Verified', 'green'),
    (1, 'Programme narrative', 'Planning', 'Draft review', 'amber'),
    (1, 'Health and safety method', 'HSEQ', 'Missing', 'red'),
    (1, 'Social value response', 'Bid team', 'Ready', 'green');

-- Insert Pre-Tender Criteria
INSERT INTO pre_tender_criteria (tender_id, label, score, tone)
VALUES
    (1, 'Client fit', 82, 'green'),
    (1, 'Resource capacity', 64, 'amber'),
    (1, 'Contract exposure', 41, 'red');

-- Insert Negotiation Logs
INSERT INTO negotiation_logs (tender_id, time, title, impact, tone)
VALUES
    (1, '09:20', 'Client requested VE option for facade finish', '-£186K', 'blue'),
    (1, '11:45', 'Legal flagged liquidated damages clause', 'Blocker', 'red'),
    (1, '14:10', 'MEP subcontractor held price for 21 days', 'Clear', 'green');

-- Insert Award Tasks
INSERT INTO award_tasks (tender_id, task_description, order_index)
VALUES
    (1, 'Initialize project instance', 1),
    (1, 'Map tender BoQ to project cost plan', 2),
    (1, 'Create handover pack', 3),
    (1, 'Log post-bid criteria', 4);

-- Insert AI Signals
INSERT INTO ai_signals (tender_id, label, value, tone)
VALUES
    (1, 'Clause risk', '2 critical', 'red'),
    (1, 'Supplier coverage', '84%', 'green'),
    (1, 'Pricing drift', '+1.6%', 'amber');

-- Reset sequences to avoid conflicts
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));
SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));
SELECT setval('tenders_id_seq', (SELECT MAX(id) FROM tenders));
SELECT setval('estimate_rows_id_seq', (SELECT MAX(id) FROM estimate_rows));
SELECT setval('drawing_uploads_id_seq', (SELECT MAX(id) FROM drawing_uploads));
SELECT setval('generated_boq_items_id_seq', (SELECT MAX(id) FROM generated_boq_items));
SELECT setval('submission_files_id_seq', (SELECT MAX(id) FROM submission_files));
SELECT setval('pre_tender_criteria_id_seq', (SELECT MAX(id) FROM pre_tender_criteria));
SELECT setval('negotiation_logs_id_seq', (SELECT MAX(id) FROM negotiation_logs));
SELECT setval('award_tasks_id_seq', (SELECT MAX(id) FROM award_tasks));
SELECT setval('ai_signals_id_seq', (SELECT MAX(id) FROM ai_signals));
SELECT setval('tender_options_id_seq', (SELECT MAX(id) FROM tender_options));
SELECT setval('nrm_modes_id_seq', (SELECT MAX(id) FROM nrm_modes));
