"use client";

import { useState } from "react";

const STEPS = [
  {
    emoji: "👋",
    title: "Welcome to the trip!",
    body: "This is where we're tracking everything we spent in Seattle and figuring out who owes what at the end.",
  },
  {
    emoji: "☑️",
    title: "Check in to split an expense",
    body: "Each row has a checkbox for each person. Check yours to say you shared that cost — uncheck it if something wasn't yours. Your share is shown below the checkbox.",
  },
  {
    emoji: "💳",
    title: "Who paid?",
    body: "The coloured pill on each row shows who actually put it on their card. Tap it to change it if it's wrong.",
  },
  {
    emoji: "➕",
    title: "Add your own expenses",
    body: "If you paid for something that isn't on the list, tap + Add in the top right. Enter what it was, how much, who paid, and who's splitting it.",
  },
  {
    emoji: "💰",
    title: "See who owes what",
    body: "The cards at the top of the page update live as you check things off. That's the final word on who pays whom.",
  },
];

interface Props {
  name?: string;
  onDone: () => void;
}

export default function OnboardingModal({ name, onDone }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const next = () => {
    if (isLast) {
      onDone();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-blue-500" : "w-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="px-8 py-6 text-center">
          <div className="text-5xl mb-4">{current.emoji}</div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {step === 0 && name ? `Hey ${name}!` : current.title}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {step === 0 && name ? current.body : current.body}
          </p>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Back
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            {isLast ? "Got it, let's go!" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
