"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  Mail,
  Globe,
  FileText,
  Settings,
  HeadphonesIcon,
  LogOut,
  Menu,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

interface DashboardStats {
  emailsSent: number;
  emailsReceived: number;
  storageUsed: number;
  storageLimit: number;
  emailAccounts: number;
  accountsLimit: number;
}

interface Domain {
  id: string;
  domain: string;
  isVerified: boolean;
  dkimVerified: boolean;
  spfVerified: boolean;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
  { icon: Mail, label: "Emails", href: "/dashboard/emails" },
  { icon: Globe, label: "Domínios", href: "/dashboard/domains" },
  { icon: FileText, label: "Faturas", href: "/dashboard/invoices" },
  { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
  { icon: HeadphonesIcon, label: "Suporte", href: "/dashboard/support" },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/login");
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
        <Link href="/" className="flex items-center space-x-2">
          <img src="/logo.svg" alt="IsaMail" className="h-8 w-8" />
          <span className="text-xl font-bold text-white">IsaMail</span>
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

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    emailsSent: 0,
    emailsReceived: 0,
    storageUsed: 0,
    storageLimit: 5000000000,
    emailAccounts: 0,
    accountsLimit: 1,
  });
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Erro ao carregar dados");
      }

      const data = await response.json();
      setUser(data.user);
      setStats(data.stats);
      setDomains(data.domains);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("pt-BR").format(num);
  };

  const getPlanLabel = (plan: string) => {
    const plans: Record<string, string> = {
      basic: "Basic",
      standard: "Standard",
      premium: "Premium",
      enterprise: "Enterprise",
    };
    return plans[plan] || plan;
  };

  const storagePercentage = (stats.storageUsed / stats.storageLimit) * 100;

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
              <h1 className="text-xl font-semibold text-white">Dashboard</h1>
              <p className="text-sm text-slate-400">
                Bem-vindo, {user?.name}
              </p>
            </div>

            {/* Plan Badge */}
            <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">
              Plano {getPlanLabel(user?.subscription?.plan || "basic")}
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
                  Emails Enviados
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.emailsSent)}</div>
                <p className="text-xs text-slate-400 mt-1">Este mês</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Emails Recebidos
                </CardTitle>
                <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.emailsReceived)}</div>
                <p className="text-xs text-slate-400 mt-1">Este mês</p>
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
                <div className="text-2xl font-bold text-white">
                  {stats.emailAccounts} / {stats.accountsLimit === -1 ? "∞" : stats.accountsLimit}
                </div>
                <p className="text-xs text-slate-400 mt-1">Contas ativas</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Armazenamento
                </CardTitle>
                <HardDrive className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatBytes(stats.storageUsed)}
                </div>
                <Progress value={storagePercentage} className="mt-2 h-2" />
                <p className="text-xs text-slate-400 mt-1">
                  de {stats.storageLimit === -1 ? "Ilimitado" : formatBytes(stats.storageLimit)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Domains Section */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Domínios Configurados</CardTitle>
                    <CardDescription className="text-slate-400">
                      Gerencie seus domínios de email
                    </CardDescription>
                  </div>
                  <Link href="/dashboard/domains">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {domains.length === 0 ? (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Nenhum domínio configurado</p>
                    <Link href="/dashboard/domains">
                      <Button variant="link" className="text-emerald-400 mt-2">
                        Adicionar seu primeiro domínio
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {domains.map((domain) => (
                      <div
                        key={domain.id}
                        className="flex items-center justify-between p-4 bg-slate-900 rounded-lg"
                      >
                        <div>
                          <p className="text-white font-medium">{domain.domain}</p>
                          <div className="flex items-center gap-3 mt-2">
                            {domain.isVerified ? (
                              <span className="flex items-center text-xs text-emerald-400">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verificado
                              </span>
                            ) : (
                              <span className="flex items-center text-xs text-yellow-400">
                                <Clock className="h-3 w-3 mr-1" />
                                Pendente
                              </span>
                            )}
                            {domain.dkimVerified && (
                              <span className="text-xs text-slate-400">DKIM</span>
                            )}
                            {domain.spfVerified && (
                              <span className="text-xs text-slate-400">SPF</span>
                            )}
                          </div>
                        </div>
                        <Link href={`/dashboard/domains?id=${domain.id}`}>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            Configurar
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
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
                  <Link href="/dashboard/emails">
                    <Card className="bg-slate-900 border-slate-700 hover:border-emerald-600/50 cursor-pointer transition-colors">
                      <CardContent className="p-4 text-center">
                        <Mail className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-white font-medium">Criar Email</p>
                        <p className="text-xs text-slate-400 mt-1">Nova conta de email</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/dashboard/domains">
                    <Card className="bg-slate-900 border-slate-700 hover:border-emerald-600/50 cursor-pointer transition-colors">
                      <CardContent className="p-4 text-center">
                        <Globe className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-white font-medium">Domínios</p>
                        <p className="text-xs text-slate-400 mt-1">Configurar DNS</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/dashboard/invoices">
                    <Card className="bg-slate-900 border-slate-700 hover:border-emerald-600/50 cursor-pointer transition-colors">
                      <CardContent className="p-4 text-center">
                        <FileText className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-white font-medium">Faturas</p>
                        <p className="text-xs text-slate-400 mt-1">Ver faturas</p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/dashboard/support">
                    <Card className="bg-slate-900 border-slate-700 hover:border-emerald-600/50 cursor-pointer transition-colors">
                      <CardContent className="p-4 text-center">
                        <HeadphonesIcon className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-white font-medium">Suporte</p>
                        <p className="text-xs text-slate-400 mt-1">Obter ajuda</p>
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
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    Resumo de Atividade
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Estatísticas dos últimos 30 dias
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-slate-900 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-400">98.5%</p>
                  <p className="text-sm text-slate-400 mt-1">Taxa de Entrega</p>
                </div>
                <div className="text-center p-4 bg-slate-900 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-400">0.1%</p>
                  <p className="text-sm text-slate-400 mt-1">Taxa de Spam</p>
                </div>
                <div className="text-center p-4 bg-slate-900 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-400">99.9%</p>
                  <p className="text-sm text-slate-400 mt-1">Uptime</p>
                </div>
                <div className="text-center p-4 bg-slate-900 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-400">0</p>
                  <p className="text-sm text-slate-400 mt-1">Incidentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
