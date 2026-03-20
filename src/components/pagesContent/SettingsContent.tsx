"use client";
import Navbar from "@/components/Navbar";
import { AlertTriangle, KeyRound, Loader2, LogOut, Wallet, User, Palette } from "lucide-react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/firebaseConfig";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { CURRENCY_OPTIONS } from "@/utils/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";

const SettingsContent = () => {
  const [loading, setLoading] = useState(false);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const currency = useAuthStore((state) => state.currency);
  const setCurrency = useAuthStore((state) => state.setCurrency);

  const username = user?.email?.split("@")[0] ?? "User";
  const initials = username.slice(0, 2).toUpperCase();

  const handleSignout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      router.push("/");
    } catch {
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = async (newCurrency: string | null) => {
    if (!newCurrency || !user?.uid || newCurrency === currency) return;
    setCurrencyLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { currency: newCurrency });
      setCurrency(newCurrency);
      toast.success(`Currency updated to ${newCurrency}`);
    } catch {
      toast.error("Failed to update currency. Please try again.");
    } finally {
      setCurrencyLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-28">
        {/* Gradient Header */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-5 pt-8 pb-8">
          <div className="max-w-lg mx-auto text-center">
            <Avatar className="size-16 mx-auto mb-3 ring-4 ring-white/30">
              <AvatarFallback className="bg-white/20 text-primary-foreground font-bold text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-xl font-bold text-primary-foreground capitalize">{username}</h1>
            <p className="text-sm text-primary-foreground/70 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-5 mt-6 flex flex-col gap-4">
          {/* Preferences */}
          <Card className="border border-border shadow-sm rounded-2xl bg-card">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <User size={14} />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5 flex flex-col gap-4">
              {/* Currency */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currency">Display Currency</Label>
                <Select
                  value={currency}
                  onValueChange={handleCurrencyChange}
                  disabled={currencyLoading}
                >
                  <SelectTrigger id="currency" className="h-11 rounded-xl">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.code} value={opt.code}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 bg-muted rounded-lg flex items-center justify-center">
                    <Palette size={15} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Appearance</p>
                    <p className="text-xs text-muted-foreground">Light or dark mode</p>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card className="border border-border shadow-sm rounded-2xl bg-card">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5 flex flex-col gap-2">
              <Button
                onClick={() => router.push("/setIncome")}
                variant="outline"
                className="w-full h-11 rounded-xl justify-start gap-3 font-medium hover:bg-accent hover:text-accent-foreground hover:border-primary/30 transition-all duration-200"
              >
                <Wallet size={17} className="text-primary" />
                Update Monthly Income
              </Button>

              <Separator />

              <Button
                onClick={() => router.push("/resetPassword")}
                variant="outline"
                className="w-full h-11 rounded-xl justify-start gap-3 font-medium hover:bg-accent hover:text-accent-foreground hover:border-primary/30 transition-all duration-200"
              >
                <KeyRound size={17} className="text-primary" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border border-destructive/20 shadow-sm rounded-2xl bg-card">
            <CardHeader className="pb-2 pt-5 px-6">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <AlertTriangle size={14} className="text-destructive" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-5">
              <Button
                onClick={handleSignout}
                disabled={loading}
                className="w-full h-11 bg-destructive hover:bg-destructive/90 text-white rounded-xl font-semibold gap-2"
              >
                {loading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    <LogOut size={16} />
                    Sign Out
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Navbar />
    </>
  );
};

export default SettingsContent;
