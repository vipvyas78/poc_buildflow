# BuildFlow PostgreSQL Database Setup

This directory contains SQL scripts to set up the PostgreSQL database for the BuildFlow project management application. The scripts migrate hard-coded data from TypeScript files into a structured database.

## Files Overview

### 1. `01-schema.sql`
Creates all database tables, enum types, and indexes. This is the foundation script that must be run first.

**Key Components:**
- **ENUM Types**: `semantic_tone`, `project_status`, `task_status`, `task_priority`, `tender_stage_status`, `drawing_status`, `submission_status`
- **Tables** (13 total):
  - `projects` - Main project records with geolocation data
  - `tasks` - Project tasks with assignment tracking
  - `tenders` - Tender/bid information
  - `tender_stages` - Tender workflow stages (pre-tender → award)
  - `tender_options` - Available tender options
  - `nrm_modes` - National Rules of Measurement standards
  - `estimate_rows` - Cost estimate line items
  - `drawing_uploads` - Design document tracking
  - `generated_boq_items` - Bill of Quantities items
  - `submission_files` - Bid submission documents
  - `pre_tender_criteria` - Bid qualification criteria
  - `negotiation_logs` - Negotiation timeline/history
  - `award_tasks` - Post-award handover tasks
  - `ai_signals` - AI-generated risk indicators

### 2. `02-data.sql`
Inserts all sample data from the TypeScript files into the created tables. Must be run after schema creation.

**Data Migrated:**
- 3 Projects (Canary Wharf, Central Station, Highbury Estate)
- 5 Tasks with assignments and statuses
- 1 Primary Tender (Cambridge Civic Quarter) with associated data:
  - 3 Tender Options
  - 5 Tender Stages (workflow progression)
  - 3 NRM Modes
  - 4 Estimate Rows
  - 3 Drawing Uploads
  - 4 Generated BOQ Items
  - 4 Submission Files
  - 3 Pre-Tender Criteria
  - 3 Negotiation Log Entries
  - 4 Award Tasks
  - 3 AI Signals

### 3. `03-queries.sql`
Provides useful queries, stored procedures, and analytical functions for common operations.

**Includes:**
- Dashboard queries (projects with task counts, tender progress)
- Team workload analysis
- Budget vs actual analysis
- Risk assessment queries
- Stored procedures for project and tender summaries
- Automatic timestamp update triggers

## Setup Instructions

### Prerequisites
- PostgreSQL 12 or higher
- Database client (psql, pgAdmin, DBeaver, etc.)
- Connection credentials for your PostgreSQL server

### Installation Steps

#### Option 1: Using psql (Command Line)

```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# Create a new database
CREATE DATABASE buildflow;

# Connect to the new database
\c buildflow

# Run schema script
\i /path/to/01-schema.sql

# Run data insertion script
\i /path/to/02-data.sql

# (Optional) Run utility queries
\i /path/to/03-queries.sql
```

#### Option 2: Using a GUI Client

1. Create a new database named `buildflow`
2. Open and execute `01-schema.sql` on the `buildflow` database
3. Open and execute `02-data.sql` on the `buildflow` database
4. (Optional) Open and execute `03-queries.sql` for procedures and functions

### Database Connection String

```
postgresql://username:password@localhost:5432/buildflow
```

Update the following parameters:
- `username` - Your PostgreSQL user
- `password` - Your PostgreSQL password
- `localhost` - Your PostgreSQL server hostname/IP
- `5432` - PostgreSQL port (default is 5432)

## Data Model Overview

### Relationships

```
Projects (1) ──→ (Many) Tasks
Tenders (1) ──→ (Many) Estimate Rows
Tenders (1) ──→ (Many) Drawing Uploads
Tenders (1) ──→ (Many) Generated BOQ Items
Tenders (1) ──→ (Many) Submission Files
Tenders (1) ──→ (Many) Pre-Tender Criteria
Tenders (1) ──→ (Many) Negotiation Logs
Tenders (1) ──→ (Many) Award Tasks
Tenders (1) ──→ (Many) AI Signals
```

### Key Fields

