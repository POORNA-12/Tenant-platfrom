import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Filter,
    ShieldAlert,
    Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPendingApprovals, approveWorkflowRequest, rejectWorkflowRequest } from '../services/workflowService';
import WorkflowActionModal from '../components/Workflows/WorkflowActionModal';

export default function PendingApprovals() {
    const { tenantSlug } = useAuth();
    const [loading, setLoading] = useState(true);
    const [approvals, setApprovals] = useState([]);
    const [totalPending, setTotalPending] = useState(0);

    // Modal State
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, requestId: null });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchData = async () => {
        if (!tenantSlug) return;
        try {
            setLoading(true);
            const data = await getPendingApprovals(tenantSlug);
            setApprovals(data.pending_requests || []);
            setTotalPending(data.total_pending || 0);
        } catch (err) {
            console.error("Failed to fetch pending approvals:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tenantSlug]);

    const handleActionClick = (type, requestId) => {
        setModalConfig({ isOpen: true, type, requestId });
    };

    const handleConfirmAction = async (requestId, reason) => {
        if (!tenantSlug || !requestId) return;

        try {
            setActionLoading(true);
            if (modalConfig.type === 'approve') {
                await approveWorkflowRequest(tenantSlug, requestId);
            } else {
                await rejectWorkflowRequest(tenantSlug, requestId, reason);
            }

            // Refresh logic - optimistic update or refetch
            setModalConfig({ isOpen: false, type: null, requestId: null });
            await fetchData(); // simple refetch for now

        } catch (error) {
            console.error(`Failed to ${modalConfig.type} request:`, error);
            alert(`Failed to ${modalConfig.type} request. Please try again.`);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-navy tracking-tight">Pending Approvals</h1>
                    <p className="text-textsecondary text-sm mt-1">
                        Manage requests awaiting your action based on your current roles.
                    </p>
                </div>
                <div className="bg-white px-5 py-2 rounded-xl border border-border shadow-sm flex items-center gap-2">
                    <span className="text-xs font-bold text-textsecondary uppercase tracking-wider">Total Pending</span>
                    <span className="text-xl font-black text-primary">{totalPending}</span>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">

                {/* Table Header */}
                <div className="grid grid-cols-[100px_1fr_180px_140px_120px_140px] gap-4 px-6 py-4 bg-bg/50 border-b border-border text-[11px] font-bold uppercase tracking-wider text-textmuted hidden lg:grid">
                    <span>Request ID</span>
                    <span>Title</span>
                    <span>Submitted By</span>
                    <span>Submitted At</span>
                    <span>Current Role</span>
                    <span className="text-right">Actions</span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                        <p className="text-sm font-medium text-textsecondary">Loading approvals...</p>
                    </div>
                ) : approvals.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-navy mb-1">All Caught Up!</h3>
                        <p className="text-textsecondary text-sm">You have no pending approvals at this time.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {approvals.map((req) => (
                            <div
                                key={req.request_id}
                                className="p-5 lg:px-6 lg:py-4 hover:bg-bg/30 transition-colors grid grid-cols-1 lg:grid-cols-[100px_1fr_180px_140px_120px_140px] gap-4 lg:items-center group"
                            >
                                {/* Mobile: Header Row */}
                                <div className="flex items-center justify-between lg:hidden mb-2">
                                    <span className="text-sm font-bold text-primary">#{req.request_id}</span>
                                    <span className="text-xs text-textsecondary">
                                        {new Date(req.submitted_at).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Desktop: ID */}
                                <span className="text-sm font-bold text-primary hidden lg:block">#{req.request_id}</span>

                                {/* Title */}
                                <div>
                                    <Link
                                        to={`/dashboard/workflows/${req.request_id}`}
                                        className="font-bold text-navy text-sm sm:text-base hover:text-primary transition-colors block"
                                    >
                                        {req.title}
                                    </Link>
                                    {/* Mobile: Extra Info */}
                                    <div className="lg:hidden mt-2 space-y-1 text-xs text-textsecondary">
                                        <p>By: {req.submitted_by}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded font-medium text-navy">{req.role}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Submitted By */}
                                <div className="hidden lg:flex items-center gap-2 text-sm text-textprimary">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                        {req.submitted_by.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="truncate max-w-[140px]" title={req.submitted_by}>
                                        {req.submitted_by}
                                    </span>
                                </div>

                                {/* Submitted At */}
                                <div className="hidden lg:block text-sm text-textsecondary">
                                    {new Date(req.submitted_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </div>

                                {/* Current Role Badge */}
                                <div className="hidden lg:block">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded bg-gray-100 text-navy text-[10px] font-bold uppercase tracking-wider border border-gray-200">
                                        {req.role}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 lg:justify-end mt-4 lg:mt-0 pt-4 lg:pt-0 border-t border-border lg:border-0">
                                    <button
                                        onClick={() => handleActionClick('approve', req.request_id)}
                                        className="flex-1 lg:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-emerald-200"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleActionClick('reject', req.request_id)}
                                        className="flex-1 lg:flex-none px-3 py-1.5 bg-white border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 text-xs font-bold rounded-lg transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Footer (Placeholder) */}
                {approvals.length > 0 && (
                    <div className="px-6 py-4 bg-bg/30 border-t border-border flex items-center justify-between">
                        <p className="text-xs text-textsecondary">
                            Showing <span className="font-bold text-navy">{approvals.length}</span> pending requests
                        </p>
                        <div className="flex gap-2">
                            <button disabled className="p-1.5 rounded-lg border border-border bg-white text-gray-300 cursor-not-allowed">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button disabled className="p-1.5 rounded-lg border border-border bg-white text-gray-300 cursor-not-allowed">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Modal */}
            <WorkflowActionModal
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                requestId={modalConfig.requestId}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={handleConfirmAction}
                isLoading={actionLoading}
            />
        </div>
    );
}
