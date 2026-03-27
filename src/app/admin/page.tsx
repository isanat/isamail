"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Globe,
  Mail,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Shield,
} from "lucide-react";

interface AdminData {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalPartners: number;
  activePartners: number;
  totalDomains: number;
  totalEmailAccounts: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  newCustomersThisMonth: number;
  customersGrowth: number;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin", active: true },
  { icon: Users, label: "Clientes", href: "/admin/customers" },
  { icon: Building2, label: "Parceiros", href: "/admin/partners" },
  { icon: CreditCard, label: "Planos", href: "/admin/plans" },
  { icon: Globe, label: "Domínios", href: "/admin/domains" },
  { icon: Mail, label: "Emails", href: "/admin/emails" },
  { icon: DollarSign, label: "Faturas", href: "/admin/invoices" },
  { icon: BarChart3, label: "Relatórios", href: "/admin/reports" },
  { icon: Settings, label: "Configurações", href: "/admin/settings" },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/admin/login");
      } else {
        throw new Error("Erro ao sair");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível fazer logout.",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <Link href="/admin" className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-emerald-400" />
          <div>
            <span className="text-xl font-bold text-white">IsaMail</span>
            <Badge className="ml-2 bg-emerald-600/20 text-emerald-400 text-xs">Admin</Badge>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              item.active
                ? "bg-emerald-600/20 text-emerald-400"
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-slate-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    totalPartners: 0,
    activePartners: 0,
    totalDomains: 0,
    totalEmailAccounts: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
    newCustomersThisMonth: 0,
    customersGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Check auth
      const authResponse = await fetch("/api/admin/auth/me");
      if (!authResponse.ok) {
        router.push("/admin/login");
        return;
      }
      const authData = await authResponse.json();
      setAdmin(authData.admin);

      // Fetch stats
      const statsResponse = await fetch("/api/admin/stats");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("pt-BR").format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-800 border-r border-slate-700 flex-col">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-slate-800 border-slate-700 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            {/* Title */}
            <div>
              <h1 className="text-xl font-semibold text-white">Painel Administrativo</h1>
              <p className="text-sm text-slate-400">
                Bem-vindo, {admin?.name}
              </p>
            </div>

            {/* Role Badge */}
            <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30 capitalize">
              {admin?.role === "super_admin" ? "Super Admin" : admin?.role}
            </Badge>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Total de Clientes
                </CardTitle>
                <Users className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.totalCustomers)}</div>
                <div className="flex items-center mt-1">
                  {stats.customersGrowth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-emerald-400 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
                  )}
                  <span className={`text-xs ${stats.customersGrowth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {stats.customersGrowth >= 0 ? "+" : ""}{stats.customersGrowth}% este mês
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Receita Mensal
                </CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatCurrency(stats.monthlyRevenue)}</div>
                <p className="text-xs text-slate-400 mt-1">Receita recorrente</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Contas de Email
                </CardTitle>
                <Mail className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.totalEmailAccounts)}</div>
                <p className="text-xs text-slate-400 mt-1">{formatNumber(stats.totalDomains)} domínios</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Faturas Pendentes
                </CardTitle>
                <CreditCard className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.pendingInvoices)}</div>
                <p className="text-xs text-slate-400 mt-1">Aguardando pagamento</p>
              </CardContent>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Partners Section */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Parceiros/Revendedores</CardTitle>
                    <CardDescription className="text-slate-400">
                      Empresas que vendem seus serviços
                    </CardDescription>
                  </div>
                  <Link href="/admin/partners">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      Ver Todos
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900 rounded-lg text-center">
                    <p className="text-3xl font-bold text-white">{stats.totalPartners}</p>
                    <p className="text-sm text-slate-400">Total</p>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-lg text-center">
                    <p className="text-3xl font-bold text-emerald-400">{stats.activePartners}</p>
                    <p className="text-sm text-slate-400">Ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Section */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Ações Rápidas</CardTitle>
                <CardDescription className="text-slate-400">
                  Acesse rapidamente as principais funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/admin/customers">
                    <Card className="bg-slate-900 border-slate-700 hover:border-emerald-600/50 cursor-pointer transition-colors">
                      <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-white font-medium">Clientes</p>
                        <p className="text-xs text-slate-400 mt-1">Gerenciar</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/admin/partners">
                    <Card className="bg-slate-900 border-slate-700 hover:border-emerald-600/50 cursor-pointer transition-colors">
                      <CardContent className="p-4 text-center">
                        <Building2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-white font-medium">Parceiros</p>
                        <p className="text-xs text-slate-400 mt-1">Gerenciar</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/admin/plans">
                    <Card className="bg-slate-900 border-slate-700 hover:border-emerald-600/50 cursor-pointer transition-colors">
                      <CardContent className="p-4 text-center">
                        <CreditCard className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-white font-medium">Planos</p>
                        <p className="text-xs text-slate-400 mt-1">Configurar</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/admin/settings">
                    <Card className="bg-slate-900 border-slate-700 hover:border-emerald-600/50 cursor-pointer transition-colors">
                      <CardContent className="p-4 text-center">
                        <Settings className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-white font-medium">Configurações</p>
                        <p className="text-xs text-slate-400 mt-1">Sistema</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Summary */}
          <Card className="bg-slate-800 border-slate-700 mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-400" />
                    Status do Sistema
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Visão geral da saúde do sistema
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-slate-900 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-400">99.9%</p>
                  <p className="text-sm text-slate-400 mt-1">Uptime</p>
                </div>
                <div className="text-center p-4 bg-slate-900 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-400">{stats.activeCustomers}</p>
                  <p className="text-sm text-slate-400 mt-1">Clientes Ativos</p>
                </div>
                <div className="text-center p-4 bg-slate-900 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-400">0</p>
                  <p className="text-sm text-slate-400 mt-1">Incidentes</p>
                </div>
                <div className="text-center p-4 bg-slate-900 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-400">Online</p>
                  <p className="text-sm text-slate-400 mt-1">Mailu Server</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
