import { useState, useEffect } from "react";
import { PasswordGenerator } from "./components/PasswordGenerator";
import { PasswordVault, type SavedPassword } from "./components/PasswordVault";

const VAULT_KEY = "bastion-vault";

const isSavedPassword = (value: unknown): value is SavedPassword => {
    if (typeof value !== "object" || value === null) return false;
    const entry = value as Record<string, unknown>;
    return (
        typeof entry.id === "string" &&
        typeof entry.service === "string" &&
        typeof entry.passwordHash === "string" &&
        typeof entry.passwordPlain === "string" &&
        typeof entry.createdAt === "number"
    );
};

const loadVault = (): SavedPassword[] => {
    try {
        const saved = localStorage.getItem(VAULT_KEY);
        if (!saved) return [];
        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed)) return [];
        // Drop malformed entries instead of letting them crash the list render.
        return parsed.filter(isSavedPassword);
    } catch (e) {
        console.error("Failed to load vault", e);
        return [];
    }
};

function App() {
    const [passwords, setPasswords] = useState<SavedPassword[]>([]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPasswords(loadVault());
    }, []);

    const saveToStorage = (newVault: SavedPassword[]) => {
        setPasswords(newVault);
        try {
            localStorage.setItem(VAULT_KEY, JSON.stringify(newVault));
        } catch (e) {
            console.error("Failed to save vault", e);
        }
    };

    const handleSavePassword = (passwordPlain: string) => {
        const newEntry: SavedPassword = {
            id: crypto.randomUUID(),
            service: "N/A",
            passwordHash: "",
            passwordPlain,
            createdAt: Date.now(),
        };
        saveToStorage([newEntry, ...passwords]);
    };

    const handleAddExternal = (service: string, passwordPlain: string) => {
        const newEntry: SavedPassword = {
            id: crypto.randomUUID(),
            service: service.trim() || "N/A",
            passwordHash: "",
            passwordPlain,
            createdAt: Date.now(),
        };
        saveToStorage([newEntry, ...passwords]);
    };

    const handleDelete = (id: string) => {
        saveToStorage(passwords.filter((p) => p.id !== id));
    };

    const handleUpdateService = (id: string, newService: string) => {
        saveToStorage(
            passwords.map((p) => (p.id === id ? { ...p, service: newService } : p))
        );
    };

    return (
        <div className="relative bg-background px-4 sm:px-6 lg:px-8 py-12 min-h-screen overflow-hidden select-none">
            <div className="z-10 relative flex flex-col gap-8 mx-auto max-w-3xl">
                <div className="flex flex-col justify-center items-center gap-4 text-center">
                    <div>
                        <h1 className="bg-clip-text bg-linear-to-r from-white to-white/60 font-extrabold text-transparent text-4xl tracking-tight">
                            BastionPass
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Generate unbreakable passwords and store them securely.
                        </p>
                    </div>
                </div>

                <PasswordGenerator onSavePassword={handleSavePassword} />

                <PasswordVault
                    passwords={passwords}
                    onDelete={handleDelete}
                    onUpdateService={handleUpdateService}
                    onAddExternal={handleAddExternal}
                />
            </div>
        </div>
    );
}

export default App;
