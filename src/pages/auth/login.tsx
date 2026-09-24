import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

import { EntryCard } from "@/components/tw/generic/EntryCard";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authApi } from "@/querries/auth/auth";
import { useAppDispatch } from "@/store/auth/hooks";
import { setUser } from "@/store/auth/slice";


export default function Login() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const schema = useMemo(
    () =>
      z.object({
        username: z.string().min(1, t("login.validation.usernameRequired")),
        password: z.string().min(1, t("login.validation.passwordRequired")),
      }),
    [t]
  );

  type LoginForm = z.infer<typeof schema>;

  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const isLoading = form.formState.isSubmitting;
  const rootError = form.formState.errors.root?.message;

  const handleLogin = async (data: LoginForm) => {
    try {
      const response = await authApi.login(data);
      dispatch(setUser(response.user));
      toast.success(t("login.feedback.success"));
      navigate("/media/home");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("login.feedback.error");
      form.setError("root", { message });
      toast.error(message);
    }
  };

  return (
    <EntryCard
      title={t("login.title")}
      footer={
        <>
          {t("login.noAccount")}{" "}
          <Button asChild variant="link" className="h-auto p-0">
            <Link to="/register">{t("login.registerLink")}</Link>
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4" noValidate>
          <Input
            control={form.control}
            label={t("login.username")}
            name="username"
            type="text"
            autoComplete="username"
            autoFocus
            required
            disabled={isLoading}
          />

          <Input
            control={form.control}
            label={t("login.password")}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={isLoading}
          />

          {rootError && (
            <p role="alert" className="text-step-1 text-destructive">{rootError}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? t("login.submitting") : t("login.submit")}
          </Button>
        </form>
      </Form>
    </EntryCard>
  );
}
