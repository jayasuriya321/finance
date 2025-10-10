export default function Loader({ size = 12, color = "blue-600", message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-60 space-y-2">
      <div
        className={`animate-spin rounded-full border-4 border-t-transparent h-${size} w-${size} border-${color}`}
      ></div>
      {message && <span className="text-gray-600 text-sm font-medium">{message}</span>}
    </div>
  );
}
