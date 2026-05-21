interface ChatBubbleProps {
  id: string;
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export default function ChatBubble({ id, message, isUser, timestamp }: ChatBubbleProps) {
  return (
    <div
      id={id}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-fade-in-up`}
    >
      <div className={`max-w-[80%] sm:max-w-[70%] ${isUser ? "order-2" : ""}`}>
        <div
          className={`
            rounded-2xl px-4 py-3 text-sm leading-relaxed
            ${isUser
              ? "bg-gradient-to-br from-primary to-primary-dark text-white rounded-br-md"
              : "glass text-white/90 rounded-bl-md"
            }
          `}
        >
          {message}
        </div>
        {timestamp && (
          <p className={`text-[11px] text-muted mt-1.5 ${isUser ? "text-right" : "text-left"}`}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="glass rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 items-center">
        <span
          className="w-2 h-2 rounded-full bg-muted"
          style={{ animation: "typing-dot 1.4s ease-in-out infinite", animationDelay: "0s" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-muted"
          style={{ animation: "typing-dot 1.4s ease-in-out infinite", animationDelay: "0.2s" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-muted"
          style={{ animation: "typing-dot 1.4s ease-in-out infinite", animationDelay: "0.4s" }}
        />
      </div>
    </div>
  );
}
