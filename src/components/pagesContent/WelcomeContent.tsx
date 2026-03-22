"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingDown, Shield, Sparkles } from "lucide-react";

export default function WelcomeContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/8 via-background to-background flex flex-col">
      {/* Brand Header */}
      <header className="px-6 pt-8 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="size-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
            <TrendingDown size={18} className="text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">SpendWise</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12 pt-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3.5 py-1.5 rounded-full mb-7">
          <Sparkles size={11} />
          Smart Expense Tracking
        </div>

        {/* Hero Image */}
        <div className="relative w-72 h-44 mx-auto mb-8 rounded-3xl overflow-hidden shadow-2xl shadow-purple-200/80 ring-1 ring-purple-100">
          <Image
            src="/welcome-img.webp"
            alt="Expense Tracker"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/25 to-transparent" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-3 leading-tight">
          Control Your <span className="text-primary">Finances</span>
        </h1>
        <p className="text-base text-muted-foreground mb-8 max-w-xs leading-relaxed">
          Track every expense, visualize your spending, and reach your financial goals.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { icon: TrendingDown, text: "Real-time tracking" },
            { icon: Shield, text: "Secure & private" },
            { icon: Sparkles, text: "Smart insights" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-1.5 bg-white border border-border text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-full shadow-sm"
            >
              <Icon size={11} className="text-primary" />
              {text}
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button
          onClick={() => router.push("/login")}
          size="lg"
          className="px-8 h-12 rounded-2xl shadow-lg shadow-primary/30 font-semibold text-base gap-2"
        >
          Get Started
          <ArrowRight size={17} data-icon="inline-end" />
        </Button>

        <p className="mt-5 text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </button>
        </p>
      </main>
    </div>
  );
}
