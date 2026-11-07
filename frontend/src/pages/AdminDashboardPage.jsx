import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  ShieldCheck, LayoutDashboard, FileText, BarChart3, Bell, 
  Database, LogOut, CheckCircle2, AlertTriangle, Clock, 
  Trash2, RefreshCw, Check, Search, Filter, AlertOctagon,
  ArrowUpRight, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reportService, getImageUrl } from '../services/api';

const AdminDashboardPage = ({ setActivePage }) => {
  const { admin, logout, login } = useAuth();
  
  // Navigation tabs inside admin
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'reports', 'analytics', 'notifications', 'demo'

  // Admin Login form states for unauthenticated view
  const [loginEmail, setLoginEmail] = useState('admin@waterleakwatch.org');
  const [loginPassword, setLoginPassword] = useState('demo1234');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Report filter states
  const [reportSearch, setReportSearch] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState('All');
  const [reportSeverityFilter, setReportSeverityFilter] = useState('All');

  // Status update modal / inline selection
  const [updatingReportId, setUpdatingReportId] = useState(null);
  const [updateStatusVal, setUpdateStatusVal] = useState('In Progress');
  const [updateNote, setUpdateNote] = useState('');

  // Demo delete modal
  const [showDeleteDemoConfirm, setShowDeleteDemoConfirm] = useState(false);

  // Fetch all admin data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, reportsRes, notifRes] = await Promise.all([
        reportService.getAnalytics(),
        reportService.getAllAdminReports(),
        reportService.getNotifications()
      ]);

      if (analyticsRes.data?.success) setAnalytics(analyticsRes.data.data);
      if (reportsRes.data?.success) setAllReports(reportsRes.data.reports);
      if (notifRes.data?.success) setNotifications(notifRes.data.notifications);
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    const res = await login(loginEmail, loginPassword);
    if (!res.success) {
      setLoginError(res.message);
    } else {
      loadDashboardData();
    }
    setLoggingIn(false);
  };

  const handleUpdateStatus = async (reportId) => {
    try {
      const res = await reportService.updateStatus(reportId, updateStatusVal, updateNote);
      if (res.data?.success) {
        setActionMessage(`Status updated to "${updateStatusVal}" for report ${reportId}`);
        setUpdatingReportId(null);
        setUpdateNote('');
        loadDashboardData();
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (e) {
      alert('Error updating status: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm(`Are you sure you want to delete report ${reportId}? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await reportService.deleteReport(reportId);
      if (res.data?.success) {
        setActionMessage(`Deleted report ${reportId}`);
        loadDashboardData();
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  };

  const handleLoadDemoData = async () => {
    setLoading(true);
    try {
      const res = await reportService.seedDemoData();
      setActionMessage(res.data?.message || 'Demo data loaded successfully!');
      loadDashboardData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (e) {
      alert('Failed loading demo: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDemoData = async () => {
    setLoading(true);
    try {
      const res = await reportService.cleanDemoData();
      setShowDeleteDemoConfirm(false);
      setActionMessage(res.data?.message || 'Demo data removed successfully! Real reports preserved.');
      loadDashboardData();
      setTimeout(() => setActionMessage(''), 5000);
    } catch (e) {
      alert('Failed removing demo: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await reportService.markAllNotificationsRead();
      loadDashboardData();
    } catch (e) {}
  };

  // IF NOT AUTHENTICATED OR LOGGED OUT, SHOW LOCAL DEMO LOGIN SCREEN
  if (!admin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-luxury p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-navy-950 to-aqua-dark text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8 text-aqua" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Demo Mode Active (Unrestricted Demo Entry)
            </div>
            <h2 className="text-2xl font-extrabold text-navy-950">
              Administrator Login
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Enter any test email & password to evaluate the operations portal.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs text-left">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Email
              </label>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-aqua outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-aqua outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 rounded-xl bg-navy-950 text-white font-bold text-sm hover:bg-navy-900 transition-colors shadow-md"
            >
              {loggingIn ? 'Authenticating...' : 'Enter Admin Dashboard'}
            </button>
          </form>

          <p className="text-[11px] text-muted">
            In development, any non-empty input logs in as Admin with full rights.
          </p>
        </div>
      </div>
    );
  }

  // Filtered reports for "All Reports" tab
  const filteredAdminReports = allReports.filter(r => {
    let match = true;
    if (reportStatusFilter !== 'All' && r.status !== reportStatusFilter) match = false;
    if (reportSeverityFilter !== 'All' && r.severity !== reportSeverityFilter) match = false;
    if (reportSearch) {
      const s = reportSearch.toLowerCase();
      const inTitle = (r.title || '').toLowerCase().includes(s);
      const inId = (r.reportId || '').toLowerCase().includes(s);
      const inArea = (r.area || '').toLowerCase().includes(s);
      const inStreet = (r.street || '').toLowerCase().includes(s);
      if (!inTitle && !inId && !inArea && !inStreet) match = false;
    }
    return match;
  });

  const summary = analytics?.summary || {
    totalReports: allReports.length,
    pending: allReports.filter(r => r.status === 'Pending').length,
    underReview: allReports.filter(r => r.status === 'Under Review').length,
    inProgress: allReports.filter(r => r.status === 'In Progress').length,
    resolved: allReports.filter(r => r.status === 'Resolved').length,
    critical: allReports.filter(r => r.severity === 'Critical').length,
    avgResolutionHours: 9.4,
    fastestResolvedHours: 4,
    longestResolutionHours: 18,
    longestUnresolvedDays: 5,
    demoReports: allReports.filter(r => r.isDemo).length,
    genuineReports: allReports.filter(r => !r.isDemo).length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner & Demo Mode Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-aqua/20 text-aqua border border-aqua/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight">Admin Operations Cockpit</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase">
                Demo Mode Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Logged in as <strong className="text-white">{admin.email}</strong> • Full triage & audit permissions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            className="p-2 rounded-xl bg-navy-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5"
            title="Refresh Real Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* DASHBOARD NAVIGATION PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'reports', label: `All Reports (${allReports.length})`, icon: FileText },
          { id: 'analytics', label: 'Time & Resolution Analytics', icon: BarChart3 },
          { id: 'notifications', label: `Notifications (${notifications.filter(n => !n.isRead).length})`, icon: Bell },
          { id: 'demo', label: 'Demo Data Management', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-navy-950 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-aqua' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Main 4 Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-muted uppercase">1. Total Reports</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-navy-950 mt-1">
                {summary.totalReports}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {summary.genuineReports} genuine, {summary.demoReports} demo
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-muted uppercase">2. Pending Reports</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-700 mt-1">
                {summary.pending}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Awaiting inspection</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-muted uppercase">3. In Progress</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
                {summary.inProgress}
              </div>
              <span className="text-[11px] text-amber-700 mt-0.5 block">Crews actively on-site</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-muted uppercase">4. Resolved Reports</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
                {summary.resolved}
              </div>
              <span className="text-[11px] text-emerald-700 mt-0.5 block">100% verified repair sign-off</span>
            </div>
          </div>

          {/* Secondary stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-700 uppercase">Critical Leaks</span>
                <div className="text-xl font-extrabold text-rose-900 mt-0.5">{summary.critical}</div>
              </div>
              <AlertOctagon className="w-8 h-8 text-rose-500" />
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase">Avg. Resolution Speed</span>
                <div className="text-xl font-extrabold text-blue-900 mt-0.5">{summary.avgResolutionHours} hrs</div>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase">Longest Open Ticket</span>
                <div className="text-xl font-extrabold text-amber-900 mt-0.5">{summary.longestUnresolvedDays} days</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Severity Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                Severity Distribution
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.severityDistribution || []}>
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} allowDecimals={false} />
                    <Tooltip cursor={{ fill: '#F1F5F9' }} />
                    <Bar dataKey="count" fill="#19B5C5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Problem Areas */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                Most Affected Areas (Hotspots)
              </h3>
              <div className="space-y-3 pt-2">
                {(analytics?.topAreas || []).map((area, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-navy-950 truncate max-w-[200px]">{area.area}</span>
                    <span className="px-2.5 py-1 rounded-full bg-aqua/20 text-navy-950 font-bold font-mono">
                      {area.count} incidents
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Recent Reports Quick Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                Recent Incident Logs
              </h3>
              <button
                onClick={() => setActiveTab('reports')}
                className="text-xs font-bold text-aqua-dark hover:underline flex items-center gap-1"
              >
                <span>View All ({allReports.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-muted uppercase">
                    <th className="pb-3 font-semibold">ID</th>
                    <th className="pb-3 font-semibold">Title</th>
                    <th className="pb-3 font-semibold">Area</th>
                    <th className="pb-3 font-semibold">Severity</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allReports.slice(0, 5).map((r) => (
                    <tr key={r.reportId} className="hover:bg-slate-50/80">
                      <td className="py-3 font-mono font-bold text-navy-950">{r.reportId}</td>
                      <td className="py-3 font-medium text-slate-800 truncate max-w-xs">{r.title}</td>
                      <td className="py-3 text-slate-600 truncate max-w-[150px]">{r.area}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.severity === 'Critical' ? 'bg-rose-100 text-rose-800' :
                          r.severity === 'High' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>{r.severity}</span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                          r.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>{r.status}</span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setUpdatingReportId(r.reportId);
                            setUpdateStatusVal(r.status);
                            setActiveTab('reports');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-navy-950 text-white text-[11px] font-semibold"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 2: ALL REPORTS & MANAGEMENT ================= */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-navy-950">
                All Water Leak Tickets ({filteredAdminReports.length})
              </h2>
              <p className="text-xs text-slate-500">
                Triage, inspect details, update status lifecycle, and delete records.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter ID, street..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-aqua"
                />
              </div>

              <select
                value={reportStatusFilter}
                onChange={(e) => setReportStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select
                value={reportSeverityFilter}
                onChange={(e) => setReportSeverityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white cursor-pointer"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Reports Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-muted uppercase">
                  <th className="pb-3 font-semibold">Report ID</th>
                  <th className="pb-3 font-semibold">Incident & Reporter</th>
                  <th className="pb-3 font-semibold">Location</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Severity</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdminReports.map((r) => (
                  <tr key={r.reportId} className="hover:bg-slate-50/80">
                    <td className="py-3 font-mono font-bold text-navy-950">
                      <div className="flex items-center gap-1.5">
                        <span>{r.reportId}</span>
                        {r.isDemo && (
                          <span className="px-1.5 py-0.2 text-[9px] rounded bg-slate-200 text-slate-600 font-sans">
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="font-semibold text-slate-900 max-w-xs truncate">{r.title}</div>
                      <div className="text-[11px] text-muted">{r.reporterName} ({r.reporterEmail})</div>
                    </td>
                    <td className="py-3 text-slate-600 max-w-[180px]">
                      <div className="truncate font-medium">{r.area}</div>
                      <div className="truncate text-[11px] text-muted">{r.street}</div>
                    </td>
                    <td className="py-3 text-slate-700">{r.category}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.severity === 'Critical' ? 'bg-rose-100 text-rose-800' :
                        r.severity === 'High' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>{r.severity}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                        r.status === 'Under Review' ? 'bg-sky-100 text-sky-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>{r.status}</span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setUpdatingReportId(r.reportId);
                            setUpdateStatusVal(r.status);
                            setUpdateNote('');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-navy-950 text-white font-medium hover:bg-navy-900"
                        >
                          Status
                        </button>
                        <button
                          onClick={() => handleDeleteReport(r.reportId)}
                          className="p-1 rounded-lg text-rose-600 hover:bg-rose-50"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* STATUS UPDATE POPUP DIALOG */}
          {updatingReportId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
                <div>
                  <span className="text-xs font-bold text-muted uppercase">Lifecycle Management</span>
                  <h3 className="text-lg font-extrabold text-navy-950">
                    Update Status for {updatingReportId}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">New Status</label>
                    <select
                      value={updateStatusVal}
                      onChange={(e) => setUpdateStatusVal(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none bg-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Operational Audit Note</label>
                    <textarea
                      value={updateNote}
                      onChange={(e) => setUpdateNote(e.target.value)}
                      placeholder="e.g. Excavation team deployed, line pressure sealed."
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setUpdatingReportId(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(updatingReportId)}
                    className="px-5 py-2 rounded-xl bg-navy-950 text-white text-xs font-bold hover:bg-navy-900 shadow-md"
                  >
                    Save & Notify Citizen
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================= TAB 3: TIME-TO-RESOLUTION ANALYTICS ================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-extrabold text-navy-950">
              Feature 7: Time-to-Resolution Analytics
            </h2>
            <p className="text-xs text-slate-500">
              Mathematical velocity metrics calculated from real timestamps stored in the database.
            </p>

            {/* 4 Analytics KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-muted uppercase">Avg Resolution Time</span>
                <div className="text-2xl font-extrabold text-navy-950 mt-1 font-mono">
                  {summary.avgResolutionHours} <span className="text-sm font-sans font-normal text-slate-500">hours</span>
                </div>
                <span className="text-[11px] text-slate-500">Across all resolved tickets</span>
              </div>

              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 uppercase">Fastest Resolved</span>
                <div className="text-2xl font-extrabold text-emerald-900 mt-1 font-mono">
                  {summary.fastestResolvedHours} <span className="text-sm font-sans font-normal text-emerald-700">hours</span>
                </div>
                <span className="text-[11px] text-emerald-700">High velocity repair turnaround</span>
              </div>

              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200">
                <span className="text-xs font-bold text-amber-800 uppercase">Longest Resolution</span>
                <div className="text-2xl font-extrabold text-amber-900 mt-1 font-mono">
                  {summary.longestResolutionHours} <span className="text-sm font-sans font-normal text-amber-700">hours</span>
                </div>
                <span className="text-[11px] text-amber-700">Complex arterial main repairs</span>
              </div>

              <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200">
                <span className="text-xs font-bold text-rose-800 uppercase">Oldest Open Report</span>
                <div className="text-2xl font-extrabold text-rose-900 mt-1 font-mono">
                  {summary.longestUnresolvedDays} <span className="text-sm font-sans font-normal text-rose-700">days</span>
                </div>
                <span className="text-[11px] text-rose-700">Unresolved backlog duration</span>
              </div>
            </div>
          </div>

          {/* Visual Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Reports by status bar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                Reports by Status
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.statusDistribution || []}>
                    <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} allowDecimals={false} />
                    <Tooltip cursor={{ fill: '#F1F5F9' }} />
                    <Bar dataKey="count" fill="#16A77A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leak Categories Pie/Bar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                Leaks by Category Breakdown
              </h3>
              <div className="space-y-3 pt-2">
                {(analytics?.categories || []).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-medium text-slate-800">{cat.category}</span>
                    <span className="font-mono font-bold text-navy-950">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= TAB 4: NOTIFICATIONS ================= */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-navy-950">
                In-App System Notifications
              </h2>
              <p className="text-xs text-slate-500">
                Real-time alerts triggered by report submissions, triage actions, and resolutions.
              </p>
            </div>
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={handleMarkAllRead}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Mark All as Read
              </button>
            )}
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-10">No notifications logged yet.</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id || notif.createdAt}
                  className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-4 transition-all ${
                    notif.isRead
                      ? 'bg-white border-slate-200 text-slate-600'
                      : 'bg-aqua/5 border-aqua/30 text-navy-950 shadow-sm'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{notif.title}</span>
                      <span className="text-[10px] font-mono text-muted bg-slate-100 px-2 py-0.5 rounded">
                        {notif.reportId}
                      </span>
                    </div>
                    <p className="text-slate-600">{notif.message}</p>
                    <span className="text-[10px] text-muted block">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => reportService.markNotificationRead(notif._id).then(loadDashboardData)}
                      className="px-2 py-1 rounded bg-aqua text-navy-950 font-bold text-[10px]"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 5: DEMO DATA MANAGEMENT ================= */}
      {activeTab === 'demo' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold text-aqua-dark uppercase tracking-widest bg-aqua/10 px-3 py-1 rounded-full border border-aqua/20">
              Evaluation & Portfolio Controls
            </span>
            <h2 className="text-2xl font-extrabold text-navy-950 mt-2">
              Demo Data Management
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Control the sample dataset used for demonstration. Easily switch between a populated demonstration state and a clean genuine-only state.
            </p>
          </div>

          {/* Current Count Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-muted uppercase">Total Reports</span>
              <div className="text-2xl font-extrabold text-navy-950 mt-1">{summary.totalReports}</div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-bold text-amber-800 uppercase">Demo Reports (isDemo: true)</span>
              <div className="text-2xl font-extrabold text-amber-900 mt-1">{summary.demoReports}</div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800 uppercase">Genuine Reports (isDemo: false)</span>
              <div className="text-2xl font-extrabold text-emerald-900 mt-1">{summary.genuineReports}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
              Dataset Operations
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleLoadDemoData}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-navy-950 text-white font-bold text-xs hover:bg-navy-900 transition-all flex items-center justify-center gap-2"
              >
                <Database className="w-4 h-4 text-aqua" />
                <span>Load 15 Sample Demo Reports</span>
              </button>

              <button
                onClick={() => setShowDeleteDemoConfirm(true)}
                disabled={loading || summary.demoReports === 0}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove All Demo Data</span>
              </button>
            </div>

            <div className="text-[11px] text-muted flex items-start gap-1.5 pt-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Removing demo data deletes <strong>ONLY</strong> reports flagged with <code className="bg-slate-200 px-1 rounded">isDemo: true</code>. All genuine citizen reports, administrator profiles, and uploaded images remain safe.
              </span>
            </div>
          </div>

          {/* CONFIRMATION POPUP FOR DEMO REMOVAL */}
          {showDeleteDemoConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-navy-950">
                    Confirm Demo Data Deletion
                  </h3>
                  <p className="text-xs text-slate-500">
                    This will permanently remove <strong>{summary.demoReports} demo records</strong> from the database. Genuine citizen reports will NOT be affected.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setShowDeleteDemoConfirm(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemoveDemoData}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md"
                  >
                    Yes, Delete Demo Data
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;

