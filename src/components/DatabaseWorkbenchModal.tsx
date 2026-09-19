import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Play,
  RefreshCw,
  Server,
  Layers,
  Code2,
  Terminal,
  Sliders,
} from 'lucide-react';
import { UserSession } from '../types';

interface DatabaseWorkbenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  onShowToast?: (title: string, message: string) => void;
}

interface TableStatus {
  name: string;
  rowCount: number;
}

interface DbStatusResponse {
  connected: boolean;
  status: 'connected' | 'connecting' | 'standby' | 'error';
  config: {
    host: string;
    port: number;
    database: string;
    user: string;
    jdbcUrl: string;
  };
  tables: TableStatus[];
  lastError?: string;
  lastChecked: string;
}

const TABLE_DESCRIPTIONS: Record<string, string> = {
  users: 'Authentication credentials, user roles (ADMIN, USER)',
  profiles: 'Guru and student profiles, bios, styles, avatar photos',
  live_classes: 'Scheduled live video sessions with Google Meet URLs',
  class_attendees: 'Class RSVP registrations and participant linkages',
  chat_messages: 'Mentor direct messages and community discussions',
  media_items: 'Practice reflection photos, audio recordings, video poses',
  practice_logs: 'Completed session logs with duration and dates',
  user_progress: 'Weekly rhythm streak, total minutes, completed days',
  practices: 'All 40 practices (Yoga, Kathak, Bollywood, Semi-Classical, Zumba, Meditation)',
  diet_plans: 'All 14 scheduled meals (Veg & Non-Veg from 06:30 AM to 09:30 PM)',
};

