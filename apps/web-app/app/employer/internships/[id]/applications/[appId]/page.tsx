'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { RouteGuard } from '@/components/RouteGuard';
import { applicationsApi } from '@/lib/api';
import {
  ApplicationStatus,
  UserRole,
  canTransition,
  getAllowedActions,
  getTransitionBlockReason,
} from '@/domain/application';

export default function ApplicationDetailPage() {
  return (
    <RouteGuard allowedRoles={['EMPLOYER']}>
      <ApplicationDetailContent />
    </RouteGuard>
  );
}

function ApplicationDetailContent() {
  const router = useRouter();
  const params = useParams();
  const internshipId = params?.id as string;
  const applicationId = params?.appId as string;

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  useEffect(() => {
    if (internshipId && applicationId) {
      loadApplication();
    }
  }, [internshipId, applicationId]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await applicationsApi.getOne(applicationId);
      setApplication(response.data);
    } catch (err: any) {
      console.error('Failed to load application:', err);
      setError(err.response?.data?.message || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string, interviewDateTime?: string, notes?: string) => {
    try {
      setActionLoading(true);
      setError('');

      const payload: any = {};
      
      if (status === 'INTERVIEW_SCHEDULED' && interviewDateTime) {
        payload.interviewDate = interviewDateTime;
        if (notes) payload.interviewNotes = notes;
      }

      await applicationsApi.updateStatus(applicationId, status, interviewDateTime, notes);
      
      // Reload application
      await loadApplication();
      
      // Close modals
      setShowRejectModal(false);
      setShowAcceptModal(false);
      setShowInterviewModal(false);
      setInterviewDate('');
      setInterviewNotes('');
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setError(err.response?.data?.message || 'Failed to update application status');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = () => {
    setShowRejectModal(true);
  };

  const openAcceptModal = () => {
    setShowAcceptModal(true);
  };

  const openInterviewModal = () => {
    // Set default interview date to tomorrow at 10 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setInterviewDate(tomorrow.toISOString().slice(0, 16));
    setInterviewNotes('');
    setShowInterviewModal(true);
  };

  const renderStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      SUBMITTED: 'info',
      UNDER_REVIEW: 'info',
      SHORTLISTED: 'warning',
      INTERVIEW_SCHEDULED: 'warning',
      ACCEPTED: 'success',
      REJECTED: 'error',
      WITHDRAWN: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status.replace(/_/g, ' ')}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <header className="bg-white border-b border-[var(--border)]">
          <div className="container-custom py-4">
            <Link href={`/employer/internships/${internshipId}`}>
              <Button variant="outline" size="sm">← Back to Internship</Button>
            </Link>
          </div>
        </header>
        <div className="container-custom py-8">
          <Alert variant="error">{error}</Alert>
        </div>
      </div>
    );
  }

  if (!application) return null;

  const student = application.student;
  const profile = student?.studentProfile;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)]">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/employer/internships/${internshipId}`}>
                <Button variant="outline" size="sm">← Back</Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[var(--primary)]">
                  {profile?.fullName || student?.email || 'Application'}
                </h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  For: {application.internship?.title || 'Internship'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {renderStatusBadge(application.status)}
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Full Name</h3>
                    <p className="text-[var(--primary)]">{profile?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Email</h3>
                    <p className="text-[var(--primary)]">{student?.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Phone</h3>
                    <p className="text-[var(--primary)]">{profile?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Date of Birth</h3>
                    <p className="text-[var(--primary)]">
                      {profile?.dateOfBirth
                        ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN')
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {profile?.bio && (
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Bio</h3>
                    <p className="text-[var(--primary)] whitespace-pre-wrap">{profile.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">College</h3>
                    <p className="text-[var(--primary)]">{profile?.collegeName || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Degree</h3>
                    <p className="text-[var(--primary)]">{profile?.degree || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Major</h3>
                    <p className="text-[var(--primary)]">{profile?.major || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Graduation Year</h3>
                    <p className="text-[var(--primary)]">{profile?.graduationYear || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">CGPA</h3>
                    <p className="text-[var(--primary)]">{profile?.cgpa || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Links */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.skills && profile.skills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="info">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {profile?.resume && (
                    <div>
                      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Resume</h3>
                      <a
                        href={profile.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        View Resume →
                      </a>
                    </div>
                  )}
                  {profile?.linkedinUrl && (
                    <div>
                      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">LinkedIn</h3>
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        View Profile →
                      </a>
                    </div>
                  )}
                  {profile?.githubUrl && (
                    <div>
                      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">GitHub</h3>
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        View Profile →
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Application Details */}
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Applied On</h3>
                    <p className="text-[var(--primary)]">
                      {new Date(application.appliedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Match Score</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${application.aiMatchScore || 0}%` }}
                        />
                      </div>
                      <span className="font-medium">{Math.round(application.aiMatchScore || 0)}%</span>
                    </div>
                  </div>
                </div>

                {application.applicationText && (
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Cover Letter</h3>
                    <p className="text-[var(--primary)] whitespace-pre-wrap">{application.applicationText}</p>
                  </div>
                )}

                {application.status === 'INTERVIEW_SCHEDULED' && application.interviewDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h3 className="font-medium text-blue-900 mb-2">📅 Scheduled Interview</h3>
                    <p className="text-blue-700">
                      {new Date(application.interviewDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {application.interviewNotes && (
                      <p className="text-sm text-blue-600 mt-2">{application.interviewNotes}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getAllowedActions(application.status, UserRole.EMPLOYER).map(action => {
                  const isDisabled = !canTransition(application.status, action.targetStatus, UserRole.EMPLOYER);
                  const blockReason = getTransitionBlockReason(application.status, action.targetStatus, UserRole.EMPLOYER);

                  const handleClick = () => {
                    if (action.confirmRequired) {
                      if (action.targetStatus === 'ACCEPTED') {
                        openAcceptModal();
                      } else if (action.targetStatus === 'REJECTED') {
                        openRejectModal();
                      }
                    } else if (action.targetStatus === 'INTERVIEW_SCHEDULED') {
                      openInterviewModal();
                    } else {
                      handleStatusChange(action.targetStatus);
                    }
                  };

                  return (
                    <Button
                      key={action.targetStatus}
                      fullWidth
                      variant={action.variant as any}
                      onClick={handleClick}
                      disabled={isDisabled || actionLoading}
                      title={blockReason || `${action.label} this application`}
                      className={action.variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                    >
                      {action.icon} {action.label}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {renderStatusBadge(application.status)}
                  <p className="text-sm text-[var(--text-secondary)]">
                    Current status: <span className="font-medium">{application.status.replace(/_/g, ' ')}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Application?"
      >
        <div className="space-y-4">
          <p className="text-red-600 font-semibold">⚠️ This will reject the candidate</p>
          <p className="text-sm text-[var(--text-secondary)]">
            The student will be notified that their application was not successful.
            This action can be reversed later if needed.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowRejectModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => handleStatusChange('REJECTED')}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Rejecting...</span>
                </>
              ) : (
                'Yes, Reject'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Accept Modal */}
      <Modal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title="Accept Application?"
      >
        <div className="space-y-4">
          <p className="text-green-600 font-semibold">✓ Congratulations on finding a great candidate!</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm">
              <strong>Match Score:</strong> {Math.round(application.aiMatchScore || 0)}%
            </p>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            The student will be notified of their acceptance. You can proceed with 
            onboarding and milestone setup after acceptance.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowAcceptModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => handleStatusChange('ACCEPTED')}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Accepting...</span>
                </>
              ) : (
                'Yes, Accept'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Interview Modal */}
      <Modal
        isOpen={showInterviewModal}
        onClose={() => {
          setShowInterviewModal(false);
          setInterviewDate('');
          setInterviewNotes('');
        }}
        title="Schedule Interview"
      >
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            Schedule an interview with <strong>{profile?.fullName || student?.email}</strong>
          </p>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Interview Date & Time *
            </label>
            <input
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              required
            />
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              The candidate will receive a notification with the interview details
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Interview Notes (Optional)
            </label>
            <textarea
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="Add meeting link, location, or any special instructions..."
              rows={4}
              className="w-full px-4 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>📧 Notification:</strong> The candidate will be automatically notified about the interview.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setShowInterviewModal(false);
                setInterviewDate('');
                setInterviewNotes('');
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                if (!interviewDate) {
                  alert('Please select an interview date and time');
                  return;
                }
                handleStatusChange('INTERVIEW_SCHEDULED', interviewDate, interviewNotes);
              }}
              disabled={actionLoading || !interviewDate}
            >
              {actionLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Scheduling...</span>
                </>
              ) : (
                '📅 Schedule Interview'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
