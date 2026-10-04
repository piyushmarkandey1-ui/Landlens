'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, ExternalLink, Loader2,
  Brain, Database, AlertTriangle, CheckCircle2, FileText,
  Workflow, ChevronRight, Sparkles, BookOpen
} from 'lucide-react';
import { parcelAssistant, parcelTruthEngine, reportGenerator } from '@/lib/intelligence';
import type { AssistantResponse } from '@/lib/intelligence';

interface AIAssistantProps {
  parcelId?: string;
  onNavigate?: (path: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  response?: AssistantResponse;
}

const QUICK_PROMPTS = [
  { label: 'Why is this flagged?', icon: <AlertTriangle size={11} /> },
  { label: 'Can I build here?', icon: <CheckCircle2 size={11} /> },
  { label: 'What changed?', icon: <Sparkles size={11} /> },
  { label: 'Who owns this parcel?', icon: <FileText size={11} /> },
  { label: 'What records disagree?', icon: <Database size={11} /> },
  { label: 'Which department should handle this?', icon: <Workflow size={11} /> },
  { label: 'What documents should an officer verify?', icon: <BookOpen size={11} /> },
];

export default function AIAssistant({ parcelId, onNavigate }: AIAssistantProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageSequence = useRef(0);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const truth = parcelId ? parcelTruthEngine.analyze(parcelId) : null;

  const handleSend = async (text?: string) => {
    const query = (text || input).trim();
    if (!query || !parcelId) return;

    messageSequence.current += 1;
    const userMsg: ChatMessage = {
      id: `user-${messageSequence.current}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simulate processing delay for realism
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

    const response = parcelAssistant.ask(query, parcelId);
    messageSequence.current += 1;
    const assistantMsg: ChatMessage = {
      id: `asst-${messageSequence.current}`,
      role: 'assistant',
      content: response.answer,
      timestamp: new Date().toISOString(),
      response,
    };
    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  const handleGenerateReport = () => {
    if (!parcelId) return;
    setShowReport(true);
  };

  const report = showReport && parcelId ? reportGenerator.generate(parcelId) : null;

  // Format markdown-like content
  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold headers
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-indigo-300 mt-2 text-[13px]">{line.replace(/\*\*/g, '')}</p>;
      }
      // Inline bold
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-slate-300 text-[13px] leading-relaxed">
            {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-white">{p}</strong> : p)}
          </p>
        );
      }
      // Numbered list
      if (/^\d+\./.test(line)) {
        return <p key={i} className="text-slate-300 text-[13px] pl-1 leading-relaxed">{line}</p>;
      }
      // Bullet points
      if (line.startsWith('•') || line.startsWith('- ')) {
        return <p key={i} className="text-slate-300 text-[13px] pl-2 leading-relaxed">{line}</p>;
      }
      // Severity indicators
      if (line.startsWith('🔴') || line.startsWith('🟠') || line.startsWith('🟡') || line.startsWith('🔵')) {
        return <p key={i} className="text-[13px] font-medium mt-1.5 leading-relaxed">{line}</p>;
      }
      // Empty line
      if (!line) return <div key={i} className="h-1.5" />;
      return <p key={i} className="text-slate-300 text-[13px] leading-relaxed">{line}</p>;
    });
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-12 right-5 z-50 w-12 h-12 rounded-full gradient-primary shadow-lg shadow-indigo-900/40 flex items-center justify-center text-white hover:scale-105 transition-transform no-print"
        title="AI Parcel Assistant"
      >
        {isOpen ? <X size={18} /> : <Brain size={18} />}
      </button>

      {/* Notification dot when conflicts exist */}
      {!isOpen && truth && truth.conflicts.length > 0 && (
        <div className="fixed bottom-[68px] right-5 z-50 w-4 h-4 rounded-full bg-red-500 border-2 border-slate-950 flex items-center justify-center no-print pointer-events-none">
          <span className="text-[8px] font-bold text-white">{truth.conflicts.length}</span>
        </div>
      )}

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-28 right-5 z-50 w-[420px] max-h-[580px] flex flex-col rounded-2xl shadow-2xl shadow-black/60 overflow-hidden no-print"
            style={{ background: 'rgba(8, 12, 28, 0.98)', border: '1px solid rgba(99,102,241,0.25)' }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-indigo-950/60 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                <Brain size={14} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold font-heading text-white">LandLens Intelligence</div>
                <div className="text-[10px] text-slate-500">Parcel-Aware AI Assistant</div>
              </div>
              {parcelId && (
                <span className="chip bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px]">{parcelId}</span>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Truth Engine Summary Bar */}
            {truth && (
              <div className="px-4 py-2 border-b border-indigo-950/40 bg-slate-900/50">
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-slate-500">Rules: <span className="text-slate-300">{truth.summary.rulesEvaluated}</span></span>
                  <span className="text-slate-700">|</span>
                  <span className="text-slate-500">Datasets: <span className="text-slate-300">{truth.summary.datasetsCompared}</span></span>
                  <span className="text-slate-700">|</span>
                  <span className="text-slate-500">Issues: <span className={truth.summary.issuesDetected > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>{truth.summary.issuesDetected}</span></span>
                  <span className="text-slate-700">|</span>
                  <span className="text-slate-500">Evidence: <span className="text-slate-300">{truth.summary.evidenceRecords}</span></span>
                </div>
              </div>
            )}

            {/* Report View */}
            {showReport && report ? (
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-semibold text-white text-sm">Parcel Intelligence Report</h3>
                  <button onClick={() => setShowReport(false)} className="text-[10px] text-indigo-400 hover:text-indigo-300">Back to Chat</button>
                </div>
                <div className="text-[10px] text-amber-400/80 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2 mb-3">
                  {report.disclaimer}
                </div>
                <div className="text-[10px] text-slate-600 mb-3">Generated: {new Date(report.generatedAt).toLocaleString()}</div>

                {report.sections.map((section, si) => (
                  <div key={si} className="mb-4">
                    <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <div className="w-1 h-3 rounded bg-indigo-500" />
                      {section.title}
                    </h4>
                    {section.content.map((item, ii) => (
                      <div key={ii} className="bg-slate-900/60 rounded-lg px-3 py-2 mb-1.5 border border-slate-800/40">
                        {Object.entries(item).filter(([, v]) => v !== undefined).map(([k, v]) => (
                          <div key={k} className="flex items-start justify-between py-0.5 gap-2">
                            <span className="text-[10px] text-slate-500 flex-shrink-0">{k}</span>
                            <span className={`text-[10px] text-right ${k.includes('SYNTHETIC') ? 'text-amber-500 italic' : 'text-slate-300'}`}>{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}

                {/* Truth Engine Summary in Report */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <div className="w-1 h-3 rounded bg-indigo-500" />
                    Data Consistency
                  </h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    {report.truthEngine.consistency.map(c => (
                      <div key={c.category} className="bg-slate-900/60 rounded px-2 py-1.5 border border-slate-800/40 text-center">
                        <div className="text-[10px] text-slate-500">{c.category}</div>
                        <div className={`text-[10px] font-bold mt-0.5 ${
                          c.status === 'Verified' ? 'text-emerald-400' :
                          c.status === 'Needs Review' ? 'text-amber-400' :
                          c.status === 'Conflict' ? 'text-red-400' :
                          'text-slate-600'
                        }`}>
                          {c.status === 'Verified' ? '●' : c.status === 'Conflict' ? '●' : c.status === 'Needs Review' ? '●' : '○'} {c.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Chat View */
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {/* Welcome message */}
                {messages.length === 0 && parcelId && (
                  <div className="space-y-3">
                    {/* Data Consistency Grid */}
                    {truth && (
                      <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-3">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Database size={10} className="text-indigo-400" />
                          Data Consistency — {parcelId}
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {truth.consistency.map(c => (
                            <div key={c.category} className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/40">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                c.status === 'Verified' ? 'bg-emerald-400' :
                                c.status === 'Needs Review' ? 'bg-amber-400' :
                                c.status === 'Conflict' ? 'bg-red-400' :
                                'bg-slate-600'
                              }`} />
                              <span className="text-[10px] text-slate-400">{c.category}</span>
                            </div>
                          ))}
                        </div>
                        {truth.conflicts.length > 0 && (
                          <div className="mt-2 text-[10px] text-slate-500">
                            {truth.conflicts.length} issue{truth.conflicts.length !== 1 ? 's' : ''} detected — ask me about them
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick prompts */}
                    <div>
                      <div className="text-[10px] text-slate-600 mb-1.5">Ask about this parcel:</div>
                      <div className="flex flex-wrap gap-1">
                        {QUICK_PROMPTS.map(q => (
                          <button
                            key={q.label}
                            onClick={() => handleSend(q.label)}
                            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:border-indigo-500/40 hover:text-indigo-300 transition-colors"
                          >
                            {q.icon}
                            {q.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {!parcelId && messages.length === 0 && (
                  <div className="text-center py-8">
                    <Brain size={24} className="text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Select a parcel to activate intelligence.</p>
                    <p className="text-xs text-slate-600 mt-1">Open the GIS Map or search for a parcel.</p>
                  </div>
                )}

                {/* Messages */}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] rounded-xl overflow-hidden ${
                      msg.role === 'user'
                        ? 'bg-indigo-600/30 border border-indigo-500/30 px-3 py-2'
                        : 'bg-slate-800/40 border border-slate-700/30'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="text-[13px] text-white">{msg.content}</p>
                      ) : (
                        <div>
                          {/* Answer */}
                          <div className="px-3 py-2.5">
                            <div className="space-y-0.5">{formatContent(msg.content)}</div>
                          </div>

                          {/* Evidence */}
                          {msg.response && Object.keys(msg.response.evidence).length > 0 && (
                            <div className="px-3 py-2 border-t border-slate-700/30 bg-slate-900/30">
                              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <FileText size={9} />
                                Evidence
                              </div>
                              <div className="space-y-0.5">
                                {Object.entries(msg.response.evidence).slice(0, 8).map(([k, v]) => (
                                  <div key={k} className="flex items-start justify-between gap-2">
                                    <span className="text-[10px] text-slate-500 flex-shrink-0">{k}</span>
                                    <span className="text-[10px] text-slate-300 text-right font-mono">{String(v)}</span>
                                  </div>
                                ))}
                                {Object.keys(msg.response.evidence).length > 8 && (
                                  <div className="text-[9px] text-slate-600 pt-0.5">+{Object.keys(msg.response.evidence).length - 8} more evidence records</div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Datasets & Recommendation */}
                          {msg.response && (
                            <div className="px-3 py-2 border-t border-slate-700/30 bg-slate-900/20">
                              {msg.response.datasetsUsed.length > 0 && (
                                <div className="mb-1.5">
                                  <span className="text-[9px] text-slate-600">Datasets: </span>
                                  <span className="text-[10px] text-slate-400">{msg.response.datasetsUsed.join(' · ')}</span>
                                </div>
                              )}
                              {msg.response.recommendedAction && (
                                <div className="flex items-start gap-1.5">
                                  <ChevronRight size={9} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-[10px] text-indigo-400 font-medium">{msg.response.recommendedAction}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          {msg.response?.suggestedActions && msg.response.suggestedActions.length > 0 && (
                            <div className="px-3 py-2 border-t border-slate-700/30 flex flex-wrap gap-1">
                              {msg.response.suggestedActions.map(a => (
                                <button
                                  key={a.label}
                                  onClick={() => {
                                    if (a.action === 'ask' && a.params?.question) {
                                      handleSend(a.params.question);
                                    } else if (a.action === 'generate_report') {
                                      handleGenerateReport();
                                    } else if (a.action === 'navigate' && a.params?.path) {
                                      if (onNavigate) onNavigate(a.params.path);
                                      else router.push(a.params.path);
                                    }
                                  }}
                                  className="text-[10px] px-2 py-1 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/25 hover:bg-indigo-600/40 transition-colors flex items-center gap-1"
                                >
                                  {a.label}
                                  <ExternalLink size={8} />
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Meta bar */}
                          {msg.response && (
                            <div className="px-3 py-1.5 border-t border-slate-800/30 bg-slate-950/40 flex items-center gap-3 text-[9px] text-slate-600">
                              <span>Rules: {msg.response.meta.rulesEvaluated}</span>
                              <span>Datasets: {msg.response.meta.datasetsCompared}</span>
                              <span>Issues: {msg.response.meta.issuesDetected}</span>
                              <span>Evidence: {msg.response.meta.evidenceAvailable}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <Loader2 size={13} className="text-indigo-400 animate-spin" />
                      <span className="text-xs text-slate-400">Analyzing parcel data...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Bottom Actions */}
            {parcelId && !showReport && messages.length > 0 && (
              <div className="px-3 py-1.5 border-t border-indigo-950/30 flex gap-1">
                <button
                  onClick={handleGenerateReport}
                  className="text-[10px] px-2 py-1 rounded bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:border-indigo-500/30 hover:text-indigo-300 transition-colors flex items-center gap-1"
                >
                  <FileText size={9} />
                  Generate Report
                </button>
                <button
                  onClick={() => { setMessages([]); setShowReport(false); }}
                  className="text-[10px] px-2 py-1 rounded bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:border-rose-500/30 hover:text-rose-300 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-2.5 border-t border-indigo-950/60 flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={parcelId ? 'Ask about this parcel...' : 'Select a parcel first...'}
                disabled={!parcelId}
                className="flex-1 bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/40 transition-colors disabled:opacity-40"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading || !parcelId}
                className="p-2 rounded-lg gradient-primary text-white disabled:opacity-40 transition-opacity"
              >
                <Send size={14} />
              </button>
            </div>

            {/* Disclaimer */}
            <div className="px-3 py-1 text-center">
              <span className="text-[8px] text-slate-700">Synthetic demo data · Not legal advice · SIH Prototype</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
