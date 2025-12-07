"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { MessageAlert } from "@/components/MessageAlert";
import { useMessage } from "@/hooks/useActionState";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const { message, showError, clearMessage } = useMessage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSigningIn(true);
    clearMessage();

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      showError("Invalid email or password");
      setIsSigningIn(false);
      return;
    }

    window.location.href = "/";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface rounded-lg shadow p-6 space-y-6 border border-border"
    >
      <MessageAlert message={message} onDismiss={clearMessage} />

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
    </form>
  );
}
