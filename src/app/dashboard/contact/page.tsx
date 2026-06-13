'use client';

import React, { useState } from 'react';
import DashboardLayout from '../layout';
import { trpc } from '@/utils/trpc';
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  MapPin, 
  Send, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  ShieldCheck, 
  Info,
  User,
  BookOpen
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [success, setSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const submitContactMutation = trpc.contact.submitMessage.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setErrors({});
    },
    onError: (err) => {
      alert(`Failed to send message: ${err.message}`);
    }
  });

  const validateEmail = (emailStr: string) => {
    return /\S+@\S+\.\S+/.test(emailStr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; message?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!message.trim()) {
      newErrors.message = 'Message content is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    submitContactMutation.mutate({
      name,
      email,
      subject: subject || undefined,
      message
    });
  };

  const faqs: FaqItem[] = [
    {
      question: 'How quickly will I receive a reply?',
      answer: 'Our average response time is under 2 hours during market hours (9:00 AM - 6:00 PM IST). For enterprise accounts, we guarantee responses in under 30 minutes via dedicated channels.'
    },
    {
      question: 'Can I request custom intelligence feeds for my company?',
      answer: 'Yes! Under our Enterprise Tier, we configure custom industry filters, bespoke vector search collections, and specialized RSS/API connectors. Contact us directly to set this up.'
    },
    {
      question: 'How do I update my billing or cancel my plan?',
      answer: 'You can manage your subscription instantly by navigating to the "Billing & Plans" section in your account sidebar. There, you can access the self-serve Stripe portal to download invoices, swap cards, or cancel.'
    },
    {
      question: 'Are the briefings compiled by humans or AI?',
      answer: 'We use state-of-the-art LLMs (OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet) to aggregate, score, and summarize thousands of daily signals, which are then formatted into high-quality digests. Human editors continuously supervise the scoring criteria.'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-10 max-w-5xl mx-auto pb-16">
        
        {/* Contact Hero */}
        <div className="relative rounded-2xl overflow-hidden border border-coffee-border/30 bg-gradient-to-r from-[#170e0b] via-[#0f0a08] to-[#070403] p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-coffee-accent/5 rounded-full blur-3xl -z-10" />
          <div className="max-w-2xl space-y-4">
            <span className="text-[10px] font-mono uppercase text-coffee-accent tracking-widest bg-coffee-accent/10 border border-coffee-accent/20 px-2.5 py-1 rounded">
              Support Center
            </span>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-coffee-cream leading-tight">
              Let's refine your <span className="text-coffee-accent">intelligence stream</span>.
            </h1>
            <p className="text-xs md:text-sm text-coffee-text-muted leading-relaxed">
              Have questions about your custom briefings, signal scoring, API access, or plan upgrades? Reach out to our engineers and market specialists directly.
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form / Success Card */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel border border-coffee-border/40 bg-[#0c0806]/95 rounded-xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-coffee-accent/60" />
              
              {success ? (
                <div className="py-8 text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-display font-bold text-coffee-cream">Message Received Successfully!</h2>
                    <p className="text-xs text-coffee-text-muted max-w-sm mx-auto leading-relaxed">
                      Thank you for reaching out. A confirmation email has been dispatched to <strong className="text-coffee-cream">{email}</strong>. Our support team will review and respond shortly.
                    </p>
                  </div>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="px-5 py-2 bg-[#1b120f] border border-coffee-border/60 hover:bg-coffee-border/20 text-coffee-cream text-xs font-semibold rounded-lg transition-colors"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center gap-2 border-b border-coffee-border/10 pb-4 mb-2">
                    <MessageSquare className="w-4 h-4 text-coffee-accent" />
                    <h2 className="text-sm font-display font-extrabold text-coffee-cream uppercase tracking-wide">
                      Submit an Inquiry
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-coffee-text-muted uppercase tracking-wider block">
                        Full Name <span className="text-coffee-accent">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-coffee-text-muted/60" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors({ ...errors, name: undefined });
                          }}
                          placeholder="Jane Doe"
                          className={`w-full pl-9 pr-3 py-2 bg-[#080504] border rounded-lg text-xs text-coffee-cream focus:outline-none focus:border-coffee-accent transition-colors ${
                            errors.name ? 'border-red-500/60' : 'border-coffee-border/40'
                          }`}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-[10px] text-red-400 font-medium">{errors.name}</p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-coffee-text-muted uppercase tracking-wider block">
                        Email Address <span className="text-coffee-accent">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-coffee-text-muted/60" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({ ...errors, email: undefined });
                          }}
                          placeholder="jane@company.com"
                          className={`w-full pl-9 pr-3 py-2 bg-[#080504] border rounded-lg text-xs text-coffee-cream focus:outline-none focus:border-coffee-accent transition-colors ${
                            errors.email ? 'border-red-500/60' : 'border-coffee-border/40'
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-[10px] text-red-400 font-medium">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-coffee-text-muted uppercase tracking-wider block">
                      Subject
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-2.5 w-3.5 h-3.5 text-coffee-text-muted/60" />
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Custom Ingestion Feed Request"
                        className="w-full pl-9 pr-3 py-2 bg-[#080504] border border-coffee-border/40 rounded-lg text-xs text-coffee-cream focus:outline-none focus:border-coffee-accent transition-colors"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-coffee-text-muted uppercase tracking-wider block">
                      Message <span className="text-coffee-accent">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors({ ...errors, message: undefined });
                      }}
                      rows={5}
                      placeholder="Describe your issue or custom request details..."
                      className={`w-full p-3 bg-[#080504] border rounded-lg text-xs text-coffee-cream focus:outline-none focus:border-coffee-accent transition-colors resize-none ${
                        errors.message ? 'border-red-500/60' : 'border-coffee-border/40'
                      }`}
                    />
                    {errors.message && (
                      <p className="text-[10px] text-red-400 font-medium">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitContactMutation.isPending}
                    className="w-full py-2.5 bg-coffee-accent hover:bg-coffee-accent-hover text-[#090504] text-xs font-extrabold uppercase rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(194,136,84,0.15)] disabled:opacity-50"
                  >
                    {submitContactMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Support info & FAQs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Response Time Notice */}
            <div className="glass-panel border border-coffee-border/30 bg-[#0f0a08]/40 p-4 rounded-xl flex gap-3 items-start">
              <div className="w-8 h-8 rounded bg-coffee-accent/10 flex items-center justify-center text-coffee-accent shrink-0">
                <Clock className="w-4 h-4 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-coffee-cream">Standard Response Window</h3>
                <p className="text-[10px] text-coffee-text-muted leading-relaxed">
                  We are online Monday through Friday, 9:00 AM - 6:00 PM IST. Inquiries submitted during off-hours are prioritized first thing on the next business day.
                </p>
              </div>
            </div>

            {/* Support Information */}
            <div className="glass-panel border border-coffee-border/40 bg-[#0b0705]/40 rounded-xl p-5 space-y-4">
              <h3 className="text-[10px] font-mono uppercase text-coffee-text-muted tracking-wider border-b border-coffee-border/10 pb-2">
                Escalation Channels
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-coffee-accent shrink-0" />
                  <div>
                    <h4 className="text-[11px] font-bold text-coffee-cream">General & Press Support</h4>
                    <p className="text-[10px] text-coffee-text-muted">team@filtercoffee.ai</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-coffee-accent shrink-0" />
                  <div>
                    <h4 className="text-[11px] font-bold text-coffee-cream">Headquarters</h4>
                    <p className="text-[10px] text-coffee-text-muted">Aruthra Tech Park, Chennai, TN, India</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-coffee-accent shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] font-bold text-coffee-cream">Billing Help</h4>
                    <p className="text-[10px] text-coffee-text-muted leading-relaxed">
                      For plan cancellations or invoicing updates, please go to the Billing Dashboard directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="glass-panel border border-coffee-border/40 bg-[#0b0705]/40 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-coffee-border/10 pb-2">
                <HelpCircle className="w-3.5 h-3.5 text-coffee-accent" />
                <h3 className="text-[10px] font-mono uppercase text-coffee-text-muted tracking-wider">
                  Quick FAQs
                </h3>
              </div>

              <div className="space-y-2.5">
                {faqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={idx} className="border-b border-coffee-border/10 pb-2.5 last:border-b-0 last:pb-0">
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full flex justify-between items-center text-left text-coffee-cream hover:text-coffee-accent transition-colors"
                      >
                        <span className="text-[11px] font-semibold">{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-3.5 h-3.5 text-coffee-accent shrink-0 ml-2" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-coffee-text-muted shrink-0 ml-2" />
                        )}
                      </button>
                      
                      {isOpen && (
                        <p className="text-[10px] text-coffee-text-muted mt-2 leading-relaxed animate-fade-in">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
