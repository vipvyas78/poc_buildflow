# Database Migration Guide - TypeScript to PostgreSQL

This guide explains how to migrate your BuildFlow application from hard-coded TypeScript data to PostgreSQL.

## Phase 1: Database Setup (Already Completed)

The SQL scripts in this directory have been created:
- `01-schema.sql` - Creates all tables and enums
- `02-data.sql` - Inserts sample data
- `03-queries.sql` - Utility functions and procedures

## Phase 2: Backend API Development

### 1. Install PostgreSQL Driver

```bash
cd services/boq-ai
npm install pg
npm install --save-dev @types/pg  # For TypeScript
```

### 2. Create Database Connection Module

Create `services/boq-ai/src/db.ts`:

```typescript
import { Pool, PoolClient } from 'pg';

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'buildflow',
});

export const getConnection = () => pool;
export const query = (text: string, params?: any[]) => pool.query(text, params);
export const getClient = () => pool.connect();

// Test connection
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export default pool;
```

### 3. Create Environment Configuration

Create `.env` file in your backend:

```env
# Database Configuration
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=buildflow

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Create Data Access Layer (DAL)

**Create `services/boq-ai/src/dal/projectsDAL.ts`:**

```typescript
import { query } from '../db';
import { Project } from '../types/project';

export async function getAllProjects(): Promise<Project[]> {
    const result = await query(`
        SELECT id, name, code, type, status, progress, value, 
               budget_variance, budget_status, deadline, location, 
               latitude, longitude, phase, team
        FROM projects
        ORDER BY progress DESC
    `);
    return result.rows;
}

export async function getProjectById(id: number): Promise<Project | null> {
    const result = await query(`
        SELECT * FROM projects WHERE id = $1
    `, [id]);
    return result.rows[0] || null;
}

export async function getProjectWithTasks(id: number) {
    const result = await query(`
        SELECT 
            p.id, p.name, p.code, p.type, p.status, p.progress, p.value,
            p.budget_variance, p.budget_status, p.deadline, p.location,
            p.latitude, p.longitude, p.phase, p.team,
            json_agg(json_build_object(
                'id', t.id,
                'title', t.title,
                'assignee', t.assignee,
                'status', t.status,
                'priority', t.priority,
                'dueDate', t.due_date,
                'completed', t.completed
            ) ORDER BY t.due_date) FILTER (WHERE t.id IS NOT NULL) as tasks
        FROM projects p
        LEFT JOIN tasks t ON p.id = t.project_id
        WHERE p.id = $1
        GROUP BY p.id
    `, [id]);
    return result.rows[0] || null;
}

export async function updateProjectProgress(id: number, progress: number) {
    const result = await query(`
        UPDATE projects 
        SET progress = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
    `, [progress, id]);
    return result.rows[0];
}
```

**Create `services/boq-ai/src/dal/tasksDAL.ts`:**

```typescript
import { query } from '../db';
import { Task } from '../types/task';

export async function getAllTasks(): Promise<Task[]> {
    const result = await query(`
        SELECT t.id, t.title, t.project_id as projectId, t.project_name as projectName,
               t.contractor, t.assignee, t.status, t.priority, t.due_date as dueDate,
               t.completed
        FROM tasks
        ORDER BY t.due_date ASC
    `);
    return result.rows;
}

export async function getTasksByProjectId(projectId: number): Promise<Task[]> {
    const result = await query(`
        SELECT * FROM tasks WHERE project_id = $1 ORDER BY due_date ASC
    `, [projectId]);
    return result.rows;
}

export async function updateTaskStatus(id: number, status: string) {
    const result = await query(`
        UPDATE tasks 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
    `, [status, id]);
    return result.rows[0];
}

export async function completeTask(id: number) {
    const result = await query(`
        UPDATE tasks 
        SET completed = TRUE, status = 'Completed', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
    `, [id]);
    return result.rows[0];
}

export async function getTasksByAssignee(assignee: string): Promise<Task[]> {
    const result = await query(`
        SELECT * FROM tasks WHERE assignee = $1 ORDER BY due_date ASC
    `, [assignee]);
    return result.rows;
}
```

**Create `services/boq-ai/src/dal/tendersDAL.ts`:**

```typescript
import { query } from '../db';

export async function getTenderById(id: number) {
    const result = await query(`SELECT * FROM tenders WHERE id = $1`, [id]);
    return result.rows[0] || null;
}

