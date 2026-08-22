export default function AssistantMessage({ role, text, mode }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm",
          isUser ? "bg-teal text-white" : "border border-sand bg-white",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap">{text}</p>
        {!isUser && mode === "smart_analysis" ? (
          <p className="mt-2 text-xs uppercase tracking-wide text-muted">Smart analysis mode</p>
        ) : null}
      </div>
    </div>
  );
}
