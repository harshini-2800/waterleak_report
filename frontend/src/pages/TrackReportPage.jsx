import React, { useState, useEffect } from 'react';
import { 
  Search, CheckCircle2, Clock, MapPin, AlertCircle, Calendar, 
  ArrowRight, ShieldCheck, FileCheck, Activity, ImageOff
} from 'lucide-react';
import { reportService, getImageUrl } from '../services/api';

const TrackReportPage = ({ initialTrackId = '' }) => {
  const [reportIdInput, setReportIdInput] = useState(initialTrackId || '');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (idToSearch) => {
    const targetId = (idToSearch || reportIdInput).trim();
    if (!targetId) {
      setError('Please enter a valid Report ID (e.g. WL-1001)');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await reportService.getReportByTrackId(targetId);
      if (res.data?.success && res.data.report) {
        setReport(res.data.report);
      } else {
        setError(`No leak report found with ID: ${targetId}`);
        setReport(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Report not found. Please verify the ID.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackId) {
      setReportIdInput(initialTrackId);
      handleTrack(initialTrackId);
    }
  }, [initialTrackId]);

  const stages = [
    { key: 'Pending', label: 'Reported', desc: 'Received & Queued' },
    { key: 'Under Review', label: 'Under Review', desc: 'Field Triage & Verification' },
    { key: 'In Progress', label: 'In Progress', desc: 'Repair Crew On-Site' },
    { key: 'Resolved', label: 'Resolved', desc: 'Repaired & Verified' },
  ];

  const getStageIndex = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending': return 0;
      case 'Under Review': return 1;
      case 'In Progress': return 2;
      case 'Resolved': return 3;
      default: return 0;
    }
  };

  const currentStageIndex = report ? getStageIndex(report.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Search Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-aqua-dark uppercase tracking-widest bg-aqua/10 px-3.5 py-1 rounded-full border border-aqua/20">
          Live Status Tracker
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950">
          Track Repair Progress
        </h1>
        <p className="text-slate-600 max-w-lg mx-auto text-sm sm:text-base">
          Enter your unique Report ID to inspect live municipal work orders, crew dispatch logs, and completion status.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack();
          }}
          className="max-w-lg mx-auto pt-4 flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Report ID (e.g. WL-1001)"
              value={reportIdInput}
              onChange={(e) => setReportIdInput(e.target.value.toUpperCase())}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-300 focus:border-aqua focus:ring-2 focus:ring-aqua/20 outline-none font-mono text-sm uppercase transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-aqua-dark to-aqua text-navy-950 font-bold text-sm shadow-luxury hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-500 flex-wrap">
          <span>Quick Demo IDs:</span>
          {['WL-1001', 'WL-1003', 'WL-1004', 'WL-1005'].map((id) => (
            <button
              key={id}
              onClick={() => {
                setReportIdInput(id);
                handleTrack(id);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-medium transition-colors"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm max-w-lg mx-auto flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Report Found */}
      {report && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-luxury overflow-hidden p-6 sm:p-10 space-y-8 animate-in fade-in">
          
          {/* Card Top Information */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-extrabold text-navy-950 bg-slate-100 px-3 py-1 rounded-xl">
                  {report.reportId}
                </span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  report.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                  report.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                  report.status === 'Under Review' ? 'bg-sky-100 text-sky-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  Current Status: {report.status}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-navy-950 mt-2">
                {report.title}
              </h2>
            </div>

            {report.resolutionDurationHours && (
              <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-right self-start sm:self-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Total Resolution Time</span>
                <span className="text-xl font-extrabold text-emerald-800 font-mono">
                  {report.resolutionDurationHours} hrs
                </span>
              </div>
            )}
          </div>

          {/* FOUR STAGE VISUAL TIMELINE */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
              Resolution Pipeline Timeline
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
              {stages.map((st, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div 
                    key={st.key}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-aqua/10 border-aqua text-navy-950 shadow-sm ring-2 ring-aqua/30'
                        : isPassed
                        ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold font-mono">
                        Step 0{idx + 1}
                      </span>
                      {isPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-brand" />
                      ) : isCurrent ? (
                        <span className="w-3 h-3 rounded-full bg-aqua animate-ping" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-300" />
                      )}
                    </div>

                    <h4 className={`text-sm font-bold ${isCurrent ? 'text-navy-950' : ''}`}>
                      {st.label}
                    </h4>
                    <p className="text-[11px] text-muted mt-0.5">
                      {st.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LOCATION & METADATA GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Left: Location & Details */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Incident Location & Parameters
              </h4>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-aqua shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-navy-950 block">{report.area}</span>
                    <span className="text-slate-600 text-xs block">{report.street}</span>
                    {report.landmark && (
                      <span className="text-muted text-xs block mt-0.5">Near: {report.landmark}</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted block">Leak Category</span>
                    <span className="font-semibold text-slate-800">{report.category}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Severity</span>
                    <span className="font-semibold text-slate-800">{report.severity}</span>
                  </div>
                  <div>
                    <span className="text-muted block">First Logged</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block">Last Updated</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(report.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-muted text-xs block">Description</span>
                  <p className="text-slate-700 text-xs mt-1 leading-relaxed">
                    {report.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Photograph */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Attached Photograph
              </h4>

              {report.image ? (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-56 shadow-sm">
                  <img
                    src={getImageUrl(report.image)}
                    alt={report.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 h-56 flex flex-col items-center justify-center text-slate-400">
                  <ImageOff className="w-8 h-8 mb-1" />
                  <span className="text-xs">No photograph provided with report</span>
                </div>
              )}
            </div>

          </div>

          {/* AUDIT LOG TIMELINE HISTORY */}
          {report.statusHistory && report.statusHistory.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official Municipal Activity Log
              </h4>

              <div className="space-y-3">
                {report.statusHistory.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                    <div className="p-1.5 rounded-lg bg-aqua/10 text-aqua-dark shrink-0 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-950">{item.status}</span>
                        <span className="text-muted text-[11px]">
                          {new Date(item.changedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{item.note}</p>
                      <span className="text-[10px] text-slate-400">Logged by: {item.changedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default TrackReportPage;

