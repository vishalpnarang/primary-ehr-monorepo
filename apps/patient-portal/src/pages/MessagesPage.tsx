import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  ArrowLeft,
  User,
  Paperclip,
  Lock,
} from 'lucide-react';
import { inboxApi } from '@primus/ui/mocks/api';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  sender: 'patient' | 'provider';
  senderName: string;
  body: string;
  timestamp: string;
}

interface Thread {
  id: string;
  subject: string;
  participant: string;
  participantRole: string;
  lastMessage: string;
  lastTimestamp: string;
  unread: boolean;
  messages: Message[];
}

// ─── Fallback mock data ─────────────────────────────────────────────────────

const FALLBACK_THREADS: Thread[] = [
  {
    id: 'MSG-001',
    subject: 'A1c Results — Follow-up',
    participant: 'Dr. Emily Chen, MD',
    participantRole: 'Internal Medicine',
    lastMessage: 'Your A1c level is 6.8%, which shows great improvement from last quarter...',
    lastTimestamp: 'Mar 18',
    unread: true,
    messages: [
      {
        id: 'm1',
        sender: 'provider',
        senderName: 'Dr. Emily Chen, MD',
        body: "Hi Robert, I wanted to reach out regarding your latest lab results. Your A1c level is 6.8%, which shows great improvement from last quarter's 7.2%. Keep up the excellent work with your diet and exercise regimen!",
        timestamp: 'Mar 18, 2026 at 10:42 AM',
      },
      {
        id: 'm2',
        sender: 'provider',
        senderName: 'Dr. Emily Chen, MD',
        body: "I've also reviewed your fasting glucose (98 mg/dL — within normal range) and your blood pressure readings you submitted last week. Everything is trending in the right direction. Let me know if you have any questions before your follow-up on Mar 24.",
        timestamp: 'Mar 18, 2026 at 10:43 AM',
      },
      {
        id: 'm3',
        sender: 'patient',
        senderName: 'Robert Johnson',
        body: "Thank you so much Dr. Chen! I've been sticking to the low-carb diet and walking 30 minutes daily. Really glad to see progress. I do have a question about my metformin dosage — should we keep it the same?",
        timestamp: 'Mar 18, 2026 at 2:15 PM',
      },
    ],
  },
  {
    id: 'MSG-002',
    subject: 'Appointment Confirmation — Mar 24',
    participant: 'Front Desk',
    participantRole: 'Primus Think Clinic',
    lastMessage: 'Your appointment has been confirmed for March 24 at 2:00 PM with Dr. Chen.',
    lastTimestamp: 'Mar 15',
    unread: false,
    messages: [
      {
        id: 'm4',
        sender: 'provider',
        senderName: 'Primus Think Front Desk',
        body: 'Hi Robert! Your appointment with Dr. Emily Chen has been confirmed for Tuesday, March 24, 2026 at 2:00 PM at our Dublin, OH location. Please arrive 10 minutes early for check-in.',
        timestamp: 'Mar 15, 2026 at 9:00 AM',
      },
      {
        id: 'm5',
        sender: 'provider',
        senderName: 'Primus Think Front Desk',
        body: 'If you need to reschedule or cancel, please do so at least 24 hours in advance. Reply to this message or call us at (614) 555-0100.',
        timestamp: 'Mar 15, 2026 at 9:01 AM',
      },
    ],
  },
  {
    id: 'MSG-003',
    subject: 'Question About Lisinopril',
    participant: 'Nurse Kim Lee, RN',
    participantRole: 'Clinical Staff',
    lastMessage: "It's normal to experience mild dizziness when first starting Lisinopril...",
    lastTimestamp: 'Mar 12',
    unread: false,
    messages: [
      {
        id: 'm6',
        sender: 'patient',
        senderName: 'Robert Johnson',
        body: "Hi, I started the new Lisinopril prescription last week and I've been feeling a bit dizzy in the mornings. Is this normal? Should I be concerned?",
        timestamp: 'Mar 11, 2026 at 8:30 AM',
      },
      {
        id: 'm7',
        sender: 'provider',
        senderName: 'Nurse Kim Lee, RN',
        body: "Hi Robert, thanks for reaching out! It's completely normal to experience mild dizziness when first starting Lisinopril, especially in the morning. This is often due to the medication lowering your blood pressure. Try getting up slowly from bed and sitting on the edge for a moment before standing.",
        timestamp: 'Mar 12, 2026 at 11:20 AM',
      },
      {
        id: 'm8',
        sender: 'provider',
        senderName: 'Nurse Kim Lee, RN',
        body: "If the dizziness persists after 2 weeks or becomes severe, please contact us. Dr. Chen may want to adjust your dose. You can also check your blood pressure at home and share the readings with us.",
        timestamp: 'Mar 12, 2026 at 11:21 AM',
      },
    ],
  },
  {
    id: 'MSG-004',
    subject: 'Lab Order — Comprehensive Metabolic Panel',
    participant: 'Dr. Emily Chen, MD',
    participantRole: 'Internal Medicine',
    lastMessage: 'Please go to the Quest Diagnostics location of your choice within the next 7 days.',
    lastTimestamp: 'Mar 10',
    unread: false,
    messages: [
      {
        id: 'm9',
        sender: 'provider',
        senderName: 'Dr. Emily Chen, MD',
        body: 'Hi Robert, I have sent a lab order to Quest Diagnostics for a Comprehensive Metabolic Panel and Hemoglobin A1c. Please go to the Quest Diagnostics location of your choice within the next 7 days. No special fasting is required for the CMP, but please fast 8 hours before if you want an accurate fasting glucose.',
        timestamp: 'Mar 10, 2026 at 2:30 PM',
      },
    ],
  },
];

