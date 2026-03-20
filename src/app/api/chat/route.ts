import { NextRequest, NextResponse } from "next/server";
import { Agent, Runner, OpenAIChatCompletionsModel, tool } from "@openai/agents";
import { z } from "zod";
import OpenAI from "openai";
import { adminDb } from "@/firebase/firebaseAdmin";

// Gemini via OpenAI-compatible API
const geminiClient = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const geminiModel = new OpenAIChatCompletionsModel(geminiClient, "gemini-2.5-flash");

const runner = new Runner({
  modelProvider: geminiClient as never,
  model: geminiModel,
  tracingDisabled: true,
});

const CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Education",
  "Investments",
  "Luxuries",
  "Other",
] as const;

function getMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const start = `${year}-${month}-01`;
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const end = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

function createAgentTools(userId: string) {
  return [
    tool({
      name: "list_expenses",
      description:
        "List all expenses for the current month. Use this when the user asks to see, show, or list their expenses.",
      parameters: z.object({}),
      execute: async () => {
        const { start, end } = getMonthRange();
        const snap = await adminDb
          .collection("users")
          .doc(userId)
          .collection("expenses")
          .where("date", ">=", start)
          .where("date", "<=", end)
          .orderBy("date", "desc")
          .get();

        if (snap.empty) return "No expenses found for this month.";

        const expenses = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return JSON.stringify(expenses);
      },
    }),

    tool({
      name: "add_expense",
      description:
        "Add a new expense. Use this when the user wants to add or record an expense.",
      parameters: z.object({
        title: z.string().describe("Expense title or description"),
        amount: z.number().positive().describe("Amount spent (number only)"),
        category: z.enum(CATEGORIES).describe("Infer automatically from the title — never ask the user"),
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe("Date in YYYY-MM-DD format"),
        note: z.string().describe("Additional note, use empty string if none"),
      }),
      execute: async ({ title, amount, category, date, note }) => {
        const ref = await adminDb
          .collection("users")
          .doc(userId)
          .collection("expenses")
          .add({ title, amount, category, date, note });
        return `Added: "${title}" — ${amount} (${category}) on ${date}. ID: ${ref.id}`;
      },
    }),

    tool({
      name: "update_expense",
      description:
        "Update an existing expense. The user provides the expense name/title — find it automatically by searching current month expenses, then update it. Pass only the fields to change as a JSON string.",
      parameters: z.object({
        titleOrId: z
          .string()
          .describe("The expense title/name the user mentioned, or a Firestore document ID"),
        updates: z
          .string()
          .describe(
            'JSON string of fields to update. Example: {"amount":200} or {"category":"Food","note":"lunch"}'
          ),
      }),
      execute: async ({ titleOrId, updates }) => {
        let data: Record<string, unknown>;
        try {
          data = JSON.parse(updates);
        } catch {
          return "Invalid updates format.";
        }
        if (Object.keys(data).length === 0) return "No changes provided.";

        // Try to find by title first
        const { start, end } = getMonthRange();
        const snap = await adminDb
          .collection("users")
          .doc(userId)
          .collection("expenses")
          .where("date", ">=", start)
          .where("date", "<=", end)
          .get();

        const docs = snap.docs;
        // Match by title (case-insensitive) or exact ID
        const match =
          docs.find((d) => d.id === titleOrId) ??
          docs.find((d) =>
            (d.data().title as string)?.toLowerCase().includes(titleOrId.toLowerCase())
          );

        if (!match) return `No expense found matching "${titleOrId}". Ask the user to clarify.`;

        await adminDb
          .collection("users")
          .doc(userId)
          .collection("expenses")
          .doc(match.id)
          .update(data);

        return `Updated "${match.data().title}" successfully.`;
      },
    }),

    tool({
      name: "delete_expense",
      description:
        "Delete an expense. The user provides the expense name/title — find it automatically by searching current month expenses, then delete it.",
      parameters: z.object({
        titleOrId: z
          .string()
          .describe("The expense title/name the user mentioned, or a Firestore document ID"),
      }),
      execute: async ({ titleOrId }) => {
        const { start, end } = getMonthRange();
        const snap = await adminDb
          .collection("users")
          .doc(userId)
          .collection("expenses")
          .where("date", ">=", start)
          .where("date", "<=", end)
          .get();

        const docs = snap.docs;
        const match =
          docs.find((d) => d.id === titleOrId) ??
          docs.find((d) =>
            (d.data().title as string)?.toLowerCase().includes(titleOrId.toLowerCase())
          );

        if (!match) return `No expense found matching "${titleOrId}". Ask the user to clarify.`;

        await adminDb
          .collection("users")
          .doc(userId)
          .collection("expenses")
          .doc(match.id)
          .delete();

        return `Deleted "${match.data().title}" successfully.`;
      },
    }),

    tool({
      name: "get_income_summary",
      description:
        "Get the user's total income, total spent this month, and remaining balance. Use when the user asks about income, balance, remaining money, kitna bacha, or how much they've spent.",
      parameters: z.object({}),
      execute: async () => {
        // Fetch income from user document
        const userDoc = await adminDb.collection("users").doc(userId).get();
        const totalIncome: number = userDoc.exists ? (userDoc.data()?.totalIncome ?? 0) : 0;

        // Fetch total spent this month
        const { start, end } = getMonthRange();
        const snap = await adminDb
          .collection("users")
          .doc(userId)
          .collection("expenses")
          .where("date", ">=", start)
          .where("date", "<=", end)
          .get();

        const totalSpent = snap.docs.reduce(
          (sum, d) => sum + ((d.data().amount as number) ?? 0),
          0
        );
        const remaining = totalIncome - totalSpent;

        return JSON.stringify({ totalIncome, totalSpent, remaining });
      },
    }),
  ];
}

