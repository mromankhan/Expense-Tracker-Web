import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  FunctionDeclaration,
  SchemaType,
  Content,
} from "@google/generative-ai";
import { adminDb, adminAuth } from "@/firebase/firebaseAdmin";

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Education",
  "Investments",
  "Luxuries",
  "Other",
];

function getMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const start = `${year}-${month}-01`;
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const end = `${year}-${month}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

// ── Tool declarations ────────────────────────────────────────────────────────

const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "list_expenses",
    description:
      "List all expenses for the current month. Use when user asks to see, show, or list expenses.",
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
  {
    name: "add_expense",
    description: "Add a new expense. Use when user wants to add or record an expense.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: "Expense title or description" },
        amount: { type: SchemaType.NUMBER, description: "Amount spent (number only)" },
        category: {
          type: SchemaType.STRING,
          format: "enum",
          enum: CATEGORIES,
          description: "Infer automatically from the title — never ask the user",
        },
        date: {
          type: SchemaType.STRING,
          description: "Date in YYYY-MM-DD format. Default to today if not specified.",
        },
        note: { type: SchemaType.STRING, description: "Additional note, empty string if none" },
      },
      required: ["title", "amount", "category", "date", "note"],
    },
  },
  {
    name: "update_expense",
    description:
      "Update an existing expense. Find it by title from current month, then update the specified fields.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        titleOrId: {
          type: SchemaType.STRING,
          description: "The expense title/name the user mentioned, or Firestore document ID",
        },
        updates: {
          type: SchemaType.STRING,
          description:
            'JSON string of fields to update. Example: {"amount":200} or {"category":"Food"}',
        },
      },
      required: ["titleOrId", "updates"],
    },
  },
  {
    name: "delete_expense",
    description:
      "Delete an expense. Find it by title from current month, then delete it.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        titleOrId: {
          type: SchemaType.STRING,
          description: "The expense title/name the user mentioned, or Firestore document ID",
        },
      },
      required: ["titleOrId"],
    },
  },
  {
    name: "set_income",
    description:
      "Set or update the user's monthly income. Use when user says set income, update income, meri income X hai, etc.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        amount: { type: SchemaType.NUMBER, description: "The new monthly income amount" },
      },
      required: ["amount"],
    },
  },
  {
    name: "get_income_summary",
    description:
      "Get the user's total income, total spent this month, and remaining balance. Use when user asks about income, balance, kitna bacha, or how much spent.",
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
];

// ── Tool executors ───────────────────────────────────────────────────────────

async function executeTool(
  name: string,
  args: Record<string, unknown>,
  userId: string
): Promise<string> {
  const { start, end } = getMonthRange();
  const expensesRef = adminDb.collection("users").doc(userId).collection("expenses");

  switch (name) {
    case "list_expenses": {
      const snap = await expensesRef
        .where("date", ">=", start)
        .where("date", "<=", end)
        .orderBy("date", "desc")
        .get();
      if (snap.empty) return "No expenses found for this month.";
      return JSON.stringify(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }

    case "add_expense": {
      const { title, amount, category, date, note } = args as {
        title: string;
        amount: number;
        category: string;
        date: string;
        note: string;
      };
      const ref = await expensesRef.add({ title, amount, category, date, note });
      return `Added: "${title}" — ${amount} (${category}) on ${date}. ID: ${ref.id}`;
    }

    case "update_expense": {
      const { titleOrId, updates } = args as { titleOrId: string; updates: string };
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(updates);
      } catch {
        return "Invalid updates format.";
      }
      if (Object.keys(data).length === 0) return "No changes provided.";

      const snap = await expensesRef
        .where("date", ">=", start)
        .where("date", "<=", end)
        .get();
      const match =
        snap.docs.find((d) => d.id === titleOrId) ??
        snap.docs.find((d) =>
          (d.data().title as string)?.toLowerCase().includes(titleOrId.toLowerCase())
        );
      if (!match) return `No expense found matching "${titleOrId}". Ask the user to clarify.`;

      await expensesRef.doc(match.id).update(data);
      return `Updated "${match.data().title}" successfully.`;
    }

    case "delete_expense": {
      const { titleOrId } = args as { titleOrId: string };
      const snap = await expensesRef
        .where("date", ">=", start)
        .where("date", "<=", end)
        .get();
      const match =
        snap.docs.find((d) => d.id === titleOrId) ??
        snap.docs.find((d) =>
          (d.data().title as string)?.toLowerCase().includes(titleOrId.toLowerCase())
        );
      if (!match) return `No expense found matching "${titleOrId}". Ask the user to clarify.`;

      await expensesRef.doc(match.id).delete();
      return `Deleted "${match.data().title}" successfully.`;
    }

    case "set_income": {
      const { amount } = args as { amount: number };
      await adminDb
        .collection("users")
        .doc(userId)
        .set({ totalIncome: amount }, { merge: true });
      return `Monthly income updated to ${amount} successfully.`;
    }

    case "get_income_summary": {
      const userDoc = await adminDb.collection("users").doc(userId).get();
      const totalIncome: number = userDoc.exists ? (userDoc.data()?.totalIncome ?? 0) : 0;
      const snap = await expensesRef
        .where("date", ">=", start)
        .where("date", "<=", end)
        .get();
      const totalSpent = snap.docs.reduce(
        (sum, d) => sum + ((d.data().amount as number) ?? 0),
        0
      );
      return JSON.stringify({ totalIncome, totalSpent, remaining: totalIncome - totalSpent });
    }

    default:
      return "Unknown tool.";
  }
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { message, history, token } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      userId = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().split("T")[0];

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: `You are a concise expense assistant. Today: ${today}. Default date = today.
Tools: list, add, update, delete expenses; set income; get income summary.
Rules: never ask for ID (find by title); infer category from title; be concise; confirm actions briefly.
Categories: Food(eat/drink/restaurant/burger/pizza/biryani/chai/kfc), Transport(uber/careem/fuel/petrol/bus/rickshaw), Bills(electricity/gas/rent/internet/phone), Education(books/course/fee/tuition), Investments(stocks/crypto/gold/saving), Luxuries(netflix/shopping/clothes/cinema/gym/salon), Other.
List format: title — amount (category) on date.`,
      tools: [{ functionDeclarations: toolDeclarations }],
    });

    // Build chat history — Gemini requires history to start with a 'user' message
    const rawHistory = ((history ?? []).slice(-8) as { role: string; content: string }[]).filter(
      (m) => m.content?.trim()
    );
    const firstUserIdx = rawHistory.findIndex((m) => m.role === "user");
    // If no user message exists in history, pass empty array (Gemini requires history to start with 'user')
    const trimmedHistory = firstUserIdx === -1 ? [] : rawHistory.slice(firstUserIdx);
    const recentHistory = trimmedHistory.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })) as Content[];

    const chat = model.startChat({ history: recentHistory });

    // Agentic loop — max 6 turns to stay well within timeout
    let currentMessage = message;
    for (let turn = 0; turn < 6; turn++) {
      const result = await chat.sendMessage(currentMessage);
      const response = result.response;
      const candidate = response.candidates?.[0];

      if (!candidate) break;

      // Check for function calls
      const functionCalls = candidate.content?.parts
        ?.filter((p) => p.functionCall)
        .map((p) => p.functionCall!);

      if (!functionCalls || functionCalls.length === 0) {
        // No tool call — final text response
        let text = "";
        try {
          text = response.text();
        } catch {
          // response.text() throws when content is blocked or empty
        }
        return NextResponse.json({ reply: text || "Done!" });
      }

      // Execute all function calls and collect results
      const toolResults = await Promise.all(
        functionCalls.map(async (fc) => {
          const toolResult = await executeTool(
            fc.name,
            (fc.args ?? {}) as Record<string, unknown>,
            userId
          );
          return { functionResponse: { name: fc.name, response: { result: toolResult } } };
        })
      );

      // Feed results back as next message
      currentMessage = toolResults as never;
    }

    return NextResponse.json({ reply: "Done!" });
  } catch (err) {
    console.error("[chat/route]", err);
    const status = (err as { status?: number })?.status;
    if (status === 429) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a moment and try again." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
