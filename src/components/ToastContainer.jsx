import { useGameState } from '../context/GameContext';

export default function ToastContainer() {
  const { toasts } = useGameState();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