export async function POST(req: NextRequest) {
  try {
    const { message, history, userId } = await req.json();

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().split("T")[0];

    const agent = new Agent({
      name: "Expense Assistant",
      model: geminiModel,
      instructions: `You are a helpful expense tracking assistant embedded in an expense tracker app.
Today's date is ${today}. Use this as the default date when none is specified.

You can help users:
- List/view their current month expenses
- Add new expenses
- Update existing expenses — use the expense name/title the user provides, DO NOT ask for an ID
- Delete expenses — use the expense name/title the user provides, DO NOT ask for an ID
- Check income summary — total income, total spent this month, and remaining balance

Available categories: Food, Transport, Bills, Education, Investments, Luxuries, Other.

IMPORTANT rules:
- When updating or deleting, pass the expense name/title directly as "titleOrId" — the tool will find the correct expense automatically.
- NEVER ask the user for an expense ID. Always use the name they mentioned.
- If no date is given, use today (${today}).
- Be concise, friendly, and confirm every action clearly.
- When listing, format each expense as: title — amount (category) on date.

Category auto-detection — NEVER ask the user for a category, always infer it yourself:
- Food: restaurants, fast food, groceries, cafe, burger, pizza, biryani, chai, lunch, dinner, breakfast, shawarma, zinger, mcdonalds, kfc, eat, drink, snack, fruit, vegetable
- Transport: uber, careem, taxi, fuel, petrol, bus, rickshaw, metro, parking, car, bike, ride
- Bills: electricity, gas, water, internet, phone, rent, wifi, broadband, utility, mobile bill, recharge
- Education: books, course, school, university, college, fee, tuition, stationery, copy, pen
- Investments: stocks, crypto, mutual fund, saving, investment, shares, gold
- Luxuries: netflix, spotify, amazon, shopping, clothes, shoes, game, cinema, movie, salon, gym, perfume, watch, gift, entertainment, subscription
- Other: anything that doesn't clearly fit above

Use context clues from the title to pick the best category automatically.`,
      tools: createAgentTools(userId),
    });

    // Build history context string and append to message
    const recentHistory = (history ?? []).slice(-8) as { role: string; content: string }[];
    const historyText =
      recentHistory.length > 0
        ? recentHistory.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n") + "\nUser: " + message
        : message;

    const result = await runner.run(agent, historyText);
    return NextResponse.json({ reply: result.finalOutput });
  } catch (err) {
    console.error("[chat/route]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
