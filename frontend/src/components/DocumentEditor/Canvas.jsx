// Canvas foi removido - usando Element direto no index.jsx
// Este arquivo pode ser removido ou mantido como placeholder

export default function Canvas({ children }) {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white shadow min-h-[700px] p-6">
      {children}
    </div>
  );
}
