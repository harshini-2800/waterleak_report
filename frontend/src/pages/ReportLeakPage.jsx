import React, { useState } from 'react';
import { 
  Camera, UploadCloud, X, RefreshCw, CheckCircle2, AlertTriangle, 
  MapPin, ShieldAlert, ArrowRight, Copy, Check, FileText
} from 'lucide-react';
import { reportService } from '../services/api';

const ReportLeakPage = ({ setActivePage, setSelectedTrackId }) => {
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterEmail: '',
    title: '',
    description: '',
    area: '',
    street: '',
    landmark: '',
    category: 'Burst Pipe',
    severity: 'Medium',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Submission success state
  const [submittedReport, setSubmittedReport] = useState(null);
  const [copied, setCopied] = useState(false);

  const categories = [
    'Burst Pipe',
    'Leaking Tap / Hydrant',
    'Low Pressure Seepage',
    'Main Pipeline Fracture',
    'Overflowing Drain / Tank',
    'Pavement / Road Seepage',
    'Other'
  ];

  const severities = [
    { label: 'Low', desc: 'Slow drip, minor damp spot', color: 'border-emerald-200 text-emerald-700 bg-emerald-50' },
    { label: 'Medium', desc: 'Steady puddle, visible flow', color: 'border-aqua/40 text-aqua-dark bg-aqua/10' },
    { label: 'High', desc: 'Active spurting, sidewalk flooded', color: 'border-amber-300 text-amber-700 bg-amber-50' },
    { label: 'Critical', desc: 'Major main burst, road submerged', color: 'border-rose-300 text-rose-700 bg-rose-50' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFileError('');
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Please select a valid image file (.jpg, .jpeg, .png, .webp)');
      return;
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10MB limit. Please upload a smaller image.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFileError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!formData.title || !formData.description || !formData.area || !formData.street) {
      setSubmitError('Please complete all mandatory location and leak fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await reportService.createReport(data);
      if (res.data?.success && res.data.report) {
        setSubmittedReport(res.data.report);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError(res.data?.message || 'Failed to submit report. Please try again.');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Submission failed. Server error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedReport) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-luxury p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center text-emerald-brand mx-auto animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-brand bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Report Successfully Logged
            </span>
            <h2 className="text-3xl font-extrabold text-navy-950">
              Thank You for Saving Water!
            </h2>
            <p className="text-slate-600 max-w-md mx-auto text-sm">
              Your leak report has been committed permanently to the database and routed to municipal utility teams.
            </p>
          </div>

          {/* Ticket ID Box */}
          <div className="bg-surface-soft border border-slate-200 rounded-2xl p-6 max-w-md mx-auto space-y-3">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Your Unique Tracking ID
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-mono font-extrabold text-navy-950 tracking-wider">
                {submittedReport.reportId}
              </span>
              <button
                onClick={() => copyToClipboard(submittedReport.reportId)}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"
                title="Copy Report ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-brand" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && <span className="text-xs text-emerald-brand font-medium">Copied to clipboard!</span>}
            <p className="text-[11px] text-slate-500">
              Save this ID to track inspection status and repair progress in real time.
            </p>
          </div>

          {/* Duplicate signal pill */}
          {submittedReport.similarReportsCount > 0 && (
            <div className="p-4 rounded-xl bg-aqua/10 border border-aqua/30 text-navy-900 text-xs sm:text-sm flex items-center justify-center gap-2 max-w-md mx-auto">
              <AlertTriangle className="w-4 h-4 text-aqua-dark shrink-0" />
              <span>
                <strong>Smart Cluster:</strong> {submittedReport.similarReportsCount} similar reports detected in this locality.
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                if (setSelectedTrackId) setSelectedTrackId(submittedReport.reportId);
                setActivePage('track');
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-aqua-dark to-aqua text-navy-950 font-bold text-sm shadow-luxury flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <span>Track This Report Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setSubmittedReport(null);
                setFormData({
                  reporterName: '',
                  reporterEmail: '',
                  title: '',
                  description: '',
                  area: '',
                  street: '',
                  landmark: '',
                  category: 'Burst Pipe',
                  severity: 'Medium',
                });
                removeImage();
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-aqua-dark uppercase tracking-widest bg-aqua/10 px-3.5 py-1 rounded-full border border-aqua/20">
          Citizen Reporting Portal
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950">
          Report a Public Water Leak
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
          No sign-in required. Help prevent treated water wastage by providing accurate location and photo details.
        </p>
      </div>

      {submitError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-luxury p-6 sm:p-10 space-y-8">
        
        {/* SECTION 1: PHOTOGRAPH UPLOAD */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-navy-950">
            Leak Photograph <span className="text-muted font-normal text-xs">(Recommended: JPG, PNG, WEBP up to 10MB)</span>
          </label>

          {!imagePreview ? (
            <label className="border-2 border-dashed border-slate-300 hover:border-aqua rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-aqua/5 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-aqua transition-colors mb-3">
                <UploadCloud className="w-7 h-7" />
              </div>
              <span className="text-sm font-semibold text-navy-950 group-hover:text-aqua transition-colors">
                Click to upload photograph
              </span>
              <span className="text-xs text-slate-500 mt-1">
                Drag and drop or browse from your phone / computer
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md max-w-md mx-auto">
              <img
                src={imagePreview}
                alt="Selected Leak Preview"
                className="w-full h-56 object-cover"
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <label className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white cursor-pointer backdrop-blur-md transition-colors" title="Replace Photo">
                  <RefreshCw className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={removeImage}
                  className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
                  title="Remove Photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2.5 bg-navy-950/90 text-white text-xs flex items-center justify-between px-4">
                <span className="truncate max-w-[200px]">{imageFile?.name}</span>
                <span className="text-emerald-400 font-medium">Ready to upload</span>
              </div>
            </div>
          )}

          {fileError && (
            <p className="text-xs text-rose-600 font-medium">{fileError}</p>
          )}
        </div>

        {/* SECTION 2: LEAK DETAILS */}
        <div className="space-y-6 pt-4 border-t border-slate-100">
          <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
            <FileText className="w-4 h-4 text-aqua" />
            <span>Incident Description</span>
          </h3>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Report Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Burst underground pipe flooding crosswalk"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-aqua focus:ring-2 focus:ring-aqua/20 outline-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Full Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe the leak intensity, duration, water clarity, and any road hazard..."
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-aqua focus:ring-2 focus:ring-aqua/20 outline-none text-sm transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Leak Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-aqua focus:ring-2 focus:ring-aqua/20 outline-none text-sm bg-white cursor-pointer transition-all"
                >
                  {categories.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Estimated Severity Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Low', 'Medium', 'High', 'Critical'].map((sev) => {
                    const isSelected = formData.severity === sev;
                    return (
                      <button
                        type="button"
                        key={sev}
                        onClick={() => setFormData(prev => ({ ...prev, severity: sev }))}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-navy-950 text-white border-navy-950 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sev}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: LOCATION DETAILS */}
        <div className="space-y-6 pt-4 border-t border-slate-100">
          <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-aqua" />
            <span>Location Information (No Paid Maps Needed)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Area / Locality <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                placeholder="e.g., Downtown Metro Corridor"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-aqua focus:ring-2 focus:ring-aqua/20 outline-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Street Name / Crossing <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="e.g., Grand Avenue & 4th Street"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-aqua focus:ring-2 focus:ring-aqua/20 outline-none text-sm transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Nearby Landmark / Position Details
              </label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                placeholder="e.g., Opposite North Gate of Train Station, near Pillar #32"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-aqua focus:ring-2 focus:ring-aqua/20 outline-none text-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: REPORTER CONTACT (OPTIONAL) */}
        <div className="space-y-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-navy-950">
              Reporter Details
            </h3>
            <span className="text-[11px] text-muted">Kept private from public feed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Your Name
              </label>
              <input
                type="text"
                name="reporterName"
                value={formData.reporterName}
                onChange={handleInputChange}
                placeholder="e.g., Alex Morgan"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-aqua focus:ring-2 focus:ring-aqua/20 outline-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="reporterEmail"
                value={formData.reporterEmail}
                onChange={handleInputChange}
                placeholder="e.g., alex@community.org"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-aqua focus:ring-2 focus:ring-aqua/20 outline-none text-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-aqua-dark via-aqua to-aqua-light text-navy-950 font-extrabold text-base shadow-luxury hover:shadow-luxury-hover hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Uploading & Generating Report ID...</span>
              </>
            ) : (
              <>
                <span>Submit Water Leak Report</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-center text-xs text-muted mt-3">
            Reports are immediately entered into the municipal audit trail.
          </p>
        </div>

      </form>
    </div>
  );
};

export default ReportLeakPage;

