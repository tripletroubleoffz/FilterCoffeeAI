'use client';

import React, { useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import { Briefcase, RefreshCw, Sparkles, TrendingUp, Users, DollarSign, ArrowUpRight, HelpCircle } from 'lucide-react';

interface JobRole {
  id: string;
  title: string;
  company: string;
  salary: string;
  location: 'Remote' | 'Hybrid' | 'San Francisco, CA' | 'New York, NY';
  skillsRequired: string[];
}

export default function HiringPulsePage() {
  const [filterLocation, setFilterLocation] = useState<'ALL' | 'REMOTE' | 'SF'>('ALL');

  const jobs: JobRole[] = [
    {
      id: 'job-1',
      title: 'Senior AI Orchestration Engineer',
      company: 'OpenAI',
      salary: '$180,000 - $240,000',
      location: 'San Francisco, CA',
      skillsRequired: ['LangGraph', 'YAML declarations', 'Python', 'Redis Caching']
    },
    {
      id: 'job-2',
      title: 'Graph RAG Systems Architect',
      company: 'Anthropic',
      salary: '$190,000 - $250,000',
      location: 'Remote',
      skillsRequired: ['Claude API', 'Neo4j Graph Database', 'pgvector sharding', 'Rust']
    },
    {
      id: 'job-3',
      title: 'Vector Database Core Maintainer',
      company: 'Qdrant',
      salary: '$150,000 - $210,000',
      location: 'Hybrid',
      skillsRequired: ['Rust systems development', 'Raft Consensus protocol', 'Vector sharding']
    },
    {
      id: 'job-4',
      title: 'Devin Integration Engineer',
      company: 'Cognition AI',
      salary: '$160,000 - $220,000',
      location: 'New York, NY',
      skillsRequired: ['Next.js compiler internals', 'Docker container isolation', 'Agent state routing']
    }
  ];

  const filteredJobs = jobs.filter(j => {
    if (filterLocation === 'REMOTE') return j.location === 'Remote';
    if (filterLocation === 'SF') return j.location === 'San Francisco, CA';
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-coffee-cream flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-coffee-accent animate-pulse" />
              Hiring Pulse
            </h1>
            <p className="text-xs text-coffee-text-muted">
              Live telemetry on AI engineering roles, top recruiting firms, remote ratios, and salary distributions.
            </p>
          </div>
          
          {/* Quick Filters */}
          <div className="flex gap-1.5 p-1 bg-coffee-dark rounded-lg border border-coffee-border/40 w-fit">
            {(['ALL', 'REMOTE', 'SF'] as const).map((loc) => {
              const label = loc === 'ALL' ? 'All Roles' : loc === 'REMOTE' ? 'Remote Only' : 'San Francisco';
              return (
                <button
                  key={loc}
                  onClick={() => setFilterLocation(loc)}
                  className={`px-3 py-1.5 rounded text-[10px] font-semibold tracking-wide transition-all ${
                    filterLocation === loc
                      ? 'bg-coffee-accent text-[#090504]'
                      : 'text-coffee-text-muted hover:text-coffee-cream'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Market telemtry stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-5 rounded-lg">
            <span className="text-[9px] uppercase font-mono text-coffee-text-muted">Active Openings</span>
            <div className="text-lg font-display font-extrabold text-coffee-cream mt-1">1,240 postings</div>
          </div>
          <div className="glass-panel p-5 rounded-lg">
            <span className="text-[9px] uppercase font-mono text-coffee-text-muted">Remote Ratio</span>
            <div className="text-lg font-display font-extrabold text-emerald-400 mt-1">42% of roles</div>
          </div>
          <div className="glass-panel p-5 rounded-lg">
            <span className="text-[9px] uppercase font-mono text-coffee-text-muted">Average Base Pay</span>
            <div className="text-lg font-display font-extrabold text-coffee-cream mt-1">$175,000 median</div>
          </div>
        </div>

        {/* Jobs list */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase text-coffee-accent tracking-widest flex items-center gap-1 border-b border-coffee-border/20 pb-2">
            <TrendingUp className="w-4 h-4" /> Live AI Opportunities Log
          </h3>
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="glass-panel p-5 rounded-xl border border-coffee-border/40 hover:border-coffee-accent/40 bg-[#0f0a08]/90 flex justify-between items-center transition-all duration-300 relative group"
            >
              <div className="h-[2px] w-full bg-gradient-to-r from-coffee-accent/10 via-coffee-accent to-coffee-accent/10 absolute top-0 left-0 right-0" />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold text-coffee-accent bg-[#070403] px-2 py-0.5 rounded border border-coffee-accent/20">
                    {job.company}
                  </span>
                  <span className="text-[9px] text-coffee-text-muted font-mono">{job.location}</span>
                </div>
                <h4 className="text-sm font-display font-extrabold text-coffee-cream group-hover:text-white transition-colors">
                  {job.title}
                </h4>
                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skillsRequired.map((skill, index) => (
                    <span key={index} className="text-[8.5px] font-mono text-coffee-text-muted border border-coffee-border/60 bg-coffee-dark/40 px-1.5 py-0.2 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Salary & Action button */}
              <div className="text-right space-y-2 shrink-0 pl-4">
                <span className="block text-[10px] font-mono font-bold text-emerald-400">{job.salary}</span>
                <button 
                  onClick={() => alert(`Redirecting application pipeline to ${job.company} telemetry...`)}
                  className="px-3 py-1 bg-coffee-accent hover:bg-coffee-accent-hover text-[#090504] text-[10px] font-bold rounded transition-colors uppercase tracking-wider"
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
