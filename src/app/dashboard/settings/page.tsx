"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  LogOut,
  Menu,
  Mail,
  Globe,
  FileText,
  HeadphonesIcon,
  LayoutDashboard,
  Loader2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Mail, label: "Emails", href: "/dashboard/emails" },
  { icon: Globe, label: "Domínios", href: "/dashboard/domains" },
  { icon: FileText, label: "Faturas", href: "/dashboard/invoices" },
  { icon: SettingsIcon, label: "Configurações", href: "/dashboard/settings", active: true },
  { icon: HeadphonesIcon, label: "Suporte", href: "/dashboard/support" },
];

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notifications: boolean;
  subscription?: {
    plan: string;
    status: string;
    billingCycle: string;
    currentPeriodEnd: string;
  };
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.push("/login");
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível fazer logout.",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-700">
        <Link href="/" className="flex items-center space-x-2">
          <img src="/logo.svg" alt="IsaMail" className="h-8 w-8" />
          <span className="text-xl font-bold text-white">IsaMail</span>
        </Link>
      </div>
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

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [notifications, setNotifications] = useState(true);
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
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
      setProfile({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || "",
      });
      setNotifications(data.user.notifications);
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/dashboard/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao salvar");
      }

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
      fetchUser();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar perfil",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem.",
      });
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch("/api/dashboard/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao alterar senha");
      }

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao alterar senha",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    try {
      const response = await fetch("/api/dashboard/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications: enabled }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar notificações");
      }

      setNotifications(enabled);
      toast({
        title: "Sucesso",
        description: `Notificações ${enabled ? "ativadas" : "desativadas"}.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar as notificações.",
      });
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-800 border-r border-slate-700 flex-col">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
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

            <div>
              <h1 className="text-xl font-semibold text-white">Configurações</h1>
              <p className="text-sm text-slate-400">
                Gerencie sua conta e preferências
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Profile Section */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Informações do Perfil</CardTitle>
                    <CardDescription className="text-slate-400">
                      Atualize suas informações pessoais
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Nome</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                  <p className="text-xs text-slate-500">
                    O email é usado para login e recuperação de senha
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Telefone</Label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>

            {/* Password Section */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center">
                    <Lock className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Alterar Senha</CardTitle>
                    <CardDescription className="text-slate-400">
                      Mantenha sua conta segura
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwords.currentPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, currentPassword: e.target.value })
                      }
                      className="bg-slate-900 border-slate-700 text-white pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords({ ...passwords, newPassword: e.target.value })
                      }
                      className="bg-slate-900 border-slate-700 text-white pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Confirmar Nova Senha</Label>
                  <Input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirmPassword: e.target.value })
                    }
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  Alterar Senha
                </Button>
              </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center">
                    <Bell className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Notificações</CardTitle>
                    <CardDescription className="text-slate-400">
                      Gerencie suas preferências de notificação
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Notificações por Email</p>
                    <p className="text-sm text-slate-400">
                      Receba atualizações sobre sua conta e faturas
                    </p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={handleToggleNotifications}
                  />
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Alertas de Segurança</p>
                    <p className="text-sm text-slate-400">
                      Notificações sobre atividades suspeitas
                    </p>
                  </div>
                  <Switch checked={true} disabled />
                </div>
              </CardContent>
            </Card>

            {/* Subscription Info */}
            {user?.subscription && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Assinatura</CardTitle>
                  <CardDescription className="text-slate-400">
                    Informações do seu plano atual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        Plano {getPlanLabel(user.subscription.plan)}
                      </p>
                      <p className="text-sm text-slate-400">
                        {user.subscription.billingCycle === "monthly" ? "Mensal" : "Anual"} • 
                        Renova em {new Date(user.subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Link href="/checkout">
                      <Button variant="outline" className="border-slate-700 text-slate-300">
                        Alterar Plano
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
