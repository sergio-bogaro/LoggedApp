import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { Card } from "@/components/tw/generic/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authApi } from "@/querries/auth/auth";
import { useAppDispatch } from "@/store/auth/hooks";
import { setUser } from "@/store/auth/slice";


export default function Register() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t("register.feedback.passwordMismatch"));
      return;
    }

    if (password.length < 3) {
      toast.error(t("register.feedback.passwordTooShort"));
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register({ username, password });

      const loginResponse = await authApi.login({ username, password });
      dispatch(setUser(loginResponse.user));

      toast.success(t("register.feedback.success"));
      navigate("/onboarding");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("register.feedback.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="mb-6 text-center text-3xl font-bold">{t("register.title")}</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label={t("register.username")}
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            disabled={isLoading}
          />

          <Input
            label={t("register.password")}
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={3}
            disabled={isLoading}
          />

          <Input
            label={t("register.confirmPassword")}
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={3}
            disabled={isLoading}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("register.submitting") : t("register.submit")}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t("register.hasAccount")}{" "}
            <Button asChild variant="link">
              <Link to="/login">{t("register.loginLink")}</Link>
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
}