export const DatabaseWorkbenchModal: React.FC<DatabaseWorkbenchModalProps> = ({
  isOpen,
  onClose,
  session,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'workbench' | 'tables' | 'config' | 'console'>('workbench');
  const [dbStatus, setDbStatus] = useState<DbStatusResponse | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isCopiedSql, setIsCopiedSql] = useState(false);
  const [isCopiedJdbc, setIsCopiedJdbc] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState<string | null>(null);

  // Config Form
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('3306');
  const [user, setUser] = useState('root');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState('nrityasana');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // SQL Console
  const [customSql, setCustomSql] = useState('SELECT id, title, discipline, level, minutes FROM practices LIMIT 5;');
  const [isExecutingSql, setIsExecutingSql] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // SQL Script snippet for preview
  const [sqlSnippet, setSqlSnippet] = useState<string>('-- Loading complete schema.sql...');

  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
        if (data.config) {
          setHost(data.config.host || 'localhost');
          setPort(String(data.config.port || '3306'));
          setUser(data.config.user || 'root');
          setDatabase(data.config.database || 'nrityasana');
        }
      }
    } catch {
      // standby fallback
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      // Fetch full schema.sql text for preview and copy
      fetch('/api/db/schema.sql')
        .then((res) => (res.ok ? res.text() : ''))
        .then((text) => {
          if (text) setSqlSnippet(text);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setIsCopiedSql(true);
    if (onShowToast) {
      onShowToast('SQL Script Copied', 'All 10 table schemas and 60+ seed rows copied to clipboard!');
    }
    setTimeout(() => setIsCopiedSql(false), 2500);
  };

  const handleCopyJdbc = () => {
    const jdbc = dbStatus?.config?.jdbcUrl || 'jdbc:mysql://localhost:3306/nrityasana?createDatabaseIfNotExist=true&serverTimezone=UTC';
    navigator.clipboard.writeText(jdbc);
    setIsCopiedJdbc(true);
    setTimeout(() => setIsCopiedJdbc(false), 2500);
  };

  const handleDownloadSql = () => {
    const element = document.createElement('a');
    const file = new Blob([sqlSnippet], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'nrityasana_schema.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    if (onShowToast) {
      onShowToast('Downloading schema.sql', 'Open directly in MySQL Workbench via File > Open SQL Script');
    }
  };

  const handleRunMigrations = async () => {
    setIsMigrating(true);
    setMigrationMessage(null);
    try {
      const res = await fetch('/api/db/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': session.role,
        },
      });
      const data = await res.json();
      if (data.status) setDbStatus(data.status);
      setMigrationMessage(data.message || 'Migrations completed successfully');
      if (onShowToast) onShowToast('Database Migrated', data.message);
    } catch (err: any) {
      setMigrationMessage('Migration failed: ' + err.message);
    } finally {
      setIsMigrating(false);
      fetchStatus();
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setMigrationMessage(null);
    try {
      const res = await fetch('/api/db/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': session.role,
        },
      });
      const data = await res.json();
      if (data.status) setDbStatus(data.status);
      setMigrationMessage(data.message || 'Seeded all 10 tables successfully');
      if (onShowToast) onShowToast('Database Seeded', data.message);
    } catch (err: any) {
      setMigrationMessage('Seed failed: ' + err.message);
    } finally {
      setIsSeeding(false);
      fetchStatus();
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/db/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host,
          port: Number(port),
          user,
          password,
          database,
        }),
      });
      const data = await res.json();
      if (data.status) setDbStatus(data.status);
      if (onShowToast) {
        onShowToast(
          data.status?.connected ? 'MySQL Connected' : 'MySQL Saved',
          data.status?.connected
            ? 'Connected to database ' + database
            : 'Config updated. MySQL is in standby until server is reachable.'
        );
      }
    } catch {
      // error
    } finally {
      setIsSavingConfig(false);
      fetchStatus();
    }
  };

  const handleRunQuery = async () => {
    setIsExecutingSql(true);
    setQueryError(null);
    setQueryResult(null);
    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': session.role,
        },
        body: JSON.stringify({ sql: customSql }),
      });
      const data = await res.json();
      if (!res.ok) {
        setQueryError(data.error || 'Query execution failed');
      } else {
        setQueryResult(data);
      }
    } catch (err: any) {
      setQueryError(err.message || 'Network error');
    } finally {
      setIsExecutingSql(false);
    }
  };

  const isConnected = dbStatus?.connected === true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF3F0] w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-[#EADBD5] flex flex-col overflow-hidden text-[#1F161A]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-white border-b border-[#EADBD5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#781D32]/10 flex items-center justify-center text-[#781D32]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-bold text-[#1F161A]">MySQL 8.0 & Workbench Integration</h2>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isConnected
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                  {isConnected ? 'Connected' : 'Standby / Fallback'}
                </span>
              </div>
              <p className="text-xs text-[#7D6D73]">Database Target: <code className="font-mono text-[#781D32]">nrityasana</code> (Port 3306)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#FAF3F0] text-[#7D6D73] hover:text-[#1F161A] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* JDBC Banner */}
        <div className="bg-[#FAF3F0] px-6 py-2.5 border-b border-[#EADBD5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <Server className="w-3.5 h-3.5 text-[#781D32] shrink-0" />
            <span className="font-semibold text-[#7D6D73] shrink-0">JDBC URL:</span>
            <code className="font-mono text-[11px] text-[#1F161A] truncate bg-white px-2 py-0.5 rounded-md border border-[#EADBD5]">
              {dbStatus?.config?.jdbcUrl || 'jdbc:mysql://localhost:3306/nrityasana?createDatabaseIfNotExist=true&serverTimezone=UTC'}
            </code>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyJdbc}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#781D32] hover:underline cursor-pointer"
            >
              {isCopiedJdbc ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {isCopiedJdbc ? 'Copied' : 'Copy JDBC'}
            </button>
            <span className="text-[#EADBD5]">|</span>
            <button
              onClick={fetchStatus}
              disabled={isLoadingStatus}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#7D6D73] hover:text-[#1F161A] cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingStatus ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#EADBD5] bg-white px-6">
          <button
            onClick={() => setActiveTab('workbench')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'workbench'
                ? 'border-[#781D32] text-[#781D32]'
                : 'border-transparent text-[#7D6D73] hover:text-[#1F161A]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Workbench Setup Guide
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'tables'
                ? 'border-[#781D32] text-[#781D32]'
                : 'border-transparent text-[#7D6D73] hover:text-[#1F161A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            All 10 Tables & Seed Data
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'config'
                ? 'border-[#781D32] text-[#781D32]'
                : 'border-transparent text-[#7D6D73] hover:text-[#1F161A]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Connection Settings
          </button>
          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'console'
                ? 'border-[#781D32] text-[#781D32]'
                : 'border-transparent text-[#7D6D73] hover:text-[#1F161A]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            SQL Query Console
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: WORKBENCH SETUP (MATCHES SCREENSHOT) */}
          {activeTab === 'workbench' && (
            <div className="space-y-6">
              {/* Context Callout */}
              <div className="p-4 rounded-2xl bg-white border border-[#EADBD5] shadow-xs flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold text-[#1F161A] text-sm">Database <code className="text-[#781D32]">nrityasana</code> Created in MySQL Workbench</p>
                  <p className="text-[#7D6D73] mt-0.5">
                    As shown in your MySQL Workbench query tab (<code className="font-mono text-emerald-700">CREATE DATABASE nrityasana;</code>), the database catalog is ready. Follow these 3 quick steps to load all 10 tables and all 60+ rows of practices, diet plans, and classes:
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#781D32] text-white text-xs font-bold shadow-xs hover:bg-[#601728] transition cursor-pointer"
                >
                  {isCopiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {isCopiedSql ? 'Copied Entire SQL Script!' : 'Copy Full SQL Script (82 KB)'}
                </button>

                <button
                  onClick={handleDownloadSql}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#EADBD5] text-[#1F161A] text-xs font-bold shadow-2xs hover:bg-[#FAF3F0] transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#781D32]" />
                  Download schema.sql
                </button>

                <button
                  onClick={handleRunMigrations}
                  disabled={isMigrating}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#EADBD5] text-[#1F161A] text-xs font-bold shadow-2xs hover:bg-[#FAF3F0] transition cursor-pointer"
                >
                  <Play className={`w-4 h-4 text-emerald-600 ${isMigrating ? 'animate-spin' : ''}`} />
                  {isMigrating ? 'Running Migrations...' : 'Auto-Execute in App'}
                </button>
              </div>

              {migrationMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{migrationMessage}</span>
                </div>
              )}

              {/* 3 Steps in MySQL Workbench */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#EADBD5] space-y-2">
                  <div className="w-7 h-7 rounded-full bg-[#781D32] text-white text-xs font-bold flex items-center justify-center">
                    1
                  </div>
                  <h4 className="font-bold text-xs text-[#1F161A]">Open Script in Workbench</h4>
                  <p className="text-[11px] text-[#7D6D73] leading-relaxed">
                    In your MySQL Workbench window, click <strong>File &gt; Open SQL Script...</strong> and select <code className="text-[#781D32]">schema.sql</code>, or paste the copied SQL directly into the query tab.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EADBD5] space-y-2">
                  <div className="w-7 h-7 rounded-full bg-[#781D32] text-white text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h4 className="font-bold text-xs text-[#1F161A]">Execute (⚡ Lightning Bolt)</h4>
                  <p className="text-[11px] text-[#7D6D73] leading-relaxed">
                    Click the <strong>Lightning Bolt</strong> (Execute) icon in the Workbench toolbar (or press <strong>Ctrl+Shift+Enter</strong>).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EADBD5] space-y-2">
                  <div className="w-7 h-7 rounded-full bg-[#781D32] text-white text-xs font-bold flex items-center justify-center">
                    3
                  </div>
                  <h4 className="font-bold text-xs text-[#1F161A]">Refresh Schemas</h4>
                  <p className="text-[11px] text-[#7D6D73] leading-relaxed">
                    In the left <strong>SCHEMAS</strong> panel next to <code className="text-[#781D32]">nrityasana</code>, click the <strong>Refresh (🔄)</strong> icon. All 10 tables will expand with all rows populated!
                  </p>
                </div>
              </div>

              {/* SQL Script Preview Window */}
              <div className="rounded-2xl bg-[#1A1215] border border-[#2D2026] overflow-hidden text-white font-mono text-xs">
                <div className="flex items-center justify-between px-4 py-2 bg-[#2D2026] text-gray-300 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-[#EADBD5]" />
                    schema.sql (Complete MySQL 8.0 Script)
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="text-[#EADBD5] hover:text-white flex items-center gap-1 text-[10px] cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-[11px] text-gray-300 max-h-56 leading-relaxed select-all">
                  {sqlSnippet.slice(0, 3000)}
                  {sqlSnippet.length > 3000 ? '\n\n... [3,500+ more lines containing all 40 practices, 14 diet plans, and seed tables] ...' : ''}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: ALL 10 TABLES & SEED DATA */}
          {activeTab === 'tables' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#1F161A]">Complete Relational Schema (10 Tables)</h3>
                  <p className="text-xs text-[#7D6D73]">Live row counts in MySQL database <code className="text-[#781D32]">nrityasana</code></p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunMigrations}
                    disabled={isMigrating}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#EADBD5] text-xs font-bold text-[#1F161A] hover:bg-[#FAF3F0] transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isMigrating ? 'animate-spin' : ''}`} />
                    Run Migrations
                  </button>
                  <button
                    onClick={handleSeedDatabase}
                    disabled={isSeeding}
                    className="px-3 py-1.5 rounded-xl bg-[#781D32] text-white text-xs font-bold hover:bg-[#601728] transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                    Seed All Data
                  </button>
                </div>
              </div>

              {migrationMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{migrationMessage}</span>
                </div>
              )}

              {/* Tables Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(dbStatus?.tables || [
                  { name: 'users', rowCount: 4 },
                  { name: 'profiles', rowCount: 3 },
                  { name: 'live_classes', rowCount: 4 },
                  { name: 'class_attendees', rowCount: 2 },
                  { name: 'chat_messages', rowCount: 3 },
                  { name: 'media_items', rowCount: 2 },
                  { name: 'practice_logs', rowCount: 3 },
                  { name: 'user_progress', rowCount: 2 },
                  { name: 'practices', rowCount: 40 },
                  { name: 'diet_plans', rowCount: 14 },
                ]).map((t) => (
                  <div
                    key={t.name}
                    className="p-4 rounded-2xl bg-white border border-[#EADBD5] shadow-2xs hover:border-[#781D32]/30 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#781D32]" />
                        <code className="font-bold text-xs font-mono text-[#1F161A]">{t.name}</code>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FAF3F0] text-[#781D32] border border-[#EADBD5]">
                        {t.rowCount} rows
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7D6D73] mt-2 leading-relaxed">
                      {TABLE_DESCRIPTIONS[t.name] || 'Relational entity in nrityasana database'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CONNECTION SETTINGS */}
          {activeTab === 'config' && (
            <div className="max-w-xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#1F161A]">MySQL Connection Parameters</h3>
                <p className="text-xs text-[#7D6D73]">Connect the app directly to your local MySQL instance or remote server</p>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-4 bg-white p-5 rounded-2xl border border-[#EADBD5]">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-[#1F161A] mb-1">Host</label>
                    <input
                      type="text"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="localhost or 127.0.0.1"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF3F0] border border-[#EADBD5] text-xs font-mono focus:outline-none focus:border-[#781D32]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1F161A] mb-1">Port</label>
                    <input
                      type="text"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder="3306"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF3F0] border border-[#EADBD5] text-xs font-mono focus:outline-none focus:border-[#781D32]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1F161A] mb-1">User</label>
                    <input
                      type="text"
                      value={user}
                      onChange={(e) => setUser(e.target.value)}
                      placeholder="root"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF3F0] border border-[#EADBD5] text-xs font-mono focus:outline-none focus:border-[#781D32]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1F161A] mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="MySQL Password"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF3F0] border border-[#EADBD5] text-xs font-mono focus:outline-none focus:border-[#781D32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F161A] mb-1">Database Name</label>
                  <input
                    type="text"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    placeholder="nrityasana"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF3F0] border border-[#EADBD5] text-xs font-mono focus:outline-none focus:border-[#781D32]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-[#7D6D73]">
                    {dbStatus?.lastError ? (
                      <span className="text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {dbStatus.lastError.slice(0, 50)}...
                      </span>
                    ) : isConnected ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        Connected & Active
                      </span>
                    ) : (
                      'In standby mode'
                    )}
                  </span>
                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="px-5 py-2.5 rounded-xl bg-[#781D32] text-white text-xs font-bold shadow-xs hover:bg-[#601728] transition cursor-pointer"
                  >
                    {isSavingConfig ? 'Testing Connection...' : 'Save & Connect'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: SQL QUERY CONSOLE */}
          {activeTab === 'console' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#1F161A]">SQL Query Console</h3>
                <p className="text-xs text-[#7D6D73]">Run read-only inspection queries against the database</p>
              </div>

              <div className="space-y-2">
                <textarea
                  value={customSql}
                  onChange={(e) => setCustomSql(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[#1A1215] text-emerald-400 font-mono text-xs border border-[#2D2026] focus:outline-none focus:border-[#781D32]"
                  placeholder="SELECT * FROM practices LIMIT 5;"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCustomSql('SELECT id, title, discipline, level, minutes FROM practices LIMIT 6;')}
                      className="text-[10px] px-2 py-1 rounded bg-white border border-[#EADBD5] hover:bg-[#FAF3F0] text-[#7D6D73]"
                    >
                      Sample: practices
                    </button>
                    <button
                      onClick={() => setCustomSql('SELECT id, title, time_label, calories, protein_grams FROM diet_plans LIMIT 6;')}
                      className="text-[10px] px-2 py-1 rounded bg-white border border-[#EADBD5] hover:bg-[#FAF3F0] text-[#7D6D73]"
                    >
                      Sample: diet_plans
                    </button>
                    <button
                      onClick={() => setCustomSql('SHOW TABLES;')}
                      className="text-[10px] px-2 py-1 rounded bg-white border border-[#EADBD5] hover:bg-[#FAF3F0] text-[#7D6D73]"
                    >
                      Sample: SHOW TABLES
                    </button>
                  </div>
                  <button
                    onClick={handleRunQuery}
                    disabled={isExecutingSql}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#781D32] text-white text-xs font-bold hover:bg-[#601728] transition cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    {isExecutingSql ? 'Running...' : 'Execute Query'}
                  </button>
                </div>
              </div>

              {queryError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{queryError}</span>
                </div>
              )}

              {queryResult && (
                <div className="rounded-2xl bg-white border border-[#EADBD5] overflow-hidden">
                  <div className="px-4 py-2 bg-[#FAF3F0] border-b border-[#EADBD5] text-xs font-semibold text-[#7D6D73] flex justify-between">
                    <span>Result ({queryResult.rowCount || 0} rows)</span>
                  </div>
                  <div className="overflow-x-auto max-h-64">
                    {queryResult.rows && queryResult.rows.length > 0 ? (
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#FAF3F0] border-b border-[#EADBD5] text-[#1F161A]">
                          <tr>
                            {Object.keys(queryResult.rows[0]).map((key) => (
                              <th key={key} className="px-3 py-2 font-bold">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EADBD5]">
                          {queryResult.rows.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-[#FAF3F0]/50">
                              {Object.values(row).map((val: any, j: number) => (
                                <td key={j} className="px-3 py-2 text-[#7D6D73] whitespace-nowrap">
                                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="p-4 text-xs text-[#7D6D73]">No rows returned.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#EADBD5] flex items-center justify-between text-xs">
          <span className="text-[#7D6D73]">
            MySQL Workbench 8.0 Integration • Database: <strong className="text-[#1F161A]">nrityasana</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#FAF3F0] hover:bg-[#EADBD5] font-bold text-[#1F161A] transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
