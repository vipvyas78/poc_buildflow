# BuildFlow Database - Quick Reference

## Connection

```bash
# Connect to database
psql -U postgres buildflow

# With host and port
psql -h localhost -p 5432 -U postgres buildflow
```

## Essential Commands

### View Tables
```sql
-- List all tables
\dt

-- Show table structure
\d projects

-- List all indexes
\di

-- List enum types
\dT
```

### Data Inspection

```sql
-- Count records
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM tasks;
SELECT COUNT(*) FROM tenders;

-- View all projects
SELECT * FROM projects;

-- View project details
SELECT name, status, progress, value FROM projects ORDER BY progress DESC;

-- View all tasks
SELECT title, assignee, status, priority FROM tasks;

-- View tender with options
SELECT * FROM tenders;
SELECT name FROM tender_options;
```

## Common Operations

### Projects
```sql
-- Get project with task count
SELECT p.name, COUNT(t.id) as tasks
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
GROUP BY p.id, p.name;

-- Get projects over budget
SELECT * FROM projects WHERE budget_status = 'Over budget';

-- Update project progress
UPDATE projects SET progress = 75 WHERE id = 1;

-- Get project by code
SELECT * FROM projects WHERE code = 'PRJ-0042';
```

### Tasks
```sql
-- Get tasks by status
SELECT * FROM tasks WHERE status = 'In Progress';

-- Get tasks by assignee
SELECT * FROM tasks WHERE assignee = 'James Walker';

-- Get overdue tasks
SELECT * FROM tasks 
WHERE status != 'Completed' AND due_date < CURRENT_DATE;

-- Complete a task
UPDATE tasks SET completed = TRUE, status = 'Completed' WHERE id = 1;

-- Get pending high-priority tasks
SELECT * FROM tasks 
WHERE status = 'Pending' AND priority = 'High'
ORDER BY due_date;

-- Get team member workload
SELECT assignee, COUNT(*) as task_count
FROM tasks
WHERE status IN ('In Progress', 'Pending')
GROUP BY assignee
ORDER BY task_count DESC;
```

### Tenders
```sql
-- Get tender details
SELECT * FROM tenders WHERE id = 1;

-- Get estimate summary
SELECT code, item, cost, tone FROM estimate_rows 
WHERE tender_id = 1 ORDER BY code;

-- Get BOQ items
SELECT nrm, nrm2, item, quantity, confidence 
FROM generated_boq_items 
WHERE tender_id = 1;

-- Get risk items (red tone)
SELECT * FROM ai_signals 
WHERE tender_id = 1 AND tone = 'red';

-- Get document status
SELECT name, owner, status 
FROM submission_files 
WHERE tender_id = 1;

-- Get negotiation history
SELECT time, title, impact 
FROM negotiation_logs 
WHERE tender_id = 1 
ORDER BY CAST(LEFT(time, 2) AS INTEGER);
```

## Insert Operations

### Add New Project
```sql
INSERT INTO projects (name, code, type, status, progress, value, deadline, location, latitude, longitude, phase, team)
VALUES (
    'New Shopping Center',
    'PRJ-0043',
    'Commercial',
    'On Track',
    10,
    '£5.2M',
    'Dec 2026',
    'Manchester',
    53.4808,
    -2.2426,
    'Phase 1 of 3',
    ARRAY['GA', 'PR']
);
```

### Add New Task
```sql
INSERT INTO tasks (title, project_id, project_name, contractor, assignee, status, priority, due_date, completed)
VALUES (
    'Install fire alarm system',
    1,
    'Canary Wharf Fit-Out',
    'SafeGuard Systems',
    'Robert Jones',
    'Pending',
    'High',
    '2025-11-20',
    FALSE
);
```

### Add New Estimate Row
```sql
INSERT INTO estimate_rows (tender_id, code, item, supplier, quantity, cost, delta, tone)
VALUES (1, '4.0', 'Facade systems', 'CurTainwall Ltd', '1 lot', '£4.2M', '+2.3%', 'amber');
```

## Update Operations

```sql
-- Update task status
UPDATE tasks SET status = 'In Progress' WHERE id = 2;

-- Update project progress
UPDATE projects SET progress = 50 WHERE id = 1;

-- Update estimate cost
UPDATE estimate_rows SET cost = '£450K' WHERE id = 1;

-- Bulk update: Mark all pending tasks as in-progress
UPDATE tasks SET status = 'In Progress' WHERE status = 'Pending';

-- Add team member to project
UPDATE projects 
SET team = array_append(team, 'JD') 
WHERE id = 1;
```

## Delete Operations

```sql
-- Delete a task
DELETE FROM tasks WHERE id = 5;

-- Delete all completed tasks
DELETE FROM tasks WHERE completed = TRUE AND updated_at < NOW() - INTERVAL '6 months';

-- Delete a project and its tasks (cascade)
DELETE FROM projects WHERE id = 1;
```

## Advanced Queries

### Project Dashboard
```sql
SELECT 
    p.name,
    p.progress,
    p.status,
    COUNT(t.id) as total_tasks,
    SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN t.status = 'Delayed' THEN 1 ELSE 0 END) as delayed
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
GROUP BY p.id, p.name, p.progress, p.status
ORDER BY p.progress DESC;
```

