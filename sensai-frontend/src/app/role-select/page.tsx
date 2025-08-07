"use client";

import { useRouter } from "next/navigation";

export default function RoleSelect() {
  const router = useRouter();

  const handleRecruiterClick = () => {
    router.push("/dashboard?role=recruiter");
  };

  const handleCandidateClick = () => {
    router.push("/dashboard?role=candidate");
  };

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl p-8 md:p-10 shadow-2xl bg-black/70 backdrop-blur-lg border border-purple-500/20">
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-400"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Skill Radar
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Evidence-Driven Hiring Dashboard
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleRecruiterClick}
            className="w-full flex items-center justify-center p-4 bg-purple-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:bg-purple-700 shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-3"
            >
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 00-3-3.87"></path>
              <path d="M16 3.13a4 4 0 010 7.75"></path>
            </svg>
            I am a Recruiter
          </button>

          <button
            onClick={handleCandidateClick}
            className="w-full flex items-center justify-center p-4 bg-gray-800 text-gray-200 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:bg-gray-700 shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-3"
            >
              <path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            I am a Candidate
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500 px-4">
          <p>
            By continuing, you acknowledge that you understand and agree to the{" "}
            <a href="#" className="text-purple-400 hover:underline">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-purple-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
