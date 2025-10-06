import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>

          <p className="text-gray-600 text-lg mb-6">
            Welcome to All4Ruse! We&apos;re building something amazing with
            Next.js and Supabase.
          </p>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">
              Our Mission
            </h2>
            <p className="text-blue-700">
              To create innovative solutions that bring people together through
              technology.
            </p>
          </div>

          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
