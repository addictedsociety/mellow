use argon2::{
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use chrono::{DateTime, Utc};
use rand_core::OsRng;
use rusqlite::{params, Connection, OptionalExtension, Row};
use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf, sync::Mutex};
use tauri::{Manager, State};

type CommandResult<T> = Result<T, String>;

struct AppState {
    db: Mutex<Connection>,
    current_user_id: Mutex<Option<i64>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct UserProfile {
    id: i64,
    username: String,
    language: String,
    theme: String,
    mode: String,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct Task {
    id: i64,
    title: String,
    description_markdown: String,
    status: String,
    created_at: String,
    updated_at: String,
    completed_at: Option<String>,
    total_seconds: i64,
    is_running: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct TimeEntry {
    id: i64,
    task_id: i64,
    task_title: String,
    start_time: Option<String>,
    end_time: Option<String>,
    duration_seconds: i64,
    note_markdown: String,
    entry_type: String,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct DashboardSummary {
    running_entries: Vec<TimeEntry>,
    today_seconds: i64,
    tasks: Vec<Task>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RegisterPayload {
    username: String,
    password: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LoginPayload {
    username: String,
    password: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct TaskPayload {
    title: String,
    description_markdown: Option<String>,
    status: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ManualTimeEntryPayload {
    task_id: i64,
    duration_seconds: i64,
    date: Option<String>,
    note_markdown: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SettingsPayload {
    username: String,
    language: String,
    theme: String,
    mode: String,
}

fn now_string() -> String {
    Utc::now().to_rfc3339()
}

fn get_connection<'a>(
    state: &'a State<'_, AppState>,
) -> CommandResult<std::sync::MutexGuard<'a, Connection>> {
    state
        .db
        .lock()
        .map_err(|_| "Database lock failed".to_string())
}

fn get_current_user_id(state: &State<AppState>) -> CommandResult<i64> {
    state
        .current_user_id
        .lock()
        .map_err(|_| "Session lock failed".to_string())?
        .ok_or_else(|| "Not authenticated".to_string())
}

fn create_password_hash(password: &str) -> CommandResult<String> {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|_| "Could not hash password".to_string())
}

fn verify_password(password: &str, hash: &str) -> CommandResult<bool> {
    let parsed_hash = PasswordHash::new(hash).map_err(|_| "Invalid password hash".to_string())?;

    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}

fn app_data_path(app: &tauri::App) -> CommandResult<PathBuf> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not resolve app data directory: {error}"))?;

    fs::create_dir_all(&dir)
        .map_err(|error| format!("Could not create app data directory: {error}"))?;

    Ok(dir.join("mellow.sqlite"))
}

fn init_database(connection: &Connection) -> CommandResult<()> {
    connection
        .execute_batch(
            "
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                language TEXT NOT NULL DEFAULT 'de',
                theme TEXT NOT NULL DEFAULT 'violet-bloom',
                mode TEXT NOT NULL DEFAULT 'light',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description_markdown TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'todo',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                completed_at TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS time_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER NOT NULL,
                start_time TEXT,
                end_time TEXT,
                duration_seconds INTEGER NOT NULL DEFAULT 0,
                note_markdown TEXT NOT NULL DEFAULT '',
                entry_type TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
            );
            ",
        )
        .map_err(|error| format!("Could not initialize database: {error}"))?;

    let has_mode_column = connection
        .prepare("SELECT 1 FROM pragma_table_info('users') WHERE name = 'mode'")
        .and_then(|mut stmt| stmt.exists([]))
        .map_err(|error| format!("Could not inspect users schema: {error}"))?;

    if !has_mode_column {
        connection
            .execute_batch(
                "
                ALTER TABLE users ADD COLUMN mode TEXT NOT NULL DEFAULT 'light';
                UPDATE users SET mode = theme, theme = 'violet-bloom'
                WHERE theme IN ('light', 'dark');
                ",
            )
            .map_err(|error| format!("Could not migrate users schema: {error}"))?;
    }

    let has_duration_minutes = connection
        .prepare("SELECT 1 FROM pragma_table_info('time_entries') WHERE name = 'duration_minutes'")
        .and_then(|mut stmt| stmt.exists([]))
        .map_err(|error| format!("Could not inspect time_entries schema: {error}"))?;

    if has_duration_minutes {
        connection
            .execute_batch(
                "
                ALTER TABLE time_entries RENAME COLUMN duration_minutes TO duration_seconds;
                UPDATE time_entries SET duration_seconds = duration_seconds * 60;
                ",
            )
            .map_err(|error| {
                format!("Could not migrate time_entries duration column: {error}")
            })?;
    }

    connection
        .execute_batch("DROP INDEX IF EXISTS one_running_timer;")
        .map_err(|error| format!("Could not drop legacy timer index: {error}"))?;

    Ok(())
}

fn row_to_user(row: &Row<'_>) -> rusqlite::Result<UserProfile> {
    Ok(UserProfile {
        id: row.get(0)?,
        username: row.get(1)?,
        language: row.get(2)?,
        theme: row.get(3)?,
        mode: row.get(4)?,
        created_at: row.get(5)?,
        updated_at: row.get(6)?,
    })
}

fn row_to_task(row: &Row<'_>) -> rusqlite::Result<Task> {
    Ok(Task {
        id: row.get(0)?,
        title: row.get(1)?,
        description_markdown: row.get(2)?,
        status: row.get(3)?,
        created_at: row.get(4)?,
        updated_at: row.get(5)?,
        completed_at: row.get(6)?,
        total_seconds: row.get(7)?,
        is_running: row.get::<_, i64>(8)? > 0,
    })
}

fn row_to_time_entry(row: &Row<'_>) -> rusqlite::Result<TimeEntry> {
    Ok(TimeEntry {
        id: row.get(0)?,
        task_id: row.get(1)?,
        task_title: row.get(2)?,
        start_time: row.get(3)?,
        end_time: row.get(4)?,
        duration_seconds: row.get(5)?,
        note_markdown: row.get(6)?,
        entry_type: row.get(7)?,
        created_at: row.get(8)?,
        updated_at: row.get(9)?,
    })
}

fn fetch_user(connection: &Connection, user_id: i64) -> CommandResult<UserProfile> {
    connection
        .query_row(
            "SELECT id, username, language, theme, mode, created_at, updated_at FROM users WHERE id = ?1",
            params![user_id],
            row_to_user,
        )
        .map_err(|error| format!("Could not fetch user: {error}"))
}

fn fetch_task(connection: &Connection, task_id: i64, user_id: i64) -> CommandResult<Task> {
    connection
        .query_row(
            "
            SELECT
                t.id,
                t.title,
                t.description_markdown,
                t.status,
                t.created_at,
                t.updated_at,
                t.completed_at,
                COALESCE(SUM(te.duration_seconds), 0) AS total_seconds,
                EXISTS(
                    SELECT 1 FROM time_entries running
                    WHERE running.task_id = t.id
                      AND running.entry_type = 'tracked'
                      AND running.end_time IS NULL
                ) AS is_running
            FROM tasks t
            LEFT JOIN time_entries te ON te.task_id = t.id
            WHERE t.id = ?1 AND t.user_id = ?2
            GROUP BY t.id
            ",
            params![task_id, user_id],
            row_to_task,
        )
        .map_err(|error| format!("Could not fetch task: {error}"))
}

fn fetch_tasks(connection: &Connection, user_id: i64) -> CommandResult<Vec<Task>> {
    let mut statement = connection
        .prepare(
            "
            SELECT
                t.id,
                t.title,
                t.description_markdown,
                t.status,
                t.created_at,
                t.updated_at,
                t.completed_at,
                COALESCE(SUM(te.duration_seconds), 0) AS total_seconds,
                EXISTS(
                    SELECT 1 FROM time_entries running
                    WHERE running.task_id = t.id
                      AND running.entry_type = 'tracked'
                      AND running.end_time IS NULL
                ) AS is_running
            FROM tasks t
            LEFT JOIN time_entries te ON te.task_id = t.id
            WHERE t.user_id = ?1
            GROUP BY t.id
            ORDER BY
                CASE t.status
                    WHEN 'in_progress' THEN 0
                    WHEN 'todo' THEN 1
                    ELSE 2
                END,
                t.updated_at DESC
            ",
        )
        .map_err(|error| format!("Could not prepare task query: {error}"))?;

    let rows = statement
        .query_map(params![user_id], row_to_task)
        .map_err(|error| format!("Could not list tasks: {error}"))?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| format!("Could not map tasks: {error}"))
}

fn fetch_running_entries(connection: &Connection, user_id: i64) -> CommandResult<Vec<TimeEntry>> {
    let mut statement = connection
        .prepare(
            "
            SELECT
                te.id,
                te.task_id,
                t.title,
                te.start_time,
                te.end_time,
                te.duration_seconds,
                te.note_markdown,
                te.entry_type,
                te.created_at,
                te.updated_at
            FROM time_entries te
            INNER JOIN tasks t ON t.id = te.task_id
            WHERE t.user_id = ?1 AND te.entry_type = 'tracked' AND te.end_time IS NULL
            ORDER BY te.start_time DESC
            ",
        )
        .map_err(|error| format!("Could not prepare running timers query: {error}"))?;

    let rows = statement
        .query_map(params![user_id], row_to_time_entry)
        .map_err(|error| format!("Could not fetch running timers: {error}"))?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| format!("Could not map running timers: {error}"))
}

fn fetch_running_entry_for_task(
    connection: &Connection,
    user_id: i64,
    task_id: i64,
) -> CommandResult<Option<TimeEntry>> {
    connection
        .query_row(
            "
            SELECT
                te.id,
                te.task_id,
                t.title,
                te.start_time,
                te.end_time,
                te.duration_seconds,
                te.note_markdown,
                te.entry_type,
                te.created_at,
                te.updated_at
            FROM time_entries te
            INNER JOIN tasks t ON t.id = te.task_id
            WHERE t.user_id = ?1
              AND te.task_id = ?2
              AND te.entry_type = 'tracked'
              AND te.end_time IS NULL
            LIMIT 1
            ",
            params![user_id, task_id],
            row_to_time_entry,
        )
        .optional()
        .map_err(|error| format!("Could not fetch running timer for task: {error}"))
}

#[tauri::command]
fn has_users(state: State<AppState>) -> CommandResult<bool> {
    let connection = get_connection(&state)?;
    let count: i64 = connection
        .query_row("SELECT COUNT(*) FROM users", [], |row| row.get(0))
        .map_err(|error| format!("Could not count users: {error}"))?;

    Ok(count > 0)
}

#[tauri::command]
fn current_user(state: State<AppState>) -> CommandResult<Option<UserProfile>> {
    let user_id = *state
        .current_user_id
        .lock()
        .map_err(|_| "Session lock failed".to_string())?;
    let Some(user_id) = user_id else {
        return Ok(None);
    };

    let connection = get_connection(&state)?;
    fetch_user(&connection, user_id).map(Some)
}

#[tauri::command]
fn register_user(payload: RegisterPayload, state: State<AppState>) -> CommandResult<UserProfile> {
    if payload.username.trim().is_empty() || payload.password.len() < 8 {
        return Err(
            "Username is required and password must have at least 8 characters".to_string(),
        );
    }

    let connection = get_connection(&state)?;
    let now = now_string();
    let password_hash = create_password_hash(&payload.password)?;

    connection
        .execute(
            "
            INSERT INTO users (username, password_hash, language, theme, mode, created_at, updated_at)
            VALUES (?1, ?2, 'de', 'violet-bloom', 'light', ?3, ?3)
            ",
            params![payload.username.trim(), password_hash, now],
        )
        .map_err(|error| {
            if error.to_string().contains("UNIQUE") {
                "Username already exists".to_string()
            } else {
                format!("Could not create user: {error}")
            }
        })?;

    let user_id = connection.last_insert_rowid();
    *state
        .current_user_id
        .lock()
        .map_err(|_| "Session lock failed".to_string())? = Some(user_id);

    fetch_user(&connection, user_id)
}

#[tauri::command]
fn login(payload: LoginPayload, state: State<AppState>) -> CommandResult<UserProfile> {
    let connection = get_connection(&state)?;
    let user = connection
        .query_row(
            "
            SELECT id, username, password_hash, language, theme, mode, created_at, updated_at
            FROM users
            WHERE username = ?1
            ",
            params![payload.username.trim()],
            |row| {
                Ok((
                    row.get::<_, i64>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                    row.get::<_, String>(3)?,
                    row.get::<_, String>(4)?,
                    row.get::<_, String>(5)?,
                    row.get::<_, String>(6)?,
                    row.get::<_, String>(7)?,
                ))
            },
        )
        .optional()
        .map_err(|error| format!("Could not fetch user: {error}"))?;

    let Some((id, username, password_hash, language, theme, mode, created_at, updated_at)) = user
    else {
        return Err("Invalid credentials".to_string());
    };

    if !verify_password(&payload.password, &password_hash)? {
        return Err("Invalid credentials".to_string());
    }

    *state
        .current_user_id
        .lock()
        .map_err(|_| "Session lock failed".to_string())? = Some(id);

    Ok(UserProfile {
        id,
        username,
        language,
        theme,
        mode,
        created_at,
        updated_at,
    })
}

#[tauri::command]
fn logout(state: State<AppState>) -> CommandResult<()> {
    *state
        .current_user_id
        .lock()
        .map_err(|_| "Session lock failed".to_string())? = None;

    Ok(())
}

#[tauri::command]
fn list_tasks(state: State<AppState>) -> CommandResult<Vec<Task>> {
    let user_id = get_current_user_id(&state)?;
    let connection = get_connection(&state)?;
    fetch_tasks(&connection, user_id)
}

#[tauri::command]
fn create_task(payload: TaskPayload, state: State<AppState>) -> CommandResult<Task> {
    let user_id = get_current_user_id(&state)?;
    let title = payload.title.trim();

    if title.is_empty() {
        return Err("Task title is required".to_string());
    }

    let status = payload.status.unwrap_or_else(|| "todo".to_string());
    let description = payload.description_markdown.unwrap_or_default();
    let now = now_string();
    let connection = get_connection(&state)?;

    connection
        .execute(
            "
            INSERT INTO tasks (user_id, title, description_markdown, status, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?5)
            ",
            params![user_id, title, description, status, now],
        )
        .map_err(|error| format!("Could not create task: {error}"))?;

    fetch_task(&connection, connection.last_insert_rowid(), user_id)
}

#[tauri::command]
fn update_task(id: i64, payload: TaskPayload, state: State<AppState>) -> CommandResult<Task> {
    let user_id = get_current_user_id(&state)?;
    let title = payload.title.trim();

    if title.is_empty() {
        return Err("Task title is required".to_string());
    }

    let status = payload.status.unwrap_or_else(|| "todo".to_string());
    let completed_at = if status == "done" {
        Some(now_string())
    } else {
        None
    };
    let now = now_string();
    let connection = get_connection(&state)?;

    connection
        .execute(
            "
            UPDATE tasks
            SET title = ?1,
                description_markdown = ?2,
                status = ?3,
                completed_at = ?4,
                updated_at = ?5
            WHERE id = ?6 AND user_id = ?7
            ",
            params![
                title,
                payload.description_markdown.unwrap_or_default(),
                status,
                completed_at,
                now,
                id,
                user_id
            ],
        )
        .map_err(|error| format!("Could not update task: {error}"))?;

    fetch_task(&connection, id, user_id)
}

#[tauri::command]
fn delete_task(id: i64, state: State<AppState>) -> CommandResult<()> {
    let user_id = get_current_user_id(&state)?;
    let connection = get_connection(&state)?;

    connection
        .execute(
            "DELETE FROM tasks WHERE id = ?1 AND user_id = ?2",
            params![id, user_id],
        )
        .map_err(|error| format!("Could not delete task: {error}"))?;

    Ok(())
}

#[tauri::command]
fn complete_task(id: i64, state: State<AppState>) -> CommandResult<Task> {
    let user_id = get_current_user_id(&state)?;
    let now = now_string();
    let connection = get_connection(&state)?;

    connection
        .execute(
            "
            UPDATE tasks
            SET status = 'done', completed_at = ?1, updated_at = ?1
            WHERE id = ?2 AND user_id = ?3
            ",
            params![now, id, user_id],
        )
        .map_err(|error| format!("Could not complete task: {error}"))?;

    fetch_task(&connection, id, user_id)
}

#[tauri::command]
fn start_timer(task_id: i64, state: State<AppState>) -> CommandResult<TimeEntry> {
    let user_id = get_current_user_id(&state)?;
    let connection = get_connection(&state)?;

    if fetch_running_entry_for_task(&connection, user_id, task_id)?.is_some() {
        return Err("A timer for this task is already running".to_string());
    }

    fetch_task(&connection, task_id, user_id)?;
    let now = now_string();

    connection
        .execute(
            "
            INSERT INTO time_entries
                (task_id, start_time, end_time, duration_seconds, note_markdown, entry_type, created_at, updated_at)
            VALUES (?1, ?2, NULL, 0, '', 'tracked', ?2, ?2)
            ",
            params![task_id, now],
        )
        .map_err(|error| format!("Could not start timer: {error}"))?;

    connection
        .execute(
            "UPDATE tasks SET status = 'in_progress', updated_at = ?1 WHERE id = ?2",
            params![now, task_id],
        )
        .map_err(|error| format!("Could not update task status: {error}"))?;

    fetch_running_entry_for_task(&connection, user_id, task_id)?
        .ok_or_else(|| "Could not start timer".to_string())
}

#[tauri::command]
fn stop_timer(task_id: i64, state: State<AppState>) -> CommandResult<TimeEntry> {
    let user_id = get_current_user_id(&state)?;
    let connection = get_connection(&state)?;
    let entry = fetch_running_entry_for_task(&connection, user_id, task_id)?
        .ok_or_else(|| "No running timer found for this task".to_string())?;
    let start_time = entry
        .start_time
        .as_deref()
        .ok_or_else(|| "Running timer has no start time".to_string())?;
    let started_at = DateTime::parse_from_rfc3339(start_time)
        .map_err(|_| "Invalid timer start time".to_string())?
        .with_timezone(&Utc);
    let stopped_at = Utc::now();
    let duration_seconds = (stopped_at - started_at).num_seconds().max(0);
    let stopped_at_string = stopped_at.to_rfc3339();

    connection
        .execute(
            "
            UPDATE time_entries
            SET end_time = ?1, duration_seconds = ?2, updated_at = ?1
            WHERE id = ?3
            ",
            params![stopped_at_string, duration_seconds, entry.id],
        )
        .map_err(|error| format!("Could not stop timer: {error}"))?;

    connection
        .query_row(
            "
            SELECT
                te.id,
                te.task_id,
                t.title,
                te.start_time,
                te.end_time,
                te.duration_seconds,
                te.note_markdown,
                te.entry_type,
                te.created_at,
                te.updated_at
            FROM time_entries te
            INNER JOIN tasks t ON t.id = te.task_id
            WHERE te.id = ?1
            ",
            params![entry.id],
            row_to_time_entry,
        )
        .map_err(|error| format!("Could not fetch stopped timer: {error}"))
}

#[tauri::command]
fn get_running_entries(state: State<AppState>) -> CommandResult<Vec<TimeEntry>> {
    let user_id = get_current_user_id(&state)?;
    let connection = get_connection(&state)?;

    fetch_running_entries(&connection, user_id)
}

#[tauri::command]
fn create_manual_time_entry(
    payload: ManualTimeEntryPayload,
    state: State<AppState>,
) -> CommandResult<TimeEntry> {
    let user_id = get_current_user_id(&state)?;

    if payload.duration_seconds <= 0 {
        return Err("Duration must be greater than zero".to_string());
    }

    let connection = get_connection(&state)?;
    fetch_task(&connection, payload.task_id, user_id)?;
    let now = now_string();
    let start_time = payload.date.unwrap_or_else(|| now.clone());
    let note = payload.note_markdown.unwrap_or_default();

    connection
        .execute(
            "
            INSERT INTO time_entries
                (task_id, start_time, end_time, duration_seconds, note_markdown, entry_type, created_at, updated_at)
            VALUES (?1, ?2, ?2, ?3, ?4, 'manual', ?5, ?5)
            ",
            params![payload.task_id, start_time, payload.duration_seconds, note, now],
        )
        .map_err(|error| format!("Could not create manual time entry: {error}"))?;

    let entry_id = connection.last_insert_rowid();
    connection
        .query_row(
            "
            SELECT
                te.id,
                te.task_id,
                t.title,
                te.start_time,
                te.end_time,
                te.duration_seconds,
                te.note_markdown,
                te.entry_type,
                te.created_at,
                te.updated_at
            FROM time_entries te
            INNER JOIN tasks t ON t.id = te.task_id
            WHERE te.id = ?1
            ",
            params![entry_id],
            row_to_time_entry,
        )
        .map_err(|error| format!("Could not fetch manual time entry: {error}"))
}

#[tauri::command]
fn list_time_entries(
    task_id: Option<i64>,
    state: State<AppState>,
) -> CommandResult<Vec<TimeEntry>> {
    let user_id = get_current_user_id(&state)?;
    let connection = get_connection(&state)?;

    let (sql, bind_task) = if task_id.is_some() {
        (
            "
            SELECT
                te.id,
                te.task_id,
                t.title,
                te.start_time,
                te.end_time,
                te.duration_seconds,
                te.note_markdown,
                te.entry_type,
                te.created_at,
                te.updated_at
            FROM time_entries te
            INNER JOIN tasks t ON t.id = te.task_id
            WHERE t.user_id = ?1 AND te.task_id = ?2
            ORDER BY te.created_at DESC
            ",
            true,
        )
    } else {
        (
            "
            SELECT
                te.id,
                te.task_id,
                t.title,
                te.start_time,
                te.end_time,
                te.duration_seconds,
                te.note_markdown,
                te.entry_type,
                te.created_at,
                te.updated_at
            FROM time_entries te
            INNER JOIN tasks t ON t.id = te.task_id
            WHERE t.user_id = ?1
            ORDER BY te.created_at DESC
            ",
            false,
        )
    };

    let mut statement = connection
        .prepare(sql)
        .map_err(|error| format!("Could not prepare time entry query: {error}"))?;

    let entries = if bind_task {
        statement.query_map(params![user_id, task_id], row_to_time_entry)
    } else {
        statement.query_map(params![user_id], row_to_time_entry)
    }
    .map_err(|error| format!("Could not list time entries: {error}"))?;

    entries
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| format!("Could not map time entries: {error}"))
}

#[tauri::command]
fn dashboard_summary(state: State<AppState>) -> CommandResult<DashboardSummary> {
    let user_id = get_current_user_id(&state)?;
    let connection = get_connection(&state)?;
    let today_prefix = Utc::now().format("%Y-%m-%d").to_string();
    let today_seconds: i64 = connection
        .query_row(
            "
            SELECT COALESCE(SUM(te.duration_seconds), 0)
            FROM time_entries te
            INNER JOIN tasks t ON t.id = te.task_id
            WHERE t.user_id = ?1 AND te.start_time LIKE ?2
            ",
            params![user_id, format!("{today_prefix}%")],
            |row| row.get(0),
        )
        .map_err(|error| format!("Could not calculate today total: {error}"))?;

    Ok(DashboardSummary {
        running_entries: fetch_running_entries(&connection, user_id)?,
        today_seconds,
        tasks: fetch_tasks(&connection, user_id)?,
    })
}

#[tauri::command]
fn update_settings(payload: SettingsPayload, state: State<AppState>) -> CommandResult<UserProfile> {
    let user_id = get_current_user_id(&state)?;
    let now = now_string();
    let connection = get_connection(&state)?;

    connection
        .execute(
            "
            UPDATE users
            SET username = ?1, language = ?2, theme = ?3, mode = ?4, updated_at = ?5
            WHERE id = ?6
            ",
            params![
                payload.username.trim(),
                payload.language,
                payload.theme,
                payload.mode,
                now,
                user_id
            ],
        )
        .map_err(|error| format!("Could not update settings: {error}"))?;

    fetch_user(&connection, user_id)
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| -> Result<(), Box<dyn std::error::Error>> {
            let database_path = app_data_path(app)
                .map_err(|error| std::io::Error::new(std::io::ErrorKind::Other, error))?;
            let connection = Connection::open(database_path)
                .map_err(|error| std::io::Error::new(std::io::ErrorKind::Other, error))?;
            init_database(&connection)
                .map_err(|error| std::io::Error::new(std::io::ErrorKind::Other, error))?;

            app.manage(AppState {
                db: Mutex::new(connection),
                current_user_id: Mutex::new(None),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            has_users,
            current_user,
            register_user,
            login,
            logout,
            list_tasks,
            create_task,
            update_task,
            delete_task,
            complete_task,
            start_timer,
            stop_timer,
            get_running_entries,
            create_manual_time_entry,
            list_time_entries,
            dashboard_summary,
            update_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running Mellow");
}
