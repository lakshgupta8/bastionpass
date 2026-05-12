import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import { Copy, RefreshCw, Save } from "lucide-react";
import { generatePassword, calculateStrength } from "../lib/passwordUtils";
import { cn } from "../lib/utils";

interface Options {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

interface PasswordGeneratorProps {
  onSavePassword: (password: string) => void;
}

export function PasswordGenerator({ onSavePassword }: PasswordGeneratorProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const { register, watch, setValue } = useForm<Options>({
    defaultValues: {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const options = watch();

  useEffect(() => {
    const savedPrefs = Cookies.get("password-prefs");
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        Object.keys(parsed).forEach((key) => {
          setValue(key as keyof Options, parsed[key]);
        });
      } catch (e) {
        console.error("Failed to parse cookies", e);
      }
    }
  }, [setValue]);

  useEffect(() => {
    Cookies.set("password-prefs", JSON.stringify(options), { expires: 365 });
  }, [options]);

  const handleGenerate = () => {
    if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
      setCurrentPassword("");
      return;
    }
    const newPassword = generatePassword(options.length, options);
    setCurrentPassword(newPassword);
    setIsCopied(false);
  };

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.length, options.uppercase, options.lowercase, options.numbers, options.symbols]);

  const handleCopy = async () => {
    if (!currentPassword) return;
    try {
      await navigator.clipboard.writeText(currentPassword);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const strength = calculateStrength(currentPassword);

  return (
    <div className="flex flex-col gap-6 bg-card hover:bg-black/40 shadow-2xl backdrop-blur-sm p-6 border border-border/50 rounded-xl overflow-hidden text-card-foreground transition-all">
      <div className="group relative">
        <div className="absolute -inset-0.5 bg-linear-to-r from-primary to-accent opacity-30 group-hover:opacity-50 rounded-lg transition duration-1000 group-hover:duration-200 blur" />
        <div className="relative flex justify-between items-center bg-black/50 p-4 border border-white/10 rounded-lg min-h-16">
          <span className="mr-4 font-mono text-white text-xl truncate tracking-wider">
            {currentPassword || "Select options below"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              className="hover:bg-white/10 p-2 rounded-md text-muted-foreground hover:text-white transition-colors"
              title="Regenerate"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={handleCopy}
              className={cn(
                "p-2 rounded-md transition-colors",
                isCopied ? "bg-green-500/20 text-green-400" : "hover:bg-white/10 text-primary hover:text-primary-foreground"
              )}
              title="Copy"
            >
              <Copy size={20} />
            </button>
            <button
              onClick={() => onSavePassword(currentPassword)}
              className="hover:bg-white/10 p-2 rounded-md text-muted-foreground hover:text-white transition-colors"
              title="Save to Vault"
              disabled={!currentPassword}
            >
              <Save size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-black/20 p-4 border border-white/5 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            Strength: <span className="font-semibold text-foreground">{strength.label}</span>
          </span>
          <span className="text-muted-foreground text-xs">
            Est. Crack Time: <span className="font-mono text-primary-foreground">{strength.crackTime}</span>
          </span>
        </div>

        <div className="gap-1.5 grid grid-cols-5 w-full h-2">
          {[0, 1, 2, 3, 4].map((index) => {
            const isActive = strength.tier >= index;
            return (
              <div
                key={index}
                className={cn(
                  "rounded-full h-full transition-all duration-300",
                  isActive ? strength.color : "bg-secondary"
                )}
              />
            );
          })}
        </div>

        {strength.suggestion && (
          <p
            className={cn(
              "mt-0.5 text-xs transition-colors",
              strength.tier <= 1
                ? "text-red-400"
                : strength.tier === 2
                  ? "text-yellow-400"
                  : "text-emerald-400"
            )}
          >
            {strength.suggestion}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-6 mt-2">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="font-medium text-sm">Password Length</label>
            <span className="bg-primary/10 px-2 py-1 rounded-md font-mono text-primary text-sm">
              {options.length}
            </span>
          </div>
          <input
            type="range"
            min="4"
            max="64"
            {...register("length", { valueAsNumber: true })}
            className="bg-secondary rounded-lg w-full h-2 accent-primary appearance-none cursor-pointer"
          />
        </div>

        <div className="gap-4 grid grid-cols-2">
          <label className="group flex items-center gap-3 cursor-pointer">
            <div className="relative flex justify-center items-center">
              <input type="checkbox" {...register("uppercase")} className="sr-only peer" />
              <div className="peer-checked:bg-primary border border-border group-hover:border-primary/50 peer-checked:border-primary rounded w-5 h-5 transition-all" />
              <svg className="absolute opacity-0 peer-checked:opacity-100 w-3 h-3 text-primary-foreground transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-muted-foreground group-hover:text-foreground text-sm transition-colors">Uppercase (A-Z)</span>
          </label>

          <label className="group flex items-center gap-3 cursor-pointer">
            <div className="relative flex justify-center items-center">
              <input type="checkbox" {...register("lowercase")} className="sr-only peer" />
              <div className="peer-checked:bg-primary border border-border group-hover:border-primary/50 peer-checked:border-primary rounded w-5 h-5 transition-all" />
              <svg className="absolute opacity-0 peer-checked:opacity-100 w-3 h-3 text-primary-foreground transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-muted-foreground group-hover:text-foreground text-sm transition-colors">Lowercase (a-z)</span>
          </label>

          <label className="group flex items-center gap-3 cursor-pointer">
            <div className="relative flex justify-center items-center">
              <input type="checkbox" {...register("numbers")} className="sr-only peer" />
              <div className="peer-checked:bg-primary border border-border group-hover:border-primary/50 peer-checked:border-primary rounded w-5 h-5 transition-all" />
              <svg className="absolute opacity-0 peer-checked:opacity-100 w-3 h-3 text-primary-foreground transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-muted-foreground group-hover:text-foreground text-sm transition-colors">Numbers (0-9)</span>
          </label>

          <label className="group flex items-center gap-3 cursor-pointer">
            <div className="relative flex justify-center items-center">
              <input type="checkbox" {...register("symbols")} className="sr-only peer" />
              <div className="peer-checked:bg-primary border border-border group-hover:border-primary/50 peer-checked:border-primary rounded w-5 h-5 transition-all" />
              <svg className="absolute opacity-0 peer-checked:opacity-100 w-3 h-3 text-primary-foreground transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-muted-foreground group-hover:text-foreground text-sm transition-colors">Symbols (!@#)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
