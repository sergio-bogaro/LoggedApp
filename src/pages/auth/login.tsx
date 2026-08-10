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


export default function Login() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ username, password });
      dispatch(setUser(response.user));
      toast.success(t("login.feedback.success"));
      navigate("/media/home");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("login.feedback.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="mb-6 text-center text-3xl font-bold">{t("login.title")}</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label={t("login.username")}
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label={t("login.password")}
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("login.submitting") : t("login.submit")}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t("login.noAccount")}{" "}
            <Button asChild variant="link">
              <Link to="/register">{t("login.registerLink")}</Link>
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
}
