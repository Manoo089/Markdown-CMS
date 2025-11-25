"use client";

import Button from "@/ui/Button";
import InputField from "@/ui/InputField";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSigningIn(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setIsSigningIn(false);
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface rounded-lg shadow p-6 space-y-6 border border-border"
    >
      <InputField
        id="email"
        type="email"
        label=""
        placeholder="Gib deine E-Mail ein"
        value={email}
        fullWidth
        onChange={(e) => setEmail(e.target.value)}
      />
      <InputField
        id="password"
        type="password"
        label=""
        placeholder="Gib dein Passwort ein"
        value={password}
        fullWidth
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        type="submit"
        disabled={isSigningIn}
        label={isSigningIn ? "Signing in..." : "Sign In"}
        fullWidth
      />

      {error && <div className="text-danger text-sm mt-2">{error}</div>}
    </form>
  );
}
