import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Phil Laney</h1>
        <p className="text-gray-500 mb-12">Personal apps &amp; projects.</p>

        <div className="space-y-3">
          <a
            href="https://invites.philiplaney.com"
            className="flex items-center justify-between w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-5 py-4 transition-colors group"
          >
            <div>
              <div className="font-semibold text-gray-900">Party Invites 🎉</div>
              <div className="text-sm text-gray-500">Magical party invites &amp; RSVPs</div>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600 text-lg">→</span>
          </a>

          <a
            href="https://everbound.philiplaney.com"
            className="flex items-center justify-between w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-5 py-4 transition-colors group"
          >
            <div>
              <div className="font-semibold text-gray-900">Everbound 📖</div>
              <div className="text-sm text-gray-500">Magical personalised storybooks</div>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600 text-lg">→</span>
          </a>

          <a
            href="https://cards.philiplaney.com"
            className="flex items-center justify-between w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-5 py-4 transition-colors group"
          >
            <div>
              <div className="font-semibold text-gray-900">Card Coach 💳</div>
              <div className="text-sm text-gray-500">Best card to use &amp; which to get next</div>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600 text-lg">→</span>
          </a>

          <Link
            href="/trip"
            className="flex items-center justify-between w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-5 py-4 transition-colors group"
          >
            <div>
              <div className="font-semibold text-gray-900">Trip Expenses Tracker</div>
              <div className="text-sm text-gray-500">Seattle Trip · May–Jun 2026</div>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600 text-lg">→</span>
          </Link>

          <a
            href="/IQ"
            className="flex items-center justify-between w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-5 py-4 transition-colors group"
          >
            <div>
              <div className="font-semibold text-gray-900">IQ UK Homes 🏡</div>
              <div className="text-sm text-gray-500">London property portfolio</div>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600 text-lg">→</span>
          </a>
        </div>
      </div>
    </main>
  );
}
