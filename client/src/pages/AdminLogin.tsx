import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import { APP_LOGO } from "@/const";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success("Connexion réussie !");
                window.location.href = "/admin/contacts";
            } else {
                toast.error(data.message || "Identifiants incorrects");
            }
        } catch {
            toast.error("Erreur de connexion au serveur");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-blue-500 overflow-hidden">
                        <img src={APP_LOGO} alt="HTA Logo" className="h-full w-full object-cover" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        Administration HTA
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Connectez-vous pour accéder au panneau d'administration
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="email" className="text-gray-200 flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Adresse e-mail
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-gray-200 flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Mot de passe
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6"
                        >
                            {loading ? "Connexion en cours..." : "Se connecter"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <a
                            href="/"
                            className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour au site
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
