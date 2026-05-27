export default function PracticeNotFoundPage({ message }) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">
          Practice set not found
        </h1>

        <p className="mt-2 text-slate-500">
          This link may be incorrect, private, or the set could not be loaded.
        </p>

        {message && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}