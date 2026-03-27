"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, Users, Building2, CreditCard, Globe, Mail, Settings,
  LogOut, Menu, Shield, CheckCircle, XCircle, Clock,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Clientes", href: "/admin/customers" },
  { icon: Building2, label: "Parceiros", href: "/admin/partners" },
  { icon: CreditCard, label: "Planos", href: "/admin/plans" },
  { icon: Globe, label: "Domínios", href: "/admin/domains", active: true },
  { icon: Mail, label: "Emails", href: "/admin/emails" },
  { icon: Settings, label: "Configurações", href: "/admin/settings" },
];

export default function AdminDomainsPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/admin/auth/me").then(res => {
      if (!res.ok) router.push("/admin/login");
      else setLoading(false);
    });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <aside className="hidden lg:flex w-64 bg-slate-800 border-r border-slate-700 flex-col">
        <div className="p-6 border-b border-slate-700">
          <Link href="/admin" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-emerald-400" />
            <span className="text-xl font-bold text-white">IsaMail</span>
            <Badge className="ml-2 bg-emerald-600/20 text-emerald-400 text-xs">Admin</Badge>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                item.active ? "bg-emerald-600/20 text-emerald-400" : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}>
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-3" />Sair
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-white"><Menu className="h-6 w-6" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-slate-800 border-slate-700 w-64" />
          </Sheet>
          <div>
            <h1 className="text-xl font-semibold text-white">Gestão de Domínios</h1>
            <p className="text-sm text-slate-400">Gerencie todos os domínios cadastrados</p>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Domínios</CardTitle>
              <CardDescription className="text-slate-400">Domínios configurados pelos clientes</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Globe className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum domínio cadastrado</p>
              <p className="text-sm text-slate-500 mt-2">Os domínios aparecerão aqui quando os clientes configurarem</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