**Projects Table:**
- `id` (PK) - Unique project identifier
- `coordinates` - Stored as latitude/longitude for mapping
- `team` - PostgreSQL array of team member initials
- `progress` - 0-100 percentage
- `status` - Project health status

**Tasks Table:**
- `project_id` (FK) - Reference to projects table
- `status` - enumerated: In Progress, Pending, Delayed, Completed
- `priority` - enumerated: High, Medium, Low
- `completed` - Boolean flag for quick filtering

**Tenders Table:**
- Central hub for all tender-related data
- Links to multiple detail tables via foreign keys

## Common Operations

### Get Project Summary with Task Statistics

```sql
SELECT * FROM get_project_summary(1);
```

### Get All High-Priority Delayed Tasks

```sql
SELECT * FROM tasks 
WHERE status = 'Delayed' AND priority = 'High'
ORDER BY due_date ASC;
```

### Find Projects Over Budget

```sql
SELECT name, value, budget_variance, progress
FROM projects
WHERE budget_status = 'Over budget'
ORDER BY progress ASC;
```

### Get Team Member Workload

```sql
SELECT assignee, COUNT(*) as active_tasks
FROM tasks
WHERE status IN ('In Progress', 'Pending')
GROUP BY assignee
ORDER BY active_tasks DESC;
```

### Tender Risk Assessment

```sql
SELECT 
    name,
    confidence,
    (SELECT COUNT(*) FROM ai_signals 
     WHERE tender_id = tenders.id AND tone = 'red') as critical_issues
FROM tenders
ORDER BY confidence ASC;
```

## Maintenance

### Backup Database

```bash
pg_dump -U postgres buildflow > buildflow_backup.sql
```

### Restore Database

```bash
psql -U postgres buildflow < buildflow_backup.sql
```

### Update Records

```sql
-- Update project progress
UPDATE projects SET progress = 60, updated_at = CURRENT_TIMESTAMP 
WHERE id = 1;

-- Mark task as completed
UPDATE tasks SET completed = TRUE, status = 'Completed', updated_at = CURRENT_TIMESTAMP
WHERE id = 1;
```

## Troubleshooting

### Connection Issues
- Verify PostgreSQL is running: `pg_isready -h localhost -p 5432`
- Check connection parameters in connection string
- Ensure firewall allows PostgreSQL port access

### Schema Errors
- If tables already exist, `01-schema.sql` will drop them first
- Check PostgreSQL logs for detailed error messages
- Verify PostgreSQL version compatibility (12+)

### Data Loading Errors
- Ensure `01-schema.sql` completed successfully before running `02-data.sql`
- Check for duplicate key violations if running data script multiple times
- Verify enum types were created properly

### Performance Issues
- Indexes are created automatically in schema script
- For large datasets, consider adding additional indexes on frequently queried fields
- Use `ANALYZE` to update table statistics: `ANALYZE;`

## Next Steps

1. Update your Node.js backend to query from PostgreSQL instead of hard-coded data
2. Create API endpoints that interact with the database tables
3. Update frontend components to fetch data from backend APIs
4. Implement data validation and error handling
5. Add database migration tools (Flyway, Liquibase, or Sequelize) for future schema changes

## API Integration Example

### Example Node.js Query

```javascript
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: 'your_password',
    host: 'localhost',
    port: 5432,
    database: 'buildflow'
});

// Get all projects
async function getProjects() {
    const result = await pool.query('SELECT * FROM projects ORDER BY progress DESC');
    return result.rows;
}

// Get project with tasks
async function getProjectWithTasks(projectId) {
    const query = `
        SELECT p.*, 
               json_agg(json_build_object('id', t.id, 'title', t.title, 'status', t.status)) as tasks
        FROM projects p
        LEFT JOIN tasks t ON p.id = t.project_id
        WHERE p.id = $1
        GROUP BY p.id
    `;
    const result = await pool.query(query, [projectId]);
    return result.rows[0];
}
```

## Support & Documentation

For additional SQL functions and queries, refer to `03-queries.sql` for:
- Analytical queries
- Stored procedures
- Dashboard queries
- Risk assessment functions

---

**Last Updated**: May 2026
**Database Version**: PostgreSQL 12+
**Application**: BuildFlow Project Management System
