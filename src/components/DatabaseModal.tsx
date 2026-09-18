import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Play,
  Terminal,
  Table,
  Layers,
  FileCode,
  Server,
  Zap,
  ShieldAlert,
} from 'lucide-react';

interface DatabaseModalProps {
  isOpen: boolean;
  isAdmin?: boolean;
  onClose: () => void;
  primaryColor?: string;
}

interface DbTableInfo {
  name: string;
  rowCount: number;
  description: string;
  columns: string[];
}

const DEFAULT_TABLES: DbTableInfo[] = [
  {
    name: 'users',
    rowCount: 2,
    description: 'User authentication, roles, and created timestamps',
    columns: ['id VARCHAR(36) PK', 'email VARCHAR(254) UNIQUE', 'password_hash VARCHAR(255)', 'role VARCHAR(20)', 'created_at TIMESTAMP'],
  },
  {
    name: 'chat_messages',
    rowCount: 8,
    description: 'Direct messages & WhatsApp-synced chat with composite indexes',
    columns: ['id VARCHAR(36) PK', 'sender_id VARCHAR(36)', 'sender_email VARCHAR(254)', 'recipient_id VARCHAR(36)', 'message_text VARCHAR(1000)', 'sent_at TIMESTAMP(6)'],
  },
  {
    name: 'live_classes',
    rowCount: 3,
    description: 'Scheduled live yoga & dance classes with meeting links',
    columns: ['id VARCHAR(36) PK', 'title VARCHAR(120)', 'description VARCHAR(500)', 'start_time DATETIME', 'duration_minutes INT', 'meeting_url VARCHAR(2048)'],
  },
  {
    name: 'class_attendees',
    rowCount: 4,
    description: 'User enrollment in live classes (Composite PK)',
    columns: ['class_id VARCHAR(36) PK', 'user_id VARCHAR(36) PK', 'joined_at TIMESTAMP'],
  },
  {
    name: 'media_items',
    rowCount: 5,
    description: 'Practice videos, audio mantras, and mudra images',
    columns: ['id VARCHAR(36) PK', 'user_id VARCHAR(100)', 'name VARCHAR(255)', 'media_type VARCHAR(20)', 'url VARCHAR(2048)', 'created_at TIMESTAMP'],
  },
  {
    name: 'profiles',
    rowCount: 2,
    description: 'User profile pictures, phone numbers, and bios',
    columns: ['user_id VARCHAR(100) PK', 'profile_picture_url VARCHAR(2048)', 'phone VARCHAR(30)', 'bio VARCHAR(500)', 'updated_at TIMESTAMP'],
  },
];

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  isAdmin = true,
  onClose,
  primaryColor = '#781D32',
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'query' | 'jdbc'>('status');
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // SQL Query console state
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM live_classes LIMIT 10;');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryDuration, setQueryDuration] = useState<number | null>(null);

  // Migration status
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-[#FDF8F5] max-w-md w-full rounded-[28px] overflow-hidden shadow-2xl border border-[#F2E6E2] p-7 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1F161A]">Administrator Access Only</h3>
          <p className="text-xs text-[#7D6D73] mt-2 mb-6 leading-relaxed">
            The MySQL &amp; JDBC Database workstation is restricted strictly to administrators. You are currently logged in with practitioner member privileges.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-white font-semibold text-xs cursor-pointer transition hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            Close Workstation
          </button>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRunMigration = async () => {
    setLoading(true);
    setMigrationStatus(null);
    try {
      const res = await fetch('/api/db/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'ADMIN' },
        body: JSON.stringify({ role: 'ADMIN' }),
      });
      const data = await res.json();
      setMigrationStatus(data.message || 'Migration applied successfully');
      fetchStatus();
    } catch (err: any) {
      setMigrationStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteQuery = async (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    setQueryLoading(true);
    setQueryError(null);
    setQueryResult(null);
    const start = performance.now();

    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'ADMIN' },
        body: JSON.stringify({ sql: q, role: 'ADMIN' }),
      });
      const data = await res.json();
      const end = performance.now();
      setQueryDuration(Math.round(end - start));

      if (res.ok) {
        setQueryResult(data);
      } else {
        setQueryError(data.error || 'Execution failed');
      }
    } catch (err: any) {
      setQueryError(err.message || 'Network error');
    } finally {
      setQueryLoading(false);
    }
  };

  const jdbcUrl =
    dbStatus?.config?.jdbcUrl ||
    'jdbc:mysql://localhost:3306/nrityasana?createDatabaseIfNotExist=true&serverTimezone=UTC';

  const isConnected = dbStatus?.connected ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#F2E6E2]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#F2E6E2] bg-[#FDF8F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[#1F161A]">
                  MySQL & JDBC Database
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    isConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  {isConnected ? 'MySQL Connected' : 'Standby / Fallback'}
                </span>
              </div>
              <p className="text-xs text-[#7D6D73]">
                Spring Boot JDBC DataSource & Node.js MySQL2 Connection Pool
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={fetchStatus}
              disabled={loading}
              title="Refresh connection status"
              className="p-2 hover:bg-black/5 rounded-lg text-[#6B5C62] transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/5 rounded-lg text-[#6B5C62] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#F2E6E2] px-5 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'status'
                ? 'border-[#781D32] text-[#781D32]'
                : 'border-transparent text-[#7D6D73] hover:text-[#1F161A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Schema & Tables
          </button>
          <button
            onClick={() => setActiveTab('query')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'query'
                ? 'border-[#781D32] text-[#781D32]'
                : 'border-transparent text-[#7D6D73] hover:text-[#1F161A]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            SQL Console
          </button>
          <button
            onClick={() => setActiveTab('jdbc')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'jdbc'
                ? 'border-[#781D32] text-[#781D32]'
                : 'border-transparent text-[#7D6D73] hover:text-[#1F161A]'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            JDBC & Spring Boot
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: STATUS & SCHEMA */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* JDBC URL Quick Box */}
              <div className="p-3.5 rounded-xl bg-[#FDF8F5] border border-[#F2E6E2] flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#781D32]">
                    <Zap className="w-3 h-3" />
                    Target JDBC URL:
                  </div>
                  <code className="text-xs font-mono text-[#1F161A] block truncate mt-0.5">
                    {jdbcUrl}
                  </code>
                </div>
                <button
                  onClick={() => copyToClipboard(jdbcUrl, 'jdbc')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#F2E6E2] hover:bg-[#FAF3F0] text-xs font-medium text-[#1F161A] flex items-center gap-1 shrink-0 transition cursor-pointer"
                >
                  {copiedField === 'jdbc' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#7D6D73]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Migration Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Database Schema Migration
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Executes `CREATE TABLE IF NOT EXISTS` for all 6 tables from `schema.sql`
                  </p>
                </div>
                <button
                  onClick={handleRunMigration}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-[#781D32] hover:bg-[#5E1627] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Run Migrations
                </button>
              </div>

              {migrationStatus && (
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{migrationStatus}</span>
                </div>
              )}

              {/* Tables Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#1F161A] flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-[#781D32]" />
                  Active Tables in MySQL Schema
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DEFAULT_TABLES.map((tbl) => {
                    const matched = dbStatus?.tables?.find((t: any) => t.name === tbl.name);
                    const count = matched?.rowCount ?? tbl.rowCount;

                    return (
                      <div
                        key={tbl.name}
                        className="p-3 rounded-xl border border-[#F2E6E2] bg-white hover:border-[#781D32]/40 transition space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#781D32] bg-[#FAF3F0] px-2 py-0.5 rounded">
                            {tbl.name}
                          </span>
                          <span className="text-[11px] font-semibold text-[#7D6D73]">
                            {count} rows
                          </span>
                        </div>
                        <p className="text-[11px] text-[#54656F] leading-snug">
                          {tbl.description}
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                          {tbl.columns.slice(0, 3).map((col, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded"
                            >
                              {col.split(' ')[0]}
                            </span>
                          ))}
                          {tbl.columns.length > 3 && (
                            <span className="text-[9px] font-mono text-slate-400">
                              +{tbl.columns.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SQL QUERY CONSOLE */}
          {activeTab === 'query' && (
            <div className="space-y-3">
              {/* Quick Preset Queries */}
              <div>
                <label className="text-[11px] font-bold text-[#7D6D73] uppercase tracking-wider block mb-1">
                  Sample Queries
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'SELECT * FROM live_classes LIMIT 5;',
                    'SELECT * FROM users;',
                    'SELECT * FROM chat_messages ORDER BY sent_at DESC LIMIT 5;',
                    'SELECT * FROM media_items LIMIT 5;',
                    'SHOW TABLES;',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setSqlQuery(preset);
                        handleExecuteQuery(preset);
                      }}
                      className="text-[11px] font-mono px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* SQL Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1F161A]">
                    SQL Statement
                  </label>
                  {queryDuration !== null && (
                    <span className="text-[10px] text-emerald-600 font-mono">
                      Completed in {queryDuration}ms
                    </span>
                  )}
                </div>
                <div className="relative">
                  <textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    rows={3}
                    className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="SELECT * FROM users;"
                  />
                  <button
                    onClick={() => handleExecuteQuery()}
                    disabled={queryLoading || !sqlQuery.trim()}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {queryLoading ? 'Running...' : 'Execute'}
                  </button>
                </div>
              </div>

              {/* Query Error */}
              {queryError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{queryError}</span>
                </div>
              )}

              {/* Query Result Table */}
              {queryResult && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-[#7D6D73]">
                    <span>Results ({queryResult.rowCount || queryResult.rows?.length || 0} rows)</span>
                  </div>
                  <div className="max-h-60 overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 bg-white">
                    {queryResult.rows && queryResult.rows.length > 0 ? (
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                          <tr>
                            {Object.keys(queryResult.rows[0]).map((col) => (
                              <th key={col} className="px-3 py-2 font-semibold">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                          {queryResult.rows.map((row: any, rIdx: number) => (
                            <tr key={rIdx} className="hover:bg-slate-50">
                              {Object.keys(queryResult.rows[0]).map((col) => (
                                <td key={col} className="px-3 py-1.5 truncate max-w-[200px]">
                                  {row[col] !== null ? String(row[col]) : 'NULL'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400">
                        Query returned 0 rows or executed command successfully.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: JDBC & SPRING BOOT */}
          {activeTab === 'jdbc' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-[#781D32]" />
                  Spring Boot `application.properties` (JDBC Config)
                </h4>
                <div className="relative">
                  <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`# Spring Boot JDBC DataSource
spring.datasource.url=${jdbcUrl}
spring.datasource.username=nrityasana
spring.datasource.password=nrityasana-dev-password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Connection Pool (HikariCP)
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.connection-timeout=20000

# Auto-Initialize Schema
spring.sql.init.mode=always
spring.sql.init.schema-locations=classpath:schema.sql`}
                  </pre>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `spring.datasource.url=${jdbcUrl}\nspring.datasource.username=nrityasana\nspring.datasource.password=nrityasana-dev-password\nspring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver`,
                        'props'
                      )
                    }
                    className="absolute top-2 right-2 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'props' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-[#781D32]" />
                  Docker Compose for Local MySQL 8.4
                </h4>
                <div className="relative">
                  <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`services:
  mysql:
    image: mysql:8.4
    container_name: nrityasana-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root-secret-password
      MYSQL_DATABASE: nrityasana
      MYSQL_USER: nrityasana
      MYSQL_PASSWORD: nrityasana-dev-password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./src/main/resources/schema.sql:/docker-entrypoint-initdb.d/schema.sql:ro`}
                  </pre>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'docker compose -f backend/docker-compose.yml up -d',
                        'docker'
                      )
                    }
                    className="absolute top-2 right-2 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'docker' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy Command
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#F2E6E2] bg-[#FDF8F5] flex items-center justify-between text-xs text-[#7D6D73]">
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#781D32]" />
            MySQL 8.0+ / Connector-J & mysql2
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-[#F2E6E2] hover:bg-[#FAF3F0] text-xs font-semibold text-[#1F161A] transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
