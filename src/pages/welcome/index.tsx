import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ViewSetupStep from "@/components/ViewSetupStep";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/auth/hooks";

function WelcomePage() {
  const { t } = useTranslation("welcome");
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [showViewSetup, setShowViewSetup] = useState(false);

  const handleViewSetupComplete = () => {
    navigate("/logger");
  };

  if (showViewSetup && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <ViewSetupStep onComplete={handleViewSetupComplete} />
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center items-center p-40">
      <div className="flex flex-col gap-2 w-1/2 bg-accent rounded p-4">
        <h2>{t("welcome.message")}</h2>
        <p>{t("welcome.intro")}</p>

        <LanguageSwitcher />
        <ThemeSwitcher />

        {isAuthenticated ? (
          <>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.username}!
            </p>
            <div className="flex gap-2">
              <Button asChild variant="default">
                <Link to="/logger">Go to App</Link>
              </Button>
              <Button variant="outline" onClick={() => setShowViewSetup(true)}>
                Setup Views
              </Button>
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <Button asChild variant="default">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/register">Register</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WelcomePage;