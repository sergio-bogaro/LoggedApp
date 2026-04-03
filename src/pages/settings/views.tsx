import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/tw/generic/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { customViewsApi } from "@/querries/customViews/customViews";
import { useAppSelector } from "@/store/auth/hooks";
import type { CustomView, CustomViewUpdate } from "@/types/customView";

export default function CustomViewsManager() {
  const { user } = useAppSelector((state) => state.auth);
  const [customViews, setCustomViews] = useState<CustomView[]>([]);
  const [editingView, setEditingView] = useState<CustomView | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadViews();
  }, []);

  const loadViews = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const views = await customViewsApi.getUserViews(user.id);
      setCustomViews(views);
    } catch (error) {
      toast.error("Failed to load views");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVisibility = async (view: CustomView) => {
    if (!user) return;
    try {
      const updateData: CustomViewUpdate = { isVisible: !view.isVisible };
      await customViewsApi.updateView(view.id, user.id, updateData);
      await loadViews();
      toast.success("View updated");
    } catch (error) {
      toast.error("Failed to update view");
    }
  };

  const handleTogglePin = async (view: CustomView) => {
    if (!user) return;
    try {
      const updateData: CustomViewUpdate = { isPinned: !view.isPinned };
      await customViewsApi.updateView(view.id, user.id, updateData);
      await loadViews();
      toast.success("View updated");
    } catch (error) {
      toast.error("Failed to update view");
    }
  };

  const handleDeleteView = async (viewId: number) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this view?")) return;

    try {
      await customViewsApi.deleteView(viewId, user.id);
      await loadViews();
      toast.success("View deleted");
    } catch (error) {
      toast.error("Failed to delete view");
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading views...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Custom Views</h2>
        <p className="text-muted-foreground">
          Manage your custom views and how you organize your media
        </p>
      </div>

      {customViews.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">📱</div>
          <p className="text-muted-foreground">No custom views yet</p>
          <Button className="mt-4" onClick={() => window.location.href = "/"}>
            Create Views
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {customViews.map((view) => (
            <Card key={view.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{view.icon || "📁"}</div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{view.name}</h3>
                    {view.isPinned && <span title="Pinned">📌</span>}
                    {!view.isVisible && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">Hidden</span>
                    )}
                  </div>

                  {view.description && (
                    <p className="text-sm text-muted-foreground mb-3">{view.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {view.filters?.media_types && (
                      <span className="bg-accent px-2 py-1 rounded">
                        Types: {view.filters.media_types.join(", ")}
                      </span>
                    )}
                    {view.filters?.status && (
                      <span className="bg-accent px-2 py-1 rounded">
                        Status: {view.filters.status.join(", ")}
                      </span>
                    )}
                    {view.filters?.min_rating && (
                      <span className="bg-accent px-2 py-1 rounded">
                        Min Rating: {view.filters.min_rating}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleVisibility(view)}
                  >
                    {view.isVisible ? "👁️ Hide" : "👁️‍🗨️ Show"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePin(view)}
                  >
                    {view.isPinned ? "📌 Unpin" : "📍 Pin"}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteView(view.id)}
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