export async function getTenderWithDetails(id: number) {
    const tender = await query(`SELECT * FROM tenders WHERE id = $1`, [id]);
    const stages = await query(`SELECT * FROM tender_stages ORDER BY order_index`);
    const estimateRows = await query(`SELECT * FROM estimate_rows WHERE tender_id = $1`, [id]);
    const drawingUploads = await query(`SELECT * FROM drawing_uploads WHERE tender_id = $1`, [id]);
    const boqItems = await query(`SELECT * FROM generated_boq_items WHERE tender_id = $1`, [id]);
    const submissionFiles = await query(`SELECT * FROM submission_files WHERE tender_id = $1`, [id]);
    
    return {
        ...tender.rows[0],
        stages: stages.rows,
        estimateRows: estimateRows.rows,
        drawingUploads: drawingUploads.rows,
        boqItems: boqItems.rows,
        submissionFiles: submissionFiles.rows,
    };
}

export async function getTenderOptions() {
    const result = await query(`SELECT name FROM tender_options ORDER BY name`);
    return result.rows.map(r => r.name);
}

export async function getNrmModes() {
    const result = await query(`SELECT id, label, description FROM nrm_modes`);
    return result.rows;
}
```

### 5. Create API Routes

**Create `services/boq-ai/src/routes/projects.ts`:**

```typescript
import { Router, Request, Response } from 'express';
import * as projectsDAL from '../dal/projectsDAL';

const router = Router();

// Get all projects
router.get('/', async (req: Request, res: Response) => {
    try {
        const projects = await projectsDAL.getAllProjects();
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get project by ID with tasks
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const project = await projectsDAL.getProjectWithTasks(parseInt(req.params.id));
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update project progress
router.patch('/:id/progress', async (req: Request, res: Response) => {
    try {
        const { progress } = req.body;
        const project = await projectsDAL.updateProjectProgress(parseInt(req.params.id), progress);
        res.json(project);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
```

### 6. Update Express Server

**Update `services/boq-ai/src/server.ts`:**

```typescript
import express from 'express';
import cors from 'cors';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import tenderRoutes from './routes/tenders';
import db from './db';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tenders', tenderRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Connected to PostgreSQL database');
});
```

## Phase 3: Frontend Integration

### Update TypeScript Data Files

Replace imports from hard-coded data with API calls:

**Old approach (web/src/features/projects/data/projects.ts):**
```typescript
export const projects: Project[] = [
    { id: 1, name: "Canary Wharf Fit-Out", ... },
    // ... hard-coded data
];
```

**New approach (create web/src/services/api.ts):**
```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function getProjects() {
    const response = await fetch(`${API_BASE}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
}

export async function getProjectById(id: number) {
    const response = await fetch(`${API_BASE}/projects/${id}`);
    if (!response.ok) throw new Error('Failed to fetch project');
    return response.json();
}

export async function getTasks() {
    const response = await fetch(`${API_BASE}/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
}

export async function getTender(id: number) {
    const response = await fetch(`${API_BASE}/tenders/${id}`);
    if (!response.ok) throw new Error('Failed to fetch tender');
    return response.json();
}
```

### Update React Components

**Before (using hard-coded data):**
```typescript
import { projects } from '../data/projects';

export function ProjectsList() {
    return (
        <div>
            {projects.map(p => (
                <div key={p.id}>{p.name}</div>
            ))}
        </div>
    );
}
```

**After (using API):**
```typescript
import { useState, useEffect } from 'react';
import { getProjects } from '../../services/api';

export function ProjectsList() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        getProjects()
            .then(setProjects)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);
    
    if (loading) return <div>Loading...</div>;
    
    return (
        <div>
            {projects.map(p => (
                <div key={p.id}>{p.name}</div>
            ))}
        </div>
    );
}
```

## Phase 4: Deployment

### Production Considerations

1. **Use environment variables for database credentials**
2. **Enable SSL for database connections**
3. **Set up connection pooling**
4. **Implement backup and recovery procedures**
5. **Add database monitoring and alerting**
6. **Use migrations for schema changes** (Flyway, Liquibase, or Sequelize)

### Docker Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: buildflow
      POSTGRES_PASSWORD: buildflow_password
      POSTGRES_DB: buildflow
    ports:
      - "5432:5432"
    volumes:
      - ./database/01-schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/02-data.sql:/docker-entrypoint-initdb.d/02-data.sql
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./services/boq-ai
    environment:
      DB_USER: buildflow
      DB_PASSWORD: buildflow_password
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: buildflow
      PORT: 3000
    ports:
      - "3000:3000"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

## Verification Checklist

- [ ] PostgreSQL database created
- [ ] Schema script (01-schema.sql) executed successfully
- [ ] Data script (02-data.sql) executed and all records inserted
- [ ] Backend API routes created and tested
- [ ] Database connection pooling configured
- [ ] Frontend components updated to use API endpoints
- [ ] Environment variables configured
- [ ] API calls tested with Postman or similar tool
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Performance tested with load testing

## Rollback Plan

If issues occur:

1. Keep TypeScript data files as backup
2. Revert API imports to use local data temporarily
3. Fix database issues
4. Re-migrate data
5. Test thoroughly before re-deploying

---

For questions or issues, refer to the README.md in this directory.
