import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

/** SQLite-backed D1 interface for integration tests and loopback development only. */
export class SqliteD1 {
  constructor(filename = ':memory:') {
    this.sqlite = new DatabaseSync(filename);
    this.sqlite.exec('PRAGMA foreign_keys = ON');
  }
  migrate() {
    this.sqlite.exec('CREATE TABLE IF NOT EXISTS local_schema_migrations (name TEXT PRIMARY KEY)');
    const name = '0000_assisted_pilot';
    if (!this.sqlite.prepare('SELECT name FROM local_schema_migrations WHERE name = ?').get(name)) {
      const source = readFileSync(new URL('../../drizzle/0000_assisted_pilot.sql', import.meta.url), 'utf8');
      this.sqlite.exec('BEGIN IMMEDIATE');
      try {
        this.sqlite.exec(source);
        this.sqlite.prepare('INSERT INTO local_schema_migrations (name) VALUES (?)').run(name);
        this.sqlite.exec('COMMIT');
      } catch (error) { this.sqlite.exec('ROLLBACK'); throw error; }
    }
    return this;
  }
  prepare(sql) { return new SqliteStatement(this, sql, []); }
  async batch(statements) {
    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      const results = statements.map(statement => statement.execute());
      this.sqlite.exec('COMMIT');
      return results;
    } catch (error) { this.sqlite.exec('ROLLBACK'); throw error; }
  }
  close() { this.sqlite.close(); }
}
export { SqliteD1 as SQLiteD1 };
class SqliteStatement {
  constructor(database, sql, values) { this.database = database; this.sql = sql; this.values = values; }
  bind(...values) { return new SqliteStatement(this.database, this.sql, values); }
  async first(column) {
    const row = this.database.sqlite.prepare(this.sql).get(...this.values);
    return row ? column ? row[column] : { ...row } : null;
  }
  async all() { return { success: true, results: this.database.sqlite.prepare(this.sql).all(...this.values).map(row => ({ ...row })), meta: {} }; }
  execute() {
    const result = this.database.sqlite.prepare(this.sql).run(...this.values);
    return { success: true, results: [], meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) } };
  }
  async run() { return this.execute(); }
}
