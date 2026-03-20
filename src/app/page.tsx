import Link from 'next/link';
import { SaaSMakerTestimonials, SaaSMakerChangelog } from '@/components/saasmaker-feedback';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* Gradient blobs */}
      <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-purple-600/15 blur-[128px]" />
      <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-blue-600/15 blur-[128px]" />

      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:py-32">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Your links.<br />Your story.<br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Your AI.</span>
        </h1>
        <p className="mt-6 text-base leading-8 text-gray-400 sm:text-lg">
          Create a beautiful personal page with all your links — and let visitors chat with an AI that knows everything about you.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href="/create"
            className="w-full rounded-xl bg-white px-8 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 sm:w-auto"
          >
            Start Your Profile
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            Log In
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Draft first. Login only when you want to claim your username and save.
        </p>
      </div>

      {/* Testimonials */}
      <div className="relative mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <h2 className="mb-8 text-center text-xl font-bold text-white sm:text-2xl">What people are saying</h2>
        <SaaSMakerTestimonials />
      </div>

      {/* Changelog */}
      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <h2 className="mb-8 text-center text-xl font-bold text-white sm:text-2xl">Changelog</h2>
        <SaaSMakerChangelog />
      </div>
    </div>
  );
}
