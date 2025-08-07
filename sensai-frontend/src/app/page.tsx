// src/app/page.tsx
import Image from "next/image";
import Link from "next/link";

// Render as a static server component so nothing “loads” first
export const dynamic = "force-static";

export default function Landing() {
  return (
    <main className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-2xl p-10 shadow-2xl bg-black/70 backdrop-blur-lg border border-purple-500/20">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/sensai-logo.svg"
            alt="SensAI Logo"
            width={220}
            height={72}
            priority
            className="w-[180px] md:w-[220px] h-auto"
          />
        </div>

        {/* Title + subtitle */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-light leading-tight">
            Skill <span className="text-purple-400">Radar</span>
          </h1>
          <p className="text-gray-300 text-lg mt-4">
            Evidence‑driven hiring dashboard — visual skills + one‑click drill‑downs.
          </p>
        </div>

        {/* Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* 🔁 Route to role selection first */}
          <Link
            href="/role-select"
            className="text-center px-6 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 transition transform hover:scale-[1.02] font-semibold"
          >
            Open Skill Radar
          </Link>

          <a
            href="https://sensai.hyperverge.org/school/first-principles/join?cohortId=89"
            target="_blank"
            rel="noreferrer"
            className="text-center px-6 py-4 rounded-xl bg-[#1a1a1a] hover:bg-[#222] transition transform hover:scale-[1.02] text-gray-200"
          >
            Try a demo
          </a>
        </div>

        {/* Secondary links */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="inline-block text-sm text-gray-300 hover:text-white underline/20 hover:underline"
          >
            Sign in with Google
          </Link>
        </div>

        {/* Legal */}
        <p className="text-center text-xs text-gray-500 mt-8">
          By continuing, you agree to the{" "}
          <a
            className="text-purple-400 hover:underline"
            href="https://hyperverge.notion.site/SensAI-Terms-of-Use-1627e7c237cb80dc9bd2dac685d42f31?pvs=73"
            target="_blank"
            rel="noreferrer"
          >
            Terms & Conditions
          </a>{" "}
          and{" "}
          <a
            className="text-purple-400 hover:underline"
            href="https://hyperverge.notion.site/SensAI-Privacy-Policy-1627e7c237cb80e5babae67e64642f27"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </a>.
        </p>
      </div>
    </main>
  );
}
