export default function FloatingCharacters() {
  return (
    <div className="floating-chars-container" aria-hidden="true">
      {/* Cute floating characters that pop in from edges */}
      <div className="floating-char fc-1">
        <div className="fc-bubble">Let's go! 💪</div>
        <span className="fc-emoji">🧑‍🚀</span>
      </div>
      <div className="floating-char fc-2">
        <span className="fc-emoji">🦊</span>
      </div>
      <div className="floating-char fc-3">
        <div className="fc-bubble">Stay strong!</div>
        <span className="fc-emoji">🐉</span>
      </div>
      <div className="floating-char fc-4">
        <span className="fc-emoji">🦉</span>
      </div>
      <div className="floating-char fc-5">
        <span className="fc-emoji">⚡</span>
      </div>
      <div className="floating-char fc-6">
        <div className="fc-bubble">Keep going!</div>
        <span className="fc-emoji">🐺</span>
      </div>
      <div className="floating-char fc-7">
        <span className="fc-emoji">🌟</span>
      </div>
      <div className="floating-char fc-8">
        <span className="fc-emoji">🎯</span>
      </div>
    </div>
  );
}