### Team Performance
```sql
SELECT 
    assignee,
    COUNT(*) as total_tasks,
    SUM(CASE WHEN completed = TRUE THEN 1 ELSE 0 END) as completed_tasks,
    ROUND(100.0 * SUM(CASE WHEN completed = TRUE THEN 1 ELSE 0 END) / COUNT(*), 1) as completion_rate
FROM tasks
WHERE assignee IS NOT NULL
GROUP BY assignee
ORDER BY completion_rate DESC;
```

### Budget Variance Analysis
```sql
SELECT 
    name,
    value,
    budget_variance,
    budget_status,
    progress,
    deadline
FROM projects
WHERE budget_status = 'Over budget'
ORDER BY progress ASC;
```

### Tender Cost Summary
```sql
SELECT 
    code,
    item,
    cost,
    delta,
    tone,
    CASE 
        WHEN tone = 'red' THEN 'High Risk'
        WHEN tone = 'amber' THEN 'Medium Risk'
        ELSE 'Low Risk'
    END as risk_level
FROM estimate_rows
WHERE tender_id = 1
ORDER BY code;
```

### Critical Issues Report
```sql
SELECT 'Red Flags' as issue_type, COUNT(*) as count
FROM (
    SELECT id FROM tasks WHERE status = 'Delayed'
    UNION ALL
    SELECT id FROM ai_signals WHERE tone = 'red'
    UNION ALL
    SELECT id FROM submission_files WHERE status = 'Missing'
    UNION ALL
    SELECT id FROM generated_boq_items WHERE tone = 'red'
) critical_items;
```

## Aggregation Functions

```sql
-- Count by status
SELECT status, COUNT(*) FROM tasks GROUP BY status;

-- Sum by tone
SELECT tone, COUNT(*) FROM estimate_rows GROUP BY tone ORDER BY tone;

-- Average confidence
SELECT AVG(confidence) as avg_confidence FROM generated_boq_items;

-- Max progress per project type
SELECT type, MAX(progress) as max_progress FROM projects GROUP BY type;
```

## Useful Functions

```sql
-- Get project summary (if created)
SELECT * FROM get_project_summary(1);

-- Get tender estimate summary (if created)
SELECT * FROM get_tender_estimate_summary(1);

-- Current timestamp
SELECT CURRENT_TIMESTAMP;

-- Format dates
SELECT name, deadline FROM projects;
SELECT name, due_date FROM tasks;
```

## Maintenance

### Backup
```bash
pg_dump -U postgres buildflow > buildflow_backup.sql
```

### Restore
```bash
psql -U postgres buildflow < buildflow_backup.sql
```

### Analyze (Optimize queries)
```sql
ANALYZE;
```

### Vacuum (Cleanup space)
```sql
VACUUM;
```

### Check Database Size
```sql
SELECT pg_size_pretty(pg_database_size('buildflow'));
```

### Show Table Sizes
```sql
SELECT 
    relname as table_name,
    pg_size_pretty(pg_total_relation_size(relid)) as size
FROM pg_tables
JOIN pg_class ON pg_tables.tablename = pg_class.relname
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(relid) DESC;
```

## Export/Import Data

### Export to CSV
```sql
\COPY (SELECT * FROM projects) TO 'projects.csv' WITH CSV HEADER;
```

### Import from CSV
```sql
\COPY projects(name, code, type, status) FROM 'data.csv' WITH CSV HEADER;
```

### Export to JSON
```sql
SELECT row_to_json(row) FROM (SELECT * FROM projects) row;
```

## Useful Aliases

```bash
# Add to ~/.bashrc or ~/.zshrc
alias psqlbf='psql -U postgres buildflow'

# Use as: psqlbf
```

## Performance Tips

```sql
-- Use EXPLAIN to see query plan
EXPLAIN SELECT * FROM tasks WHERE assignee = 'James Walker';

-- Find missing indexes
SELECT * FROM tasks WHERE assignee = 'James Walker';
-- Consider: CREATE INDEX idx_tasks_assignee ON tasks(assignee);

-- Use LIMIT for testing
SELECT * FROM projects LIMIT 10;

-- Use DISTINCT carefully
SELECT DISTINCT contractor FROM tasks;
```

## Troubleshooting

### Reset Database
```bash
dropdb buildflow
createdb buildflow
psql buildflow -f database/01-schema.sql
psql buildflow -f database/02-data.sql
```

### Check Connections
```sql
SELECT count(*) FROM pg_stat_activity;
```

### View Recent Changes
```sql
SELECT * FROM projects ORDER BY updated_at DESC LIMIT 5;
```

### Find Slow Queries
```sql
SELECT query, calls, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 5;
```

## Quick Reference Summary

| Task | Command |
|------|---------|
| Connect | `psql -U postgres buildflow` |
| List tables | `\dt` |
| Show schema | `\d table_name` |
| Get project count | `SELECT COUNT(*) FROM projects;` |
| Get tasks | `SELECT * FROM tasks;` |
| Get tenders | `SELECT * FROM tenders;` |
| Update progress | `UPDATE projects SET progress = 50 WHERE id = 1;` |
| Complete task | `UPDATE tasks SET completed = TRUE WHERE id = 1;` |
| Backup | `pg_dump buildflow > backup.sql` |
| Restore | `psql buildflow < backup.sql` |

---

**Last Updated:** May 31, 2026
**Database:** BuildFlow
**PostgreSQL Version:** 12+
