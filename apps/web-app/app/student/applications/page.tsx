'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useApplications } from '@/lib/hooks';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { RouteGuard } from '@/components/RouteGuard';
import { applicationsApi } from '@/lib/api';

export default function TrackApplicationsPage() {
  return (
    <RouteGuard allowedRoles={['STUDENT']}>
      <TrackApplicationsContent />
    </RouteGuard>
  );
}

function TrackApplicationsContent() {
  const { user } = useAuth();
  const { data: applications, loading, refetch } = useApplications();
  const [filter, setFilter] = useState<string>('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const handleWithdrawClick = (app: any) => {
    setSelectedApp(app);
    setShowWithdrawModal(true);
    setWithdrawError(null);
  };

  const handleWithdraw = async () => {
    if (!selectedApp) return;
    
    try {
      setWithdrawing(true);
      setWithdrawError(null);
      await applicationsApi.withdraw(selectedApp.id);
      setShowWithdrawModal(false);
      setSelectedApp(null);
      await refetch(); // Refresh the list
    } catch (err: any) {
      setWithdrawError(err.response?.data?.message || 'Failed to withdraw application');
    } finally {
      setWithdrawing(false);
    }
  };

  const filteredApplications = applications?.filter((app: any) => {
    if (filter === 'all') return true;
    return app.status === filter;
  }) || [];

  const statusCounts = {
    total: applications?.length || 0,
    pending: applications?.filter((a: any) => a.status === 'PENDING').length || 0,
    underReview: applications?.filter((a: any) => a.status === 'UNDER_REVIEW').length || 0,
    shortlisted: applications?.filter((a: any) => a.status === 'SHORTLISTED').length || 0,
    accepted: applications?.filter((a: any) => a.status === 'ACCEPTED').length || 0,
    rejected: applications?.filter((a: any) => a.status === 'REJECTED').length || 0,
    withdrawn: applications?.filter((a: any) => a.status === 'WITHDRAWN').length || 0,
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800',
    SHORTLISTED: 'bg-purple-100 text-purple-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800',
  };

  const statusBorders: Record<string, string> = {
    PENDING: 'border-l-yellow-400',
    UNDER_REVIEW: 'border-l-blue-500',
    SHORTLISTED: 'border-l-purple-500',
    ACCEPTED: 'border-l-green-500',
    REJECTED: 'border-l-red-500',
    WITHDRAWN: 'border-l-gray-400',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-slate-50">
      {/* Header */}
      <header className="relative bg-white/90 backdrop-blur py-5 border-b border-[var(--border)]">
        <div className="container-custom py-5 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--primary)]">Track Applications</h1>
              <p className="text-sm text-[var(--text-secondary)]">Monitor your application status and next steps</p>
              <p className="text-xs text-gray-500 mt-1">
                {statusCounts.total} total • {statusCounts.accepted} accepted • {statusCounts.underReview} in review
              </p>
            </div>
            <Link href="/student/dashboard">
              <Button variant="outline" size="sm">← Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container-custom py-20 md:py-10 !mt-10">
        {/* Stats */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-7 gap-4 mb-8">
          <Card className={`cursor-pointer transition border border-gray-100 bg-white/90 shadow-sm ${filter === 'all' ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:shadow-md'}`}>
            <div className="p-4 flex items-center justify-between" onClick={() => setFilter('all')}>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.total}</p>
              </div>
              <div className="text-2xl">📦</div>
            </div>
          </Card>
          <Card className={`cursor-pointer transition border border-gray-100 bg-white/90 shadow-sm ${filter === 'PENDING' ? 'ring-2 ring-yellow-500 ring-offset-2' : 'hover:shadow-md'}`}>
            <div className="p-4 flex items-center justify-between" onClick={() => setFilter('PENDING')}>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <div className="text-2xl">⏳</div>
            </div>
          </Card>
          <Card className={`cursor-pointer transition border border-gray-100 bg-white/90 shadow-sm ${filter === 'UNDER_REVIEW' ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:shadow-md'}`}>
            <div className="p-4 flex items-center justify-between" onClick={() => setFilter('UNDER_REVIEW')}>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.underReview}</p>
              </div>
              <div className="text-2xl">🔎</div>
            </div>
          </Card>
          <Card className={`cursor-pointer transition border border-gray-100 bg-white/90 shadow-sm ${filter === 'SHORTLISTED' ? 'ring-2 ring-purple-500 ring-offset-2' : 'hover:shadow-md'}`}>
            <div className="p-4 flex items-center justify-between" onClick={() => setFilter('SHORTLISTED')}>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Shortlisted</p>
                <p className="text-2xl font-bold text-purple-600">{statusCounts.shortlisted}</p>
              </div>
              <div className="text-2xl">✨</div>
            </div>
          </Card>
          <Card className={`cursor-pointer transition border border-gray-100 bg-white/90 shadow-sm ${filter === 'ACCEPTED' ? 'ring-2 ring-green-500 ring-offset-2' : 'hover:shadow-md'}`}>
            <div className="p-4 flex items-center justify-between" onClick={() => setFilter('ACCEPTED')}>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.accepted}</p>
              </div>
              <div className="text-2xl">✅</div>
            </div>
          </Card>
          <Card className={`cursor-pointer transition border border-gray-100 bg-white/90 shadow-sm ${filter === 'REJECTED' ? 'ring-2 ring-red-500 ring-offset-2' : 'hover:shadow-md'}`}>
            <div className="p-4 flex items-center justify-between" onClick={() => setFilter('REJECTED')}>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
              </div>
              <div className="text-2xl">❌</div>
            </div>
          </Card>
          <Card className={`cursor-pointer transition border border-gray-100 bg-white/90 shadow-sm ${filter === 'WITHDRAWN' ? 'ring-2 ring-gray-500 ring-offset-2' : 'hover:shadow-md'}`}>
            <div className="p-4 flex items-center justify-between" onClick={() => setFilter('WITHDRAWN')}>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Withdrawn</p>
                <p className="text-2xl font-bold text-gray-600">{statusCounts.withdrawn}</p>
              </div>
              <div className="text-2xl">↩️</div>
            </div>
          </Card>
        </div>

        {/* Applications List */}
        <Card className="relative z-0 bg-white/95 border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {filter === 'all' ? 'All Applications' : `${filter.replace('_', ' ')} Applications`}
            </h2>
            <span className="text-sm text-gray-500">{filteredApplications.length} items</span>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : filteredApplications.length > 0 ? (
              <div className="space-y-5">
                {filteredApplications.map((app: any) => (
                  <div
                    key={app.id}
                    className={`p-5 rounded-xl border border-gray-100 border-l-4 ${statusBorders[app.status] || 'border-l-gray-300'} bg-white hover:border-blue-200 hover:shadow-lg transition`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-700 mb-1 text-lg">
                          {app.internship?.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {app.internship?.company || 'Company'}
                        </p>
                      </div>
                      <Badge className={statusColors[app.status] || 'bg-gray-100 text-gray-800'}>
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600 mb-4">
                      <span className="inline-flex items-center gap-2">📍 <span>{app.internship?.location || 'Remote'}</span></span>
                      <span className="inline-flex items-center gap-2">💰 <span>{app.internship?.stipend ? `₹${app.internship.stipend.toLocaleString()}/mo` : 'Unpaid'}</span></span>
                      <span className="inline-flex items-center gap-2">📅 <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span></span>
                      <span className="inline-flex items-center gap-2">🔄 <span>Updated {new Date(app.updatedAt).toLocaleDateString()}</span></span>
                    </div>

                    {app.coverLetter && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        <strong>Cover Letter:</strong> {app.coverLetter}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Link href={`/student/applications/${app.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                      {(app.status === 'PENDING' || app.status === 'UNDER_REVIEW') && (
                        <Button 
                          onClick={() => handleWithdrawClick(app)}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          Withdraw
                        </Button>
                      )}
                      {app.status === 'ACCEPTED' && (
                        <Link href={`/student/internships/${app.internshipId}/milestones`}>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">View Milestones</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-lg">No applications found</p>
                <p className="text-sm mt-2">
                  {filter === 'all' 
                    ? "Start applying to internships to see them here"
                    : `No ${filter.toLowerCase().replace('_', ' ')} applications`}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Withdraw Confirmation Modal */}
        <Modal
          isOpen={showWithdrawModal}
          onClose={() => !withdrawing && setShowWithdrawModal(false)}
          title="Withdraw Application"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to withdraw your application for{' '}
              <strong>{selectedApp?.internship?.title}</strong>?
            </p>
            <p className="text-sm text-gray-600">
              This action cannot be undone. You will need to reapply if you change your mind.
            </p>

            {withdrawError && <Alert variant="error">{withdrawError}</Alert>}

            <div className="flex gap-3 justify-end">
              <Button 
                onClick={() => setShowWithdrawModal(false)}
                variant="outline"
                disabled={withdrawing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleWithdraw}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={withdrawing}
              >
                {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
