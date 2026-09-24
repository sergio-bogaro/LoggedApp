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


export default function Register() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const schema = useMemo(
    () =>
      z
        .object({
          username: z
            .string()
            .min(3, t("register.validation.usernameTooShort")),
          password: z
            .string()
            .min(3, t("register.validation.passwordTooShort")),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          path: ["confirmPassword"],
          message: t("register.validation.passwordMismatch"),
        }),
    [t]
  );

  type RegisterForm = z.infer<typeof schema>;

  const form = useForm<RegisterForm>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "", confirmPassword: "" },
  });

  const isLoading = form.formState.isSubmitting;
  const rootError = form.formState.errors.root?.message;

  const handleRegister = async (data: RegisterForm) => {
    try {
      await authApi.register({ username: data.username, password: data.password });

      const loginResponse = await authApi.login({ username: data.username, password: data.password });
      dispatch(setUser(loginResponse.user));

      toast.success(t("register.feedback.success"));
      navigate("/onboarding");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("register.feedback.error");
      form.setError("root", { message });
      toast.error(message);
    }
  };

  return (
    <EntryCard
      title={t("register.title")}
      footer={
        <>
          {t("register.hasAccount")}{" "}
          <Button asChild variant="link" className="h-auto p-0">
            <Link to="/login">{t("register.loginLink")}</Link>
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4" noValidate>
          <Input
            control={form.control}
            label={t("register.username")}
            name="username"
            type="text"
            autoComplete="username"
            autoFocus
            required
            disabled={isLoading}
          />

          <Input
            control={form.control}
            label={t("register.password")}
            name="password"
            type="password"
            autoComplete="new-password"
            required
            disabled={isLoading}
          />

          <Input
            control={form.control}
            label={t("register.confirmPassword")}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            disabled={isLoading}
          />

          {rootError && (
            <p role="alert" className="text-step-1 text-destructive">{rootError}</p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? t("register.submitting") : t("register.submit")}
          </Button>
        </form>
      </Form>
    </EntryCard>
  );
}
