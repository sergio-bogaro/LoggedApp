import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import { Card } from "@/components/tw/generic/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { customViewsApi } from "@/querries/customViews/customViews";
import { useAppSelector } from "@/store/auth/hooks";
import type { CustomView, CustomViewCreate } from "@/types/customView";

interface ViewSetupStepProps {
  onComplete: () => void;
}

export default function ViewSetupStep({ onComplete }: ViewSetupStepProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [customViews, setCustomViews] = useState<CustomView[]>([]);
  const [isCreatingDefaults, setIsCreatingDefaults] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const [newViewName, setNewViewName] = useState("");
  const [newViewIcon, setNewViewIcon] = useState("📁");
  const [newViewColor, setNewViewColor] = useState("#3b82f6");

  const loadViews = useCallback(async () => {
    if (!user) return;
    try {
      const views = await customViewsApi.getUserViews(user.id);
      setCustomViews(views);
    } catch (error) {
      console.error("Error loading views:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadViews();
    }
  }, [user, loadViews]);

  const handleCreateDefaults = async () => {
    if (!user) return;
    setIsCreatingDefaults(true);

    try {
      const views = await customViewsApi.createDefaultViews(user.id);
      setCustomViews(views);
      toast.success("Default views created!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create views");
    } finally {
      setIsCreatingDefaults(false);
    }
  };

  const handleCreateCustomView = async () => {
    if (!user || !newViewName.trim()) {
      toast.error("Please enter a view name");
      return;
    }

    try {
      const viewData: CustomViewCreate = {
        userId: user.id,
        name: newViewName,
        icon: newViewIcon,
        color: newViewColor,
        order: customViews.length,
        filters: {},
        displaySettings: { view_mode: "grid", sort_by: "created_at", sort_order: "desc" },
      };

      const newView = await customViewsApi.createView(viewData);
      setCustomViews([...customViews, newView]);
      setNewViewName("");
      setNewViewIcon("📁");
      setNewViewColor("#3b82f6");
      setShowCustomForm(false);
      toast.success("Custom view created!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create view");
    }
  };

  const inputClassName =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Customize Your Views</h2>
        <p className="text-muted-foreground">
          Create custom views to organize your media library the way you want
        </p>
      </div>

      {customViews.length === 0 ? (
        <Card className="p-6 space-y-4">
          <div className="text-center space-y-4">
            <div className="text-6xl">📱</div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No views yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by creating default views or create your own custom views
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={handleCreateDefaults} disabled={isCreatingDefaults}>
                {isCreatingDefaults ? "Creating..." : "Create Default Views"}
              </Button>
              <Button variant="outline" onClick={() => setShowCustomForm(true)}>
                Create Custom View
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customViews.map((view) => (
              <Card
                key={view.id}
                className="p-4 flex items-center gap-3 border-l-4"
              >
                <div className="text-2xl">{view.icon || "📁"}</div>
                <div className="flex-1">
                  <h4 className="font-semibold">{view.name}</h4>
                  {view.description && (
                    <p className="text-xs text-muted-foreground">{view.description}</p>
                  )}
                </div>
                {view.isPinned && <span className="text-xs">📌</span>}
              </Card>
            ))}
          </div>

          <Button onClick={() => setShowCustomForm(!showCustomForm)} variant="outline" className="w-full">
            {showCustomForm ? "Cancel" : "+ Add New View"}
          </Button>
        </div>
      )}

      {showCustomForm && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Create Custom View</h3>

          <div>
            <Label htmlFor="viewName">View Name</Label>
            <input
              id="viewName"
              name="viewName"
              type="text"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              placeholder="e.g., Action Animes, Romance Books..."
              className={inputClassName}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="viewIcon">Icon (Emoji)</Label>
              <input
                id="viewIcon"
                name="viewIcon"
                type="text"
                value={newViewIcon}
                onChange={(e) => setNewViewIcon(e.target.value)}
                maxLength={2}
                className={inputClassName}
              />
            </div>

            <div>
              <Label htmlFor="viewColor">Color</Label>
              <input
                id="viewColor"
                name="viewColor"
                type="color"
                value={newViewColor}
                onChange={(e) => setNewViewColor(e.target.value)}
                className="h-9 w-full rounded-md border border-input"
              />
            </div>
          </div>

          <Button onClick={handleCreateCustomView} className="w-full">
            Create View
          </Button>
        </Card>
      )}

      {customViews.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={onComplete}>Continue to App</Button>
        </div>
      )}
    </div>
  );
}
