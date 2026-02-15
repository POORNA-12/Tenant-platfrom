import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    CalendarOff,
    Wallet,
    KeyRound,
    Play,
    Sparkles,
    Filter,
    Download,
    Eye,
    User,
    CheckCircle2,
    ShieldAlert,
    XCircle,
    Loader2,
    Clock,
    Calendar,
    FileText,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as workflowService from '../services/workflowService';
import ApplyWorkflowModal from '../components/Workflows/ApplyWorkflowModal';

/* ── Fallback icons for templates (matched by keyword) ── */
const iconMap = {
    leave: { icon: CalendarOff, bg: 'bg-red-50 text-red-500' },
    expense: { icon: Wallet, bg: 'bg-emerald-50 text-emerald-500' },
    access: { icon: KeyRound, bg: 'bg-orange-50 text-orange-500' },
    default: { icon: Play, bg: 'bg-blue-50 text-blue-500' },
};

function getIconForTemplate(name) {
    const lower = (name || '').toLowerCase();
    for (const [key, val] of Object.entries(iconMap)) {
        if (key !== 'default' && lower.includes(key)) return val;
    }
    return iconMap.default;
}

/* ── Status badge colors ── */
const statusConfig = {
    'In Progress': { color: 'bg-amber-50 text-warning border border-amber-200', dot: 'bg-warning', icon: Clock },
    'submitted': { color: 'bg-blue-50 text-blue-600 border border-blue-200', dot: 'bg-blue-500', icon: Clock },
    'Completed': { color: 'bg-emerald-50 text-success border border-emerald-200', dot: 'bg-success', icon: CheckCircle2 },
    'approved': { color: 'bg-emerald-50 text-success border border-emerald-200', dot: 'bg-success', icon: CheckCircle2 },
    'Under Review': { color: 'bg-blue-50 text-blue-600 border border-blue-200', dot: 'bg-blue-500', icon: Clock },
    'pending': { color: 'bg-blue-50 text-blue-600 border border-blue-200', dot: 'bg-blue-500', icon: Clock },
    'Rejected': { color: 'bg-red-50 text-danger border border-red-200', dot: 'bg-danger', icon: XCircle },
    'rejected': { color: 'bg-red-50 text-danger border border-red-200', dot: 'bg-danger', icon: XCircle },
};

const defaultStatus = { color: 'bg-gray-50 text-gray-600 border border-gray-200', dot: 'bg-gray-400', icon: Clock };

export default function WorkflowDashboard() {
    const { tenantSlug } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Fetch Templates
    useEffect(() => {
        async function fetchTemplates() {
            if (!tenantSlug) return;
            try {
                setLoadingTemplates(true);
                const data = await workflowService.getTemplates(tenantSlug);
                const list = Array.isArray(data) ? data : data?.templates || [];
                setTemplates(list);
            } catch (err) {
                console.error("Failed to fetch templates:", err);
            } finally {
                setLoadingTemplates(false);
            }
        }
        fetchTemplates();
    }, [tenantSlug]);

    // Fetch Requests
    const fetchRequests = async () => {
        if (!tenantSlug) return;
        try {
            setLoadingRequests(true);
            const data = await workflowService.getMyWorkflows(tenantSlug);
            const list = Array.isArray(data) ? data : data?.workflows || [];
            setRequests(list);
        } catch (err) {
            console.error("Failed to fetch requests:", err);
        } finally {
            setLoadingRequests(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [tenantSlug]);

    const handleApplySuccess = () => {
        setSelectedTemplate(null);
        fetchRequests(); // Refresh list after submission
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-navy">Workflow Dashboard</h1>
                <p className="text-textsecondary text-sm mt-1">
                    Welcome back! Manage your automated processes and track live requests.
                </p>
            </div>

            {/* ── Available Workflow Templates ── */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Available Workflow Templates
                    </h2>
                    <Link
                        to="/dashboard/workflows/new"
                        className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-2"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Create Request
                    </Link>
                </div>

                {loadingTemplates ? (
                    <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-border">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : templates.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-border">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No templates available</h3>
                        <p className="text-gray-500">There are no workflow templates configured for this tenant.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map((tpl) => {
                            const { icon: Icon, bg } = getIconForTemplate(tpl.name);
                            return (
                                <div
                                    key={tpl.definition_id}
                                    className="bg-white rounded-xl border border-border p-5 flex flex-col justify-between hover:shadow-lg hover:shadow-black/5 transition-all duration-200 group"
                                >
                                    <div>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg} group-hover:scale-105 transition-transform`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            {tpl.workflow_type && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                                                    {tpl.workflow_type}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-base font-bold text-navy mb-1">{tpl.name}</h3>
                                        <p className="text-xs text-textsecondary leading-relaxed mb-5 line-clamp-2">
                                            {tpl.description || 'Start a new workflow request.'}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setSelectedTemplate(tpl)}
                                        className="w-full mt-4 py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-primary bg-primary/5 border border-primary/10 rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300"
                                    >
                                        Use Template
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ── My Recent Requests ── */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
                        <span className="w-5 h-5 bg-primary/15 rounded flex items-center justify-center text-primary text-[10px] font-black">
                            ≡
                        </span>
                        My Recent Requests
                    </h2>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-textsecondary border border-border rounded-lg hover:bg-bg transition-colors cursor-pointer">
                            <Filter className="w-3.5 h-3.5" /> Filter
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-border overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-[100px_1fr_140px_100px] sm:grid-cols-[120px_1fr_140px_180px_60px] gap-4 px-5 py-3 bg-bg/60 border-b border-border text-[11px] font-bold uppercase tracking-wider text-textmuted">
                        <span>Request ID</span>
                        <span>Title</span>
                        <span className="hidden sm:block">Current Status</span>
                        <span className="sm:hidden">Status</span>
                        <span className="hidden sm:block">Created At</span>
                        <span className="text-right hidden sm:block">Actions</span>
                    </div>

                    {loadingRequests ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-12 opacity-60">
                            <h3 className="text-sm font-medium text-gray-900">No requests found</h3>
                        </div>
                    ) : (
                        requests.map((req) => {
                            const safeStatus = req.status || 'pending';
                            const status = statusConfig[safeStatus] || defaultStatus;
                            const statusLabel = safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);

                            return (
                                <div
                                    key={req.request_id}
                                    className="grid grid-cols-[100px_1fr_140px_100px] sm:grid-cols-[120px_1fr_140px_180px_60px] gap-4 items-center px-5 py-4 border-b border-border/60 last:border-b-0 hover:bg-bg/40 transition-colors"
                                >
                                    <span className="text-sm font-bold text-primary">#{req.request_id}</span>
                                    <div>
                                        <Link
                                            to={`/dashboard/workflows/${req.request_id}`}
                                            className="text-sm font-semibold text-navy hover:text-primary transition-colors block truncate"
                                        >
                                            {req.title}
                                        </Link>
                                    </div>
                                    <div>
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                            {statusLabel}
                                        </span>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 text-sm text-textsecondary">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="hidden sm:flex justify-end">
                                        <Link
                                            to={`/dashboard/workflows/${req.request_id}`}
                                            className="p-1.5 rounded-lg hover:bg-bg text-textsecondary hover:text-primary transition-colors cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>

            {/* Modal */}
            {selectedTemplate && (
                <ApplyWorkflowModal
                    template={selectedTemplate}
                    onClose={() => setSelectedTemplate(null)}
                    onSuccess={handleApplySuccess}
                />
            )}
        </div>
    );
}
