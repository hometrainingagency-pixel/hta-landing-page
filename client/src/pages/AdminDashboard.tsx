import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/admin/login" });

    // Fetch contacts to get the count
    const { data: contacts, isLoading: contactsLoading } = trpc.contact.list.useQuery({
        limit: 100,
        offset: 0,
    });

    if (authLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-4 p-6">
                    <Skeleton className="h-10 w-64" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                    <p className="text-muted-foreground">
                        Bienvenue, {user?.name || "Administrateur"}.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Messages reçus
                            </CardTitle>
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {contactsLoading ? (
                                <Skeleton className="h-8 w-20" />
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">{contacts?.length || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Soumissions de formulaire
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
