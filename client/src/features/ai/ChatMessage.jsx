export default function ChatMessage({ role, text, source }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm",
          isUser ? "bg-teal text-white" : "border border-sand bg-white text-ink",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap">{text}</p>
        {!isUser && source === "smart_analysis" ? (
          <p className="mt-2 text-xs text-muted">Smart analysis</p>
        ) : null}
      </div>
    </div>
  );
}
