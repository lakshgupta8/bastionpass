import { useState, useEffect } from "react";
import { PasswordGenerator } from "./components/PasswordGenerator";
import { PasswordVault, type SavedPassword } from "./components/PasswordVault";

function App() {
    const [passwords, setPasswords] = useState<SavedPassword[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("bastion-vault");
        if (saved) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setPasswords(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load vault", e);
            }
        }
    }, []);

    const saveToStorage = (newVault: SavedPassword[]) => {
        setPasswords(newVault);
        localStorage.setItem("bastion-vault", JSON.stringify(newVault));
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
