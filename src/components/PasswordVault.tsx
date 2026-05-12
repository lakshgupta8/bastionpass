import { useState } from "react";
import { Copy, Trash2, KeyRound, Plus, X } from "lucide-react";
import { cn } from "../lib/utils";
import { calculateStrength } from "../lib/passwordUtils";

export interface SavedPassword {
  id: string;
  service: string;
  passwordHash: string;
  passwordPlain: string;
  createdAt: number;
}

interface PasswordVaultProps {
  passwords: SavedPassword[];
  onDelete: (id: string) => void;
  onUpdateService: (id: string, newService: string) => void;
  onAddExternal: (service: string, passwordPlain: string) => void;
}

export function PasswordVault({
  passwords,
  onDelete,
  onUpdateService,
  onAddExternal,
}: PasswordVaultProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    onAddExternal(newService, newPassword);
    setNewService("");
    setNewPassword("");
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col gap-4 bg-card hover:bg-black/40 shadow-2xl backdrop-blur-sm p-6 border border-border/50 rounded-xl overflow-hidden text-card-foreground transition-all">
      <div className="flex justify-between items-center gap-4">
        <h3 className="flex items-center gap-2 font-semibold text-lg">
          <KeyRound size={20} className="text-primary" />
          Saved Passwords
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg font-medium text-primary text-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            Add Custom
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="flex flex-col gap-3 bg-black/30 p-4 border border-primary/20 rounded-lg animate-in fade-in-50 duration-200"
        >
          <div className="flex justify-between items-center">
            <span className="font-medium text-primary-foreground text-xs">Add External Password</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex sm:flex-row flex-col gap-2">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Service Name (e.g. Google)"
              className="flex-1 bg-black/50 px-3 py-1.5 border border-white/10 rounded outline-none focus:border-primary text-foreground text-xs transition-colors"
            />
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Password"
              required
              className="flex-1 bg-black/50 px-3 py-1.5 border border-white/10 rounded outline-none focus:border-primary text-foreground text-xs transition-colors"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 px-4 py-1.5 rounded font-medium text-primary-foreground text-xs transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {passwords.length === 0 ? (
        <div className="flex flex-col justify-center items-center gap-4 py-12 text-center">
          <div className="flex justify-center items-center bg-primary/5 rounded-full w-12 h-12 text-muted-foreground/50">
            <KeyRound size={24} />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Vault is empty</p>
            <p className="mt-0.5 text-muted-foreground/60 text-xs">
              Generate or add custom passwords to store securely.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-2">
          {passwords.map((item) => {
            const strength = calculateStrength(item.passwordPlain);
            return (
              <div
                key={item.id}
                className="group relative bg-black/30 hover:bg-black/50 p-4 border border-white/5 hover:border-white/10 rounded-lg transition-all"
              >
                <div className="flex md:flex-row flex-col justify-between md:items-center gap-4">
                  <div className="flex flex-col flex-1 gap-1">
                    <input
                      type="text"
                      value={item.service}
                      onChange={(e) => onUpdateService(item.id, e.target.value)}
                      placeholder="N/A"
                      className="bg-transparent hover:bg-white/5 -mx-1 p-0 px-1 border-none rounded outline-none focus:ring-0 font-medium text-foreground text-sm transition-colors"
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors">
                        {"•".repeat(Math.min(item.passwordPlain.length, 12))}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end gap-1 w-24">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {strength.label}
                      </span>
                      <div className="gap-0.5 grid grid-cols-5 w-full h-1">
                        {[0, 1, 2, 3, 4].map((idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "rounded-full h-full",
                              strength.tier >= idx ? strength.color : "bg-secondary"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(item.id, item.passwordPlain)}
                        className={cn(
                          "p-2 rounded-md transition-colors cursor-pointer",
                          copiedId === item.id
                            ? "bg-green-500/20 text-green-400"
                            : "hover:bg-white/10 text-muted-foreground hover:text-white"
                        )}
                        title="Copy Password"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="hover:bg-red-500/20 p-2 rounded-md text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
