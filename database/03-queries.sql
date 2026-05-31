-- PostgreSQL Utility Queries and Procedures for BuildFlow Application
-- This script provides helpful queries and procedures for database management

SET search_path = core, public;

-- ============================================
-- USEFUL QUERY EXAMPLES
-- ============================================

-- Get all projects with task counts
SELECT 
    p.id,
    p.name,
    p.code,
    p.status,
    p.progress,
    COUNT(t.id) as task_count,
    SUM(CASE WHEN t.completed = TRUE THEN 1 ELSE 0 END) as completed_tasks
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
GROUP BY p.id, p.name, p.code, p.status, p.progress
ORDER BY p.progress DESC;

-- Get pending and in-progress tasks
SELECT 
    t.id,
    t.title,
    p.name as project,
    t.assignee,
    t.priority,
    t.due_date,
    t.status
FROM tasks t
LEFT JOIN projects p ON t.project_id = p.id
WHERE t.status IN ('Pending', 'In Progress')
ORDER BY t.priority DESC, t.due_date ASC;

-- Get tender progress dashboard
SELECT 
    t.id,
    t.name,
    t.client,
    t.value,
    t.confidence,
    COUNT(DISTINCT CASE WHEN er.tone = 'red' THEN er.id END) as red_items,
    COUNT(DISTINCT CASE WHEN er.tone = 'amber' THEN er.id END) as amber_items,
    COUNT(DISTINCT CASE WHEN er.tone = 'green' THEN er.id END) as green_items
FROM tenders t
LEFT JOIN estimate_rows er ON t.id = er.tender_id
GROUP BY t.id, t.name, t.client, t.value, t.confidence;

-- Get team member workload
SELECT 
    assignee,
    COUNT(*) as total_tasks,
    SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN status IN ('In Progress', 'Pending') THEN 1 ELSE 0 END) as active,
    SUM(CASE WHEN status = 'Delayed' THEN 1 ELSE 0 END) as delayed
FROM tasks
WHERE assignee IS NOT NULL
GROUP BY assignee
ORDER BY active DESC;

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Function to get project summary
CREATE OR REPLACE FUNCTION get_project_summary(p_project_id INTEGER)
RETURNS TABLE (
    project_name VARCHAR,
    total_tasks INTEGER,
    completed_tasks INTEGER,
    pending_tasks INTEGER,
    in_progress_tasks INTEGER,
    delayed_tasks INTEGER,
    completion_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.name,
        CAST(COUNT(t.id) AS INTEGER),
        CAST(SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS INTEGER),
        CAST(SUM(CASE WHEN t.status = 'Pending' THEN 1 ELSE 0 END) AS INTEGER),
        CAST(SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) AS INTEGER),
        CAST(SUM(CASE WHEN t.status = 'Delayed' THEN 1 ELSE 0 END) AS INTEGER),
        ROUND((SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END)::NUMERIC / 
               NULLIF(COUNT(t.id), 0) * 100), 2)
    FROM projects p
    LEFT JOIN tasks t ON p.id = t.project_id
    WHERE p.id = p_project_id
    GROUP BY p.id, p.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get tender estimate summary
CREATE OR REPLACE FUNCTION get_tender_estimate_summary(p_tender_id INTEGER)
RETURNS TABLE (
    total_items INTEGER,
    total_cost VARCHAR,
    avg_delta VARCHAR,
    red_flag_count INTEGER,
    amber_flag_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CAST(COUNT(*) AS INTEGER),
        CONCAT('£', SUM(CAST(REPLACE(REPLACE(cost, '£', ''), 'M', '000000') AS DECIMAL))::VARCHAR),
        AVG(CAST(REPLACE(delta, '%', '') AS DECIMAL))::VARCHAR || '%',
        CAST(SUM(CASE WHEN tone = 'red' THEN 1 ELSE 0 END) AS INTEGER),
        CAST(SUM(CASE WHEN tone = 'amber' THEN 1 ELSE 0 END) AS INTEGER)
    FROM estimate_rows
    WHERE tender_id = p_tender_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MAINTENANCE PROCEDURES
-- ============================================

-- Procedure to archive completed tasks (older than 3 months)
-- Note: This would require an archive table first
-- CREATE TABLE tasks_archive AS TABLE tasks WITH NO DATA;
-- Then use:
-- INSERT INTO tasks_archive SELECT * FROM tasks WHERE completed = TRUE AND updated_at < NOW() - INTERVAL '3 months';
-- DELETE FROM tasks WHERE completed = TRUE AND updated_at < NOW() - INTERVAL '3 months';

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to projects
CREATE TRIGGER update_projects_timestamp BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Apply trigger to tasks
CREATE TRIGGER update_tasks_timestamp BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Apply trigger to tenders
CREATE TRIGGER update_tenders_timestamp BEFORE UPDATE ON tenders
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================
-- ANALYTICAL QUERIES
-- ============================================

-- Budget vs Actual Analysis
SELECT 
    p.name,
    p.value,
    p.budget_variance,
    p.budget_status,
    p.progress,
    COUNT(t.id) as total_tasks,
    SUM(CASE WHEN t.completed = TRUE THEN 1 ELSE 0 END) as completed_tasks
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
GROUP BY p.id, p.name, p.value, p.budget_variance, p.budget_status, p.progress
ORDER BY p.value DESC;

-- Risk Analysis by Project
SELECT 
    p.code,
    p.name,
    p.status,
    COUNT(t.id) FILTER (WHERE t.status = 'Delayed') as delayed_count,
    COUNT(t.id) FILTER (WHERE t.priority = 'High') as high_priority_count,
    p.progress,
    p.deadline
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
GROUP BY p.id, p.code, p.name, p.status, p.progress, p.deadline
HAVING COUNT(t.id) FILTER (WHERE t.status = 'Delayed') > 0
       OR COUNT(t.id) FILTER (WHERE t.priority = 'High') > 0
ORDER BY delayed_count DESC, high_priority_count DESC;

-- Tender Confidence vs Risk Score
SELECT 
    t.name,
    t.client,
    t.confidence,
    t.risk,
    (SELECT COUNT(*) FROM ai_signals WHERE tender_id = t.id AND tone = 'red') as critical_signals,
    (SELECT COUNT(*) FROM submission_files WHERE tender_id = t.id AND status = 'Missing') as missing_documents,
    (SELECT AVG(CAST(score AS INTEGER)) FROM pre_tender_criteria WHERE tender_id = t.id) as avg_criteria_score
FROM tenders t
ORDER BY t.confidence DESC;
