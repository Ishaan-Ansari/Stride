import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateSettings, sendReminderNow } from "@/lib/api";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";

export default function SettingsDialog({ open, onOpenChange, settings, onSaved }) {
  const [email, setEmail] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("06:30");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (settings) {
      setEmail(settings.email || "");
      setEnabled(!!settings.reminder_enabled);
      setTime(settings.reminder_time || "06:30");
    }
  }, [settings, open]);

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings({
        email: email || null,
        reminder_enabled: enabled,
        reminder_time: time,
      });
      toast.success("Settings saved");
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error("Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  const sendNow = async () => {
    setSending(true);
    try {
      const res = await sendReminderNow();
      if (res.sent) {
        toast.success("Test reminder sent");
      } else {
        toast.error(
          res.reason === "disabled_or_missing_config"
            ? "Enable reminder & add email first (also ensure RESEND_API_KEY is set on the server)."
            : `Failed: ${res.error || "unknown"}`,
        );
      }
    } catch (e) {
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[#141414] border border-white/10 rounded-none text-white max-w-md"
        data-testid="settings-dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-tight text-2xl">
            Reminder Settings
          </DialogTitle>
          <DialogDescription className="text-[#A0A0A0]">
            Get the day's plan delivered at 6:30 AM.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label className="label-overline">Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#666]" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-none bg-[#0A0A0A] border-white/10 focus-visible:ring-[#007AFF] focus-visible:ring-offset-0"
                data-testid="settings-email-input"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="label-overline">Daily Reminder</Label>
              <div className="text-sm text-[#A0A0A0] mt-1">
                Send at {time} server time
              </div>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              data-testid="settings-reminder-switch"
            />
          </div>

          <div className="space-y-2">
            <Label className="label-overline">Reminder Time</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-none bg-[#0A0A0A] border-white/10 focus-visible:ring-[#007AFF] focus-visible:ring-offset-0"
              data-testid="settings-time-input"
            />
            <p className="text-xs text-[#666]">
              Default 06:30. Note: scheduler currently fires at 06:30 server
              time regardless; changing this is informational unless you ask to
              wire it up.
            </p>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between gap-2">
          <Button
            variant="ghost"
            className="rounded-none border border-white/20 hover:bg-white/5 uppercase tracking-wider"
            onClick={sendNow}
            disabled={sending}
            data-testid="send-test-email-btn"
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? "Sending..." : "Send Test Now"}
          </Button>
          <Button
            className="btn-primary rounded-none"
            onClick={save}
            disabled={saving}
            data-testid="save-settings-btn"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