// ─── Components ────────────────────────────────────────────────────────────

const ThreadListSkeleton: React.FC = () => (
  <div className="animate-pulse divide-y divide-gray-100">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    ))}
  </div>
);

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// ─── Main Page ─────────────────────────────────────────────────────────────

const MessagesPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(FALLBACK_THREADS[0].id);
  const [reply, setReply] = useState('');
  const [showThread, setShowThread] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Try shared API threads — falls back to local data if empty
  const { data: apiThreads, isLoading } = useQuery({
    queryKey: ['inbox', 'threads'],
    queryFn: () => inboxApi.getThreads(),
  });

  // Use fallback threads (structured for UI) since the shared API returns inbox items with different shape
  const threads: Thread[] = FALLBACK_THREADS;

  const filteredThreads = threads.filter(
    (t) =>
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.participant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedThread = threads.find((t) => t.id === selectedId) ?? threads[0];

  // Scroll to bottom of messages when thread changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedId]);

  const handleSend = () => {
    if (!reply.trim()) return;
    setReply('');
  };

  const handleSelectThread = (thread: Thread) => {
    setSelectedId(thread.id);
    setShowThread(true);
  };

  const unreadCount = threads.filter((t) => t.unread).length;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 7rem)' }}>
      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Communicate securely with your care team
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-xs rounded-full font-semibold">
                {unreadCount}
              </span>
            )}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Message</span>
        </button>
      </div>

      {/* Split panel */}
      <div className="flex-1 flex gap-3 sm:gap-4 min-h-0">
        {/* Thread list — full width on mobile when no thread selected */}
        <div
          className={`${
            showThread ? 'hidden md:flex' : 'flex'
          } flex-col w-full md:w-72 lg:w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden`}
        >
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Thread items */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {isLoading ? (
              <ThreadListSkeleton />
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <MessageSquare className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No messages found</p>
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => handleSelectThread(thread)}
                  className={`w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${
                    selectedThread?.id === thread.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-700">{getInitials(thread.participant)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-sm truncate ${thread.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {thread.participant}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{thread.lastTimestamp}</span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${thread.unread ? 'font-medium text-gray-800' : 'text-gray-500'}`}>
                      {thread.subject}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{thread.lastMessage}</p>
                  </div>
                  {thread.unread && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread detail — full width on mobile when thread selected */}
        <div
          className={`${
            showThread ? 'flex' : 'hidden md:flex'
          } flex-col flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0`}
        >
          {selectedThread ? (
            <>
              {/* Thread header */}
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center gap-3">
                <button
                  className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowThread(false)}
                  aria-label="Back to messages"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-700">
                    {getInitials(selectedThread.participant)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{selectedThread.participant}</p>
                  <p className="text-xs text-gray-500 truncate">{selectedThread.participantRole}</p>
                </div>
                <p className="text-xs text-gray-400 font-medium text-right hidden sm:block max-w-[140px] truncate">
                  {selectedThread.subject}
                </p>
              </div>

              {/* Subject line */}
              <div className="px-4 sm:px-5 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-600">Re: {selectedThread.subject}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {selectedThread.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 sm:gap-3 ${msg.sender === 'patient' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.sender === 'patient' ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      {msg.sender === 'patient' ? (
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      ) : (
                        <span className="text-xs font-bold text-slate-600">
                          {getInitials(msg.senderName)}
                        </span>
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] sm:max-w-[75%] flex flex-col gap-1 ${
                        msg.sender === 'patient' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <span className="text-xs font-medium text-gray-600">{msg.senderName}</span>
                      <div
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === 'patient'
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : 'bg-slate-100 text-gray-800 rounded-tl-sm'
                        }`}
                      >
                        {msg.body}
                      </div>
                      <span className="text-xs text-gray-400">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              <div className="px-3 sm:px-4 py-3 border-t border-gray-100 bg-gray-50">
                <div className="flex items-end gap-2">
                  <div className="flex-1 bg-white border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Type a secure message to your care team..."
                      rows={2}
                      className="w-full px-3 sm:px-4 pt-2.5 pb-1 text-sm focus:outline-none resize-none bg-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <div className="flex items-center justify-between px-3 pb-2">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Attach file">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-gray-400">Enter to send</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!reply.trim()}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-200 text-white rounded-xl transition-colors flex-shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                  <Lock className="w-3 h-3" />
                  Messages are encrypted and HIPAA-secure
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">Select a message to read</p>
              <p className="text-sm text-gray-400 mt-1">Choose a conversation from the list</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
