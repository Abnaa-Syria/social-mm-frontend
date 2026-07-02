export default function LoadingState({ message = 'جاري التحميل...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-3 border-blue-200 border-t-[#1E3A8A] rounded-full animate-spin mb-4" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
