import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MapPin, Calendar, AlertTriangle, CheckCircle2, 
  Clock, ArrowUpRight, Shield, Layers, ImageOff, ExternalLink
} from 'lucide-react';
import { reportService, getImageUrl } from '../services/api';

const ExploreReportsPage = ({ setActivePage, setSelectedTrackId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Selected report for modal view
  const [detailModalReport, setDetailModalReport] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedArea !== 'All') params.area = selectedArea;
      if (selectedSeverity !== 'All') params.severity = selectedSeverity;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const res = await reportService.getReports(params);
      if (res.data?.success) {
        setReports(res.data.reports || []);
      }
    } catch (err) {
      setError('Unable to load reports. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedArea, selectedSeverity, selectedStatus]);

  // Extract unique areas for the filter dropdown
  const uniqueAreas = ['All', ...Array.from(new Set(reports.map(r => r.area).filter(Boolean)))];

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-100 text-rose-800 border border-rose-200">Critical</span>;
      case 'High':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 border border-amber-200">High</span>;
      case 'Medium':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-100 text-cyan-800 border border-cyan-200">Medium</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">Low</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500 text-white flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Resolved</span>;
      case 'In Progress':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500 text-white flex items-center gap-1"><Clock className="w-3 h-3" /> In Progress</span>;
      case 'Under Review':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-sky-500 text-white flex items-center gap-1"><Filter className="w-3 h-3" /> Under Review</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-400 text-white flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-aqua-dark uppercase tracking-widest bg-aqua/10 px-3.5 py-1 rounded-full border border-aqua/20">
            Public Transparency Feed
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 mt-2">
            Explore Water Leak Reports
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Browse verified municipal leak incidents, repair statuses, and duplicate report clusters.
          </p>
        </div>

        <button
          onClick={() => setActivePage('report')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-aqua-dark to-aqua text-navy-950 font-bold text-sm shadow-md hover:scale-[1.02] transition-transform self-start md:self-auto"
        >
          + Report New Leak
        </button>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, street, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-aqua focus:ring-2 focus:ring-aqua/20 outline-none text-sm transition-all"
            />
          </div>

          {/* Area filter */}
          <div>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-aqua focus:ring-2 focus:ring-aqua/20 outline-none text-sm bg-white cursor-pointer"
            >
              <option value="All">All Localities</option>
              {uniqueAreas.filter(a => a !== 'All').map((area, i) => (
                <option key={i} value={area}>{area}</option>
              ))}
            </select>
          </div>

          {/* Severity filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-aqua focus:ring-2 focus:ring-aqua/20 outline-none text-sm bg-white cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-aqua focus:ring-2 focus:ring-aqua/20 outline-none text-sm bg-white cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

        </div>

        {/* Filter counter summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing <strong>{reports.length}</strong> incidents (Sorted newest first)</span>
          {(search || selectedArea !== 'All' || selectedSeverity !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedArea('All');
                setSelectedSeverity('All');
                setSelectedStatus('All');
              }}
              className="text-aqua-dark hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* REPORTS GRID */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-aqua border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading verified leak reports from MongoDB...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-navy-950">No Reports Found</h3>
          <p className="text-sm text-slate-500">
            No leak reports matched your active filter criteria. Try resetting filters or submit a new report.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedArea('All');
              setSelectedSeverity('All');
              setSelectedStatus('All');
            }}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const img = getImageUrl(report.image);
            const dateStr = new Date(report.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={report.reportId}
                onClick={() => setDetailModalReport(report)}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-luxury hover:border-aqua/40 transition-all duration-300 flex flex-col group cursor-pointer"
              >
                {/* Photo Thumbnail */}
                <div className="relative h-48 bg-slate-900 overflow-hidden">
                  {img ? (
                    <img
                      src={img}
                      alt={report.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-100">
                      <ImageOff className="w-8 h-8 text-slate-400 mb-1" />
                      <span className="text-xs">No Photo Attached</span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-navy-950/85 text-white backdrop-blur-md shadow-sm">
                      {report.reportId}
                    </span>
                    {report.isDemo && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800/80 text-amber-300 backdrop-blur-md">
                        Demo
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    {getStatusBadge(report.status)}
                  </div>

                  {/* Similar reports duplicate pill */}
                  {report.similarReportsCount > 0 && (
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-aqua text-[11px] font-semibold flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{report.similarReportsCount} similar reports</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-aqua-dark uppercase tracking-wide">
                        {report.category}
                      </span>
                      {getSeverityBadge(report.severity)}
                    </div>

                    <h3 className="font-bold text-navy-950 text-base leading-snug line-clamp-2 group-hover:text-aqua-dark transition-colors">
                      {report.title}
                    </h3>

                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  {/* Location & Date */}
                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-aqua shrink-0" />
                      <span className="truncate font-medium">{report.area}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted text-[11px]">
                      <span className="truncate">{report.street}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </span>
                    </div>
                  </div>

                  {/* View Details Prompt */}
                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-aqua-dark group-hover:underline">
                    <span>Inspect Incident Details</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-aqua-dark bg-aqua/10 px-3 py-1 rounded-lg">
                    {detailModalReport.reportId}
                  </span>
                  {getStatusBadge(detailModalReport.status)}
                  {getSeverityBadge(detailModalReport.severity)}
                </div>
                <h2 className="text-xl font-extrabold text-navy-950 mt-2">
                  {detailModalReport.title}
                </h2>
              </div>
              <button
                onClick={() => setDetailModalReport(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Photo preview in modal */}
            {detailModalReport.image && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-72">
                <img
                  src={getImageUrl(detailModalReport.image)}
                  alt="Incident Visual"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content Details */}
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs font-bold text-muted uppercase">Description</span>
                <p className="text-slate-700 mt-1 leading-relaxed">{detailModalReport.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-muted uppercase">Locality / Area</span>
                  <p className="text-navy-950 font-semibold">{detailModalReport.area}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted uppercase">Street / Crossing</span>
                  <p className="text-navy-950 font-semibold">{detailModalReport.street}</p>
                </div>
                {detailModalReport.landmark && (
                  <div className="sm:col-span-2">
                    <span className="text-xs font-bold text-muted uppercase">Nearby Landmark</span>
                    <p className="text-slate-700">{detailModalReport.landmark}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold text-muted uppercase">Category</span>
                  <p className="text-slate-700">{detailModalReport.category}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted uppercase">Reported Date</span>
                  <p className="text-slate-700">{new Date(detailModalReport.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {detailModalReport.similarReportsCount > 0 && (
                <div className="p-3.5 rounded-xl bg-aqua/10 border border-aqua/30 text-xs text-navy-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-aqua-dark shrink-0" />
                  <span>
                    <strong>Duplicate Leak Cluster:</strong> {detailModalReport.similarReportsCount} other citizens have reported leaks around this location.
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (setSelectedTrackId) setSelectedTrackId(detailModalReport.reportId);
                  setDetailModalReport(null);
                  setActivePage('track');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-aqua-dark to-aqua text-navy-950 font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>Track Full Timeline</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                onClick={() => setDetailModalReport(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ExploreReportsPage;

