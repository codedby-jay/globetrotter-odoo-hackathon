export default function AssistantMessage({ role, text, mode }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[90%] rounded-2xl px-4 py-3 text-sm",
          isUser ? "bg-teal text-white" : "gt-card",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap">{text}</p>
        {!isUser && mode === "smart_analysis" ? (
          <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Smart analysis
          </p>
        ) : null}
      </div>
    </div>
  );
}
