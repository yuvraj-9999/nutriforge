import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineSparkles,
  HiOutlinePaperAirplane,
  HiOutlineRefresh,
  HiOutlineLightningBolt,
  HiOutlineHeart,
  HiOutlineClipboardList,
  HiOutlineEmojiSad,
} from "react-icons/hi";
import MainLayout from "../layouts/MainLayout";
import { getCoachHistory, sendMessageToCoach } from "../services/coach.service";

// ─── Grounded Mature Palette (matches DashboardPage exactly) ─────────────────
const C = {
  bg: "#131211",
  card: "#1B1A19",
  panel: "#22201F",
  accent: "#B2967D",
  accentHover: "#C3A58C",
  accentBg: "rgba(178, 150, 125, 0.12)",
  accentBorder: "rgba(178, 150, 125, 0.25)",
  text: "#F5F4F2",
  sub: "#9E9790",
  muted: "#5C5854",
  faint: "rgba(255, 255, 255, 0.03)",
  cardBorder: "rgba(255, 255, 255, 0.03)",
  cardShadow: "0 15px 35px rgba(0, 0, 0, 0.45), 0 1px 0 rgba(255, 255, 255, 0.01) inset",
  userBubble: "#B2967D",
  userBubbleText: "#131211",
  coachBubble: "#22201F",
  coachBubbleBorder: "rgba(255, 255, 255, 0.04)",
};

// ─── Quick Action Card Data ───────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    id: "review-plan",
    label: "Review My Plan",
    description: "Analyze my current nutrition and workout plan",
    icon: HiOutlineClipboardList,
    prompt: "Can you review my current nutrition and workout plan and give me specific feedback on what's working well and what I should improve?",
  },
  {
    id: "meal-ideas",
    label: "Meal Ideas",
    description: "Get fresh meal suggestions for today",
    icon: HiOutlineHeart,
    prompt: "Give me some creative and healthy meal ideas that align with my fitness goals. Include breakfast, lunch, dinner, and snack options.",
  },
  {
    id: "missed-workout",
    label: "Missed Workout",
    description: "Guidance when you skip a session",
    icon: HiOutlineEmojiSad,
    prompt: "I missed yesterday's workout session. How should I adjust my schedule and what can I do to recover without losing progress?",
  },
  {
    id: "protein-help",
    label: "Protein Help",
    description: "Tips to hit your daily protein target",
    icon: HiOutlineLightningBolt,
    prompt: "I'm struggling to hit my daily protein goal. What are the best high-protein foods and strategies to help me reach my target consistently?",
  },
];

// ─── Empty State Example Prompts ─────────────────────────────────────────────
const EXAMPLE_PROMPTS = [
  "How can I hit my protein goal?",
  "Review my plan",
  "I missed yesterday's workout",
  "Give me vegetarian meal ideas",
];

// ─── NutriForge Brand Mark (matches Navbar logo exactly) ─────────────────────
const CoachBrandMark = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9.5" stroke="#2D2C2A" strokeWidth="1.2" />
    <path
      d="M12 2.5C17.25 2.5 21.5 6.75 21.5 12C21.5 15.5 19.5 18.5 16.5 20.5"
      stroke="url(#coach-brand-grad)"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="2.5" r="1.2" fill="#B2967D" />
    <defs>
      <linearGradient id="coach-brand-grad" x1="12" y1="2.5" x2="16.5" y2="20.5" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F5F4F2" />
        <stop offset="50%" stopColor="#B2967D" />
        <stop offset="100%" stopColor="#1B1A19" stopOpacity="0.1" />
      </linearGradient>
    </defs>
  </svg>
);

// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <motion.div
    className="flex items-end gap-2 mb-2"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 4 }}
    transition={{ duration: 0.2 }}
  >
    {/* Coach Avatar */}
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5"
      style={{ background: C.panel, border: `1px solid ${C.accentBorder}` }}
    >
      <CoachBrandMark size={14} />
    </div>

    {/* Dots */}
    <div
      className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm"
      style={{
        background: C.coachBubble,
        border: `1px solid ${C.coachBubbleBorder}`,
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-1.5 h-1.5 rounded-full"
          style={{ background: C.sub }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.18,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  </motion.div>
);

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const SkeletonLoader = () => (
  <div className="max-w-[72rem] w-full mx-auto px-6 mt-8 flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <div className="h-7 w-48 animate-skeleton" />
      <div className="h-4 w-72 animate-skeleton" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 w-full animate-skeleton rounded-2xl" />
      ))}
    </div>
    <div className="h-[32rem] w-full animate-skeleton rounded-2xl" />
  </div>
);

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ message, index }) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      className={`flex items-end gap-2 mb-2 ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut", delay: index * 0.03 }}
    >
      {/* Coach Avatar (left messages only) */}
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5"
          style={{ background: C.panel, border: `1px solid ${C.accentBorder}` }}
        >
          <CoachBrandMark size={14} />
        </div>
      )}

      {/* Bubble */}
      <div
        className="max-w-[75%] sm:max-w-[65%] px-4 py-3 text-[13.5px] leading-relaxed font-sans whitespace-pre-wrap break-words"
        style={
          isUser
            ? {
                background: C.userBubble,
                color: C.userBubbleText,
                borderRadius: "1rem 1rem 0.25rem 1rem",
                boxShadow: "0 4px 16px rgba(178, 150, 125, 0.15)",
                fontWeight: 500,
              }
            : {
                background: C.coachBubble,
                color: C.text,
                borderRadius: "1rem 1rem 1rem 0.25rem",
                border: `1px solid ${C.coachBubbleBorder}`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              }
        }
      >
        {message.content}
      </div>

      {/* User Avatar (right messages only) */}
      {isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5 text-[10px] font-bold"
          style={{
            background: "rgba(178, 150, 125, 0.15)",
            border: `1px solid ${C.accentBorder}`,
            color: C.accent,
          }}
        >
          U
        </div>
      )}
    </motion.div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// CoachPage
// ═════════════════════════════════════════════════════════════════════════════
const CoachPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const MAX_CHARS = 1000;

  // ── Auto-scroll to latest message ────────────────────────────────────────
  const scrollToBottom = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending, scrollToBottom]);

  // ── Load conversation history on mount ───────────────────────────────────
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getCoachHistory();
        const history = data?.history || data?.messages || [];
        setMessages(history);
      } catch (err) {
        console.error("Failed to load coach conversation history", err);
        setMessages([]);
      } finally {
        setLoading(false);
        // Give DOM a moment to render before scrolling
        setTimeout(() => scrollToBottom("instant"), 80);
      }
    };
    loadHistory();
  }, [scrollToBottom]);

  // ── Send Message ──────────────────────────────────────────────────────────
  const handleSend = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || sending) return;

    const userMessage = { role: "user", content: text };

    // Optimistic update
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await sendMessageToCoach(text);
      const assistantContent =
        res?.coachReply || res?.reply || res?.message || res?.content || "I'm here to help you on your fitness journey!";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantContent },
      ]);
    } catch (err) {
      console.error("Failed to send message to coach", err);
      const statusCode = err?.response?.status;
      const backendMsg = err?.response?.data?.message;

      let errorContent = "Something went wrong. Please try again.";
      if (statusCode === 429) {
        errorContent = backendMsg || "You've reached the message limit. Please wait a moment before sending again.";
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorContent },
      ]);
    } finally {
      setSending(false);
    }
  };

  // ── Keyboard handler ──────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Auto-resize textarea ──────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.length > MAX_CHARS) return;
    setInput(val);

    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 144)}px`;
    }
  };

  const isSendDisabled = sending || !input.trim();
  const charCount = input.length;
  const charWarning = charCount > MAX_CHARS * 0.85;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <MainLayout>
      {/* ── Loading Skeleton ── */}
      {loading && <SkeletonLoader />}

      {/* ── Page Content ── */}
      {!loading && (
        <main className="max-w-[72rem] w-full mx-auto px-4 sm:px-6 mt-8 pb-6 flex-1 flex flex-col gap-6 relative text-left">

          {/* ── 1. Header Section ──────────────────────────────────────────── */}
          <section className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-[26px] font-bold tracking-tight font-sans" style={{ color: C.text }}>
                NutriForge Coach
              </h1>
              {/* AI Badge */}
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono"
                style={{
                  background: C.accentBg,
                  color: C.accent,
                  border: `1px solid ${C.accentBorder}`,
                }}
              >
                <HiOutlineSparkles size={11} />
                AI Coach
              </span>
            </div>
            <p className="text-[13px] font-sans" style={{ color: C.sub }}>
              Your AI fitness and nutrition mentor.
            </p>
          </section>

          {/* ── 2. Quick Action Cards ──────────────────────────────────────── */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  id={`quick-action-${action.id}`}
                  aria-label={action.label}
                  onClick={() => handleSend(action.prompt)}
                  disabled={sending}
                  className="flex flex-col gap-2.5 p-4 rounded-2xl text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border"
                  style={{
                    background: C.card,
                    borderColor: C.cardBorder,
                    boxShadow: C.cardShadow,
                  }}
                  whileHover={!sending ? { y: -2, scale: 1.01 } : {}}
                  whileTap={!sending ? { scale: 0.98 } : {}}
                  onMouseEnter={(e) => {
                    if (sending) return;
                    e.currentTarget.style.borderColor = C.accentBorder;
                    e.currentTarget.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.45), 0 0 0 1px ${C.accentBorder}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.cardBorder;
                    e.currentTarget.style.boxShadow = C.cardShadow;
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: C.accentBg, color: C.accent }}
                  >
                    <Icon size={17} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12.5px] font-bold font-sans" style={{ color: C.text }}>
                      {action.label}
                    </span>
                    <span className="text-[11px] font-sans leading-snug" style={{ color: C.sub }}>
                      {action.description}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </section>

          {/* ── 3. Main Chat Container ─────────────────────────────────────── */}
          <div
            className="flex flex-col rounded-2xl border overflow-hidden flex-1 min-h-0"
            style={{
              background: C.card,
              borderColor: C.cardBorder,
              boxShadow: C.cardShadow,
              minHeight: "28rem",
            }}
          >
            {/* Chat Header */}
            <div
              className="px-5 py-4 flex items-center justify-between border-b shrink-0"
              style={{ borderColor: C.faint }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: C.accentBg, border: `1px solid ${C.accentBorder}` }}
                >
                  <CoachBrandMark size={17} />
                </div>
                <div>
                  <p className="text-[13.5px] font-bold font-sans" style={{ color: C.text }}>
                    NutriForge AI
                  </p>
                  <p className="text-[11px] font-sans flex items-center gap-1.5" style={{ color: C.sub }}>
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: "#5fbe8a" }}
                    />
                    Active — ready to help
                  </p>
                </div>
              </div>

              {/* Clear / reload hint */}
              <button
                aria-label="Reload conversation history"
                onClick={async () => {
                  setLoading(true);
                  try {
                    const data = await getCoachHistory();
                    const history = data?.history || data?.messages || [];
                    setMessages(history);
                  } catch {
                    /* silent */
                  } finally {
                    setLoading(false);
                  }
                }}
                className="p-2 rounded-lg transition-colors duration-150 cursor-pointer"
                style={{ color: C.muted }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.sub)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
                title="Reload conversation"
              >
                <HiOutlineRefresh size={16} />
              </button>
            </div>

            {/* ── 4. Messages Area ───────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5" style={{ minHeight: 0 }}>

              {/* ── 5. Empty State ─────────────────────────────────────────── */}
              <AnimatePresence>
                {messages.length === 0 && !sending && (
                  <motion.div
                    className="flex flex-col items-center justify-center h-full min-h-[16rem] gap-6 py-8"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{
                        background: C.accentBg,
                        border: `1px solid ${C.accentBorder}`,
                        boxShadow: "0 8px 24px rgba(178, 150, 125, 0.08)",
                      }}
                    >
                      <CoachBrandMark size={32} />
                    </div>

                    {/* Welcome text */}
                    <div className="flex flex-col gap-2 text-center max-w-sm">
                      <h2 className="text-[17px] font-bold font-sans" style={{ color: C.text }}>
                        Your AI Coach is ready
                      </h2>
                      <p className="text-[13px] font-sans leading-relaxed" style={{ color: C.sub }}>
                        Ask me anything about nutrition, workouts, or recovery. I&apos;m here to keep you on track.
                      </p>
                    </div>

                    {/* Example prompts */}
                    <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                      {EXAMPLE_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => handleSend(prompt)}
                          disabled={sending}
                          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold font-sans transition-all duration-150 cursor-pointer border"
                          style={{
                            background: C.panel,
                            color: C.sub,
                            borderColor: C.cardBorder,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = C.accent;
                            e.currentTarget.style.borderColor = C.accentBorder;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = C.sub;
                            e.currentTarget.style.borderColor = C.cardBorder;
                          }}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rendered Messages */}
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <MessageBubble key={`${msg.role}-${i}`} message={msg} index={i} />
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              <AnimatePresence>
                {sending && <TypingIndicator />}
              </AnimatePresence>

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* ── 6. Input Area ──────────────────────────────────────────── */}
            <div
              className="shrink-0 border-t px-4 sm:px-5 py-4"
              style={{ borderColor: C.faint, background: C.card }}
            >
              <div
                className="flex items-end gap-3 rounded-xl px-4 py-3 border transition-all duration-150"
                style={{
                  background: C.panel,
                  borderColor: sending ? C.accentBorder : "rgba(255,255,255,0.05)",
                  boxShadow: sending ? `0 0 0 1px ${C.accentBorder}` : "none",
                }}
              >
                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  id="coach-message-input"
                  aria-label="Message NutriForge Coach"
                  rows={1}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your coach anything…"
                  disabled={sending}
                  className="flex-1 resize-none bg-transparent border-none outline-none text-[13.5px] font-sans leading-relaxed disabled:opacity-50"
                  style={{
                    color: C.text,
                    minHeight: "24px",
                    maxHeight: "144px",
                    overflowY: "auto",
                    caretColor: C.accent,
                  }}
                />

                {/* Right controls */}
                <div className="flex items-center gap-3 shrink-0 pb-0.5">
                  {/* Character limit */}
                  {charCount > 0 && (
                    <span
                      className="text-[10px] font-mono font-semibold tabular-nums"
                      style={{ color: charWarning ? "#D26E64" : C.muted }}
                    >
                      {charCount}/{MAX_CHARS}
                    </span>
                  )}

                  {/* Send Button */}
                  <motion.button
                    id="coach-send-button"
                    aria-label="Send message"
                    onClick={() => handleSend()}
                    disabled={isSendDisabled}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: isSendDisabled ? "rgba(178,150,125,0.08)" : C.accent,
                      color: isSendDisabled ? C.muted : C.bg,
                      boxShadow: isSendDisabled ? "none" : "0 4px 12px rgba(178, 150, 125, 0.3)",
                    }}
                    whileHover={!isSendDisabled ? { scale: 1.06 } : {}}
                    whileTap={!isSendDisabled ? { scale: 0.93 } : {}}
                  >
                    {sending ? (
                      <svg
                        className="animate-spin"
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          cx="7.5"
                          cy="7.5"
                          r="5.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeOpacity="0.3"
                        />
                        <path
                          d="M13 7.5a5.5 5.5 0 01-5.5 5.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <HiOutlinePaperAirplane size={16} style={{ transform: "rotate(90deg)" }} />
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Keyboard hint */}
              <p className="mt-2 text-[10.5px] font-sans text-center" style={{ color: C.muted }}>
                Press <kbd className="font-mono px-1 py-0.5 rounded text-[10px]" style={{ background: "rgba(255,255,255,0.04)", color: C.sub }}>Enter</kbd> to send
                &nbsp;·&nbsp;
                <kbd className="font-mono px-1 py-0.5 rounded text-[10px]" style={{ background: "rgba(255,255,255,0.04)", color: C.sub }}>Shift + Enter</kbd> for new line
              </p>
            </div>
          </div>

        </main>
      )}
    </MainLayout>
  );
};

export default CoachPage;
