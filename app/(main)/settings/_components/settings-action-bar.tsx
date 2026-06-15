"use client";

import { CheckCircle2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type SettingsActionBarProps = {
  dirty: boolean;
  saved: boolean;
  onReset: () => void;
  onSave: () => void;
};

export function SettingsActionBar({ dirty, saved, onReset, onSave }: SettingsActionBarProps) {
  return (
    <div className="settings-action-bar" role="status" aria-live="polite">
      <div className="settings-action-bar__status">
        {saved ? (
          <>
            <CheckCircle2 size={16} />
            Changes saved for this session.
          </>
        ) : dirty ? (
          "Unsaved changes"
        ) : (
          "No pending changes"
        )}
      </div>
      <div className="settings-action-bar__actions">
        <Button type="button" variant="outline" size="sm" onClick={onReset} disabled={!dirty}>
          <RotateCcw size={14} />
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={onSave} disabled={!dirty}>
          <Save size={14} />
          Save changes
        </Button>
      </div>
    </div>
  );
}
