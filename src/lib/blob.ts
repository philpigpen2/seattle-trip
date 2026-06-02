import { ExpenseData } from "./types";

const GIST_ID = process.env.GIST_ID!;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const FILE_NAME = "expenses.json";

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
  "Content-Type": "application/json",
};

export async function readExpenses(): Promise<ExpenseData> {
  if (!GIST_ID || !GITHUB_TOKEN) return getDefaultData();
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return getDefaultData();
    const gist = await res.json();
    const raw = gist.files?.[FILE_NAME]?.content;
    if (!raw) return getDefaultData();
    return JSON.parse(raw);
  } catch {
    return getDefaultData();
  }
}

export async function writeExpenses(data: ExpenseData): Promise<void> {
  await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      files: { [FILE_NAME]: { content: JSON.stringify(data, null, 2) } },
    }),
  });
}

function getDefaultData(): ExpenseData {
  return {
    participants: ["Phil", "Matt", "Gaz"],
    expenses: [],
  };
}
