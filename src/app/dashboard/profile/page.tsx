'use client';

import React, { useState, useEffect } from 'react';
import { trpc } from '@/utils/trpc';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Lock,
  Trash2,
  Loader2,
  CreditCard,
  Mail,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ExternalLink,
  Calendar,
  ShieldCheck,
  Sliders
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { signOut } = useSupabaseAuth();

  // Query User Profile
  const { data: profile, isLoading: isProfileLoading, refetch: refetchProfile } = trpc.user.getProfile.useQuery();

  // State for Personal Info Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [personalSuccess, setPersonalSuccess] = useState(false);
  const [personalError, setPersonalError] = useState('');

  // Sync profile data to state once fetched
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  // State for Security Form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // State for Audit Logs Query
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data: logData, isLoading: isLogsLoading, refetch: refetchLogs } = trpc.user.getAuditLogs.useQuery({
    search: search || undefined,
    filter: filter !== 'ALL' ? filter : undefined,
    page,
    limit
  }, {
    placeholderData: (prev) => prev
  });

  // State for Danger Zone Account Deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Mutations
  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      setPersonalSuccess(true);
      setPersonalError('');
      refetchProfile();
      refetchLogs();
      setTimeout(() => setPersonalSuccess(false), 3000);
    },
    onError: (err) => {
      setPersonalError(err.message || 'Failed to update profile details.');
      setPersonalSuccess(false);
    }
  });

  const deleteAccountMutation = trpc.user.deleteAccount.useMutation({
    onSuccess: async () => {
      await signOut();
      router.push('/');
      router.refresh();
    },
    onError: (err) => {
      setDeleteError(err.message || 'Failed to delete account.');
    }
  });

  // Action Handlers
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalError('');
    setPersonalSuccess(false);

    if (!name.trim()) {
      setPersonalError('Full name is required.');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setPersonalError('A valid email address is required.');
      return;
    }

    updateProfileMutation.mutate({ name, email });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!newPassword) {
      setPasswordError('New password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess(true);
        setNewPassword('');
        setConfirmPassword('');
        refetchLogs();
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update security credentials.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');

    if (deleteConfirmationText !== 'DELETE MY ACCOUNT') {
      setDeleteError('Please type the confirmation phrase exactly.');
      return;
    }

    deleteAccountMutation.mutate();
  };

  if (isProfileLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-coffee-accent animate-spin" />
        <p className="text-xs text-coffee-text-muted mt-2">Loading account details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-display font-extrabold text-coffee-cream">User Profile & Account Settings</h1>
        <p className="text-xs text-coffee-text-muted">Manage your personal profile details, authentication credentials, and review your activity audit log.</p>
      </div>

      {/* Main Grid: Overview & Information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand: Overview & Forms (Cols 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Overview Card */}
          <div className="glass-panel border border-coffee-border/40 bg-[#0e0907]/60 rounded-xl p-6 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-coffee-accent/60" />
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-coffee-border flex items-center justify-center border-2 border-coffee-accent/50 text-lg font-extrabold text-coffee-accent font-display shrink-0 shadow-lg">
                {(name || 'FC').substring(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-display font-extrabold text-coffee-cream leading-tight">
                    {name || 'User Name'}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-coffee-accent/10 text-coffee-accent border border-coffee-accent/30">
                    {profile?.role || 'USER'}
                  </span>
                </div>
                <p className="text-xs font-mono text-coffee-text-muted">{email}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-coffee-text-muted">
                  <Calendar className="w-3 h-3 text-coffee-accent" />
                  <span>Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-1 sm:text-right shrink-0">
              <div className="text-[10px] font-mono text-coffee-text-muted uppercase tracking-wider">Account Status</div>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 justify-start sm:justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Session Verified</span>
              </div>
            </div>
          </div>

          {/* Personal Information Form */}
          <div className="glass-panel border border-coffee-border/40 bg-[#0c0806]/95 rounded-xl p-6 relative">
            <div className="flex items-center gap-2 border-b border-coffee-border/10 pb-4 mb-4">
              <User className="w-4 h-4 text-coffee-accent" />
              <h3 className="text-sm font-display font-extrabold text-coffee-cream uppercase tracking-wide">
                Personal Information
              </h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {personalSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Profile updated successfully!</span>
                </div>
              )}
              {personalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{personalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-coffee-text-muted uppercase tracking-wider block">
                    Full Name <span className="text-coffee-accent">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 bg-[#080504] border border-coffee-border/40 rounded-lg text-xs text-coffee-cream focus:outline-none focus:border-coffee-accent transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-coffee-text-muted uppercase tracking-wider block">
                    Email Address <span className="text-coffee-accent">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 bg-[#080504] border border-coffee-border/40 rounded-lg text-xs text-coffee-cream focus:outline-none focus:border-coffee-accent transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-4 py-2 bg-coffee-accent hover:bg-coffee-accent-hover text-[#090504] text-xs font-extrabold uppercase rounded-lg transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {updateProfileMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Security & Password Form */}
          <div className="glass-panel border border-coffee-border/40 bg-[#0c0806]/95 rounded-xl p-6 relative">
            <div className="flex items-center gap-2 border-b border-coffee-border/10 pb-4 mb-4">
              <Lock className="w-4 h-4 text-coffee-accent" />
              <h3 className="text-sm font-display font-extrabold text-coffee-cream uppercase tracking-wide">
                Security & Password
              </h3>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {passwordSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Password updated successfully!</span>
                </div>
              )}
              {passwordError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-coffee-text-muted uppercase tracking-wider block">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-[#080504] border border-coffee-border/40 rounded-lg text-xs text-coffee-cream focus:outline-none focus:border-coffee-accent transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-coffee-text-muted uppercase tracking-wider block">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-[#080504] border border-coffee-border/40 rounded-lg text-xs text-coffee-cream focus:outline-none focus:border-coffee-accent transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-[#1b120f] border border-coffee-border/60 hover:bg-coffee-border/20 text-coffee-cream text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {passwordLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Hand: Stats, Logs, Danger Zone (Cols 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Billing & Support Quick Navigation Link summaries */}
          <div className="grid grid-cols-1 gap-4">
            
            {/* Billing Summary */}
            <div className="glass-panel border border-coffee-border/40 bg-[#0b0705]/40 rounded-xl p-5 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-coffee-accent/5 rounded-full blur-2xl -z-10" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-coffee-accent" />
                  <h4 className="text-xs font-display font-bold text-coffee-cream">Subscription Billing</h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-coffee-accent/20 text-coffee-accent">
                  {profile?.subscription?.status || 'INACTIVE'}
                </span>
              </div>
              <p className="text-[10px] text-coffee-text-muted leading-relaxed">
                Active Plan: <strong className="text-coffee-cream">{profile?.subscription?.stripePriceId ? 'PRO / POWER' : 'FREE TIER'}</strong>. Swap credit cards, check signal quotas, and manage invoices instantly.
              </p>
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center gap-1 text-[10px] text-coffee-accent hover:text-coffee-accent-hover font-bold animate-pulse"
              >
                <span>Navigate to Billing Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Support Ticket Summary */}
            <div className="glass-panel border border-coffee-border/40 bg-[#0b0705]/40 rounded-xl p-5 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-coffee-accent/5 rounded-full blur-2xl -z-10" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-coffee-accent" />
                  <h4 className="text-xs font-display font-bold text-coffee-cream">Contact Engineering</h4>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-coffee-border/30 text-coffee-text-muted">
                  Support Online
                </span>
              </div>
              <p className="text-[10px] text-coffee-text-muted leading-relaxed">
                Need customized vector pipelines or custom AI ingestion filters? Contact our platform administrators directly.
              </p>
              <Link
                href="/dashboard/contact"
                className="inline-flex items-center gap-1 text-[10px] text-coffee-accent hover:text-coffee-accent-hover font-bold"
              >
                <span>Submit Support Request</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

          </div>

          {/* Danger Zone Card */}
          <div className="glass-panel border border-red-950/60 bg-red-950/5 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-red-900/20 pb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h4 className="text-[10px] font-mono uppercase text-red-400 tracking-wider">
                Danger Zone
              </h4>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] text-red-300/80 leading-relaxed">
                Deleting your account deletes all personalized vector topics, briefing logs, Stripe bindings, and digests. This action cannot be reversed.
              </p>
              
              {!showDeleteModal ? (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3.5 py-1.5 bg-red-950/50 hover:bg-red-900/30 border border-red-800/40 text-red-200 text-xs font-semibold rounded transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete FilterCoffee Account</span>
                </button>
              ) : (
                <form onSubmit={handleDeleteAccount} className="space-y-3 bg-red-950/20 border border-red-900/30 p-4 rounded-lg animate-fade-in">
                  <div className="text-[10px] font-bold text-red-300">
                    To confirm deletion, please type <code className="bg-red-950 px-1 py-0.5 rounded font-mono text-red-400">DELETE MY ACCOUNT</code> below:
                  </div>
                  
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    className="w-full px-3 py-1.5 bg-[#090504] border border-red-900/30 rounded text-xs text-red-200 focus:outline-none focus:border-red-500 transition-colors"
                  />

                  {deleteError && (
                    <p className="text-[10px] text-red-400 font-medium">{deleteError}</p>
                  )}

                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="submit"
                      disabled={deleteAccountMutation.isPending}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded flex items-center gap-1 disabled:opacity-50"
                    >
                      {deleteAccountMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>Permanently Delete</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeleteConfirmationText('');
                        setDeleteError('');
                      }}
                      className="px-3 py-1.5 bg-[#170e0b] border border-coffee-border/50 text-coffee-cream text-xs rounded hover:bg-coffee-border/20"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Activity Log / Audit Logs Table */}
      <div className="glass-panel border border-coffee-border/40 bg-[#0c0806]/95 rounded-xl p-6 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-coffee-border/10 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-coffee-accent" />
            <h3 className="text-sm font-display font-extrabold text-coffee-cream uppercase tracking-wide">
              Activity Audit Logs
            </h3>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-coffee-text-muted/60" />
              <input
                type="text"
                placeholder="Search audit details..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-1.5 bg-[#080504] border border-coffee-border/40 rounded-lg text-xs text-coffee-cream focus:outline-none focus:border-coffee-accent transition-colors w-48 sm:w-56"
              />
            </div>

            {/* Filter Dropdown */}
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-[#080504] border border-coffee-border/40 rounded-lg text-xs text-coffee-cream focus:outline-none focus:border-coffee-accent transition-colors"
            >
              <option value="ALL">All Actions</option>
              <option value="PROFILE_UPDATE">Profile Updates</option>
              <option value="SIGN_IN">Logins</option>
              <option value="PASSWORD_CHANGE">Security Changes</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto min-h-[200px]">
          {isLogsLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-6 h-6 text-coffee-accent animate-spin mx-auto" />
              <p className="text-[10px] text-coffee-text-muted mt-2">Refreshing audit records...</p>
            </div>
          ) : !logData?.logs || logData.logs.length === 0 ? (
            <div className="py-16 text-center text-xs text-coffee-text-muted">
              No audit logs match your search.
            </div>
          ) : (
            <div className="space-y-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-coffee-border/10 text-[9px] font-mono text-coffee-text-muted uppercase tracking-wider">
                    <th className="py-2 font-normal">Timestamp</th>
                    <th className="py-2 font-normal">Action Event</th>
                    <th className="py-2 font-normal">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-coffee-border/10 text-[11px]">
                  {logData.logs.map((log) => (
                    <tr key={log.id} className="text-coffee-text-muted hover:text-coffee-cream">
                      <td className="py-3 font-mono text-coffee-text-muted shrink-0 w-44">
                        {new Date(log.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="py-3 shrink-0 w-40">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          log.action === 'PROFILE_UPDATE'
                            ? 'bg-coffee-accent/10 text-coffee-accent border border-coffee-accent/20'
                            : 'bg-coffee-border/30 text-coffee-cream'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 font-sans break-words pr-2 max-w-xs md:max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {logData.pagination.pages > 1 && (
                <div className="flex items-center justify-between border-t border-coffee-border/10 pt-4 text-[11px] text-coffee-text-muted">
                  <div>
                    Showing page <span className="font-bold text-coffee-cream">{logData.pagination.currentPage}</span> of <span className="font-bold text-coffee-cream">{logData.pagination.pages}</span> ({logData.pagination.total} records)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="px-2 py-1 bg-[#1b120f] border border-coffee-border/60 rounded text-coffee-cream hover:bg-coffee-border/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, logData.pagination.pages))}
                      disabled={page === logData.pagination.pages}
                      className="px-2 py-1 bg-[#1b120f] border border-coffee-border/60 rounded text-coffee-cream hover:bg-coffee-border/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
