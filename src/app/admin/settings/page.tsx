"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  LogOut,
  Menu,
  Shield,
  Save,
  Key,
  Globe2,
  Bell,
  Database,
  Server,
} from "lucide-react";

interface SystemSettings {
  [key: string]: {
    value: string;
    description: string | null;
  };
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Clientes", href: "/admin/customers" },
  { icon: Building2, label: "Parceiros", href: "/admin/partners" },
  { icon: CreditCard, label: "Planos", href: "/admin/plans" },
  { icon: Globe, label: "Domínios", href: "/admin/domains" },
  { icon: Mail, label: "Emails", href: "/admin/emails" },
  { icon: Settings, label: "Configurações", href: "/admin/settings", active: true },
];

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({});
  const [mercadoPagoSettings, setMercadoPagoSettings] = useState({
    accessToken: "",
    publicKey: "",
    webhookSecret: "",
  });
  const [mailuSettings, setMailuSettings] = useState({
    apiUrl: "",
    apiKey: "",
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await response.json();
      
      // Convert array to object for easier access
      const settingsMap: SystemSettings = {};
      (data.settings || []).forEach((s: any) => {
        settingsMap[s.key] = { value: s.value, description: s.description };
      });
      setSettings(settingsMap);

      // Load specific settings
      if (settingsMap.mercadopago_access_token) {
        setMercadoPagoSettings(prev => ({
          ...prev,
          accessToken: settingsMap.mercadopago_access_token.value,
        }));
      }
      if (settingsMap.mercadopago_public_key) {
        setMercadoPagoSettings(prev => ({
          ...prev,
          publicKey: settingsMap.mercadopago_public_key.value,
        }));
      }
      if (settingsMap.mailu_api_url) {
        setMailuSettings(prev => ({
          ...prev,
          apiUrl: settingsMap.mailu_api_url.value,
        }));
      }
      if (settingsMap.mailu_api_key) {
        setMailuSettings(prev => ({
          ...prev,
          apiKey: settingsMap.mailu_api_key.value,
        }));
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (category: string) => {
    setSaving(true);
    try {
      let settingsToSave: { key: string; value: string }[] = [];

      if (category === "general") {
        settingsToSave = [
          { key: "site_name", value: settings.site_name?.value || "IsaMail" },
          { key: "site_url", value: settings.site_url?.value || "" },
          { key: "support_email", value: settings.support_email?.value || "" },
          { key: "trial_days", value: settings.trial_days?.value || "14" },
        ];
      } else if (category === "payment") {
        settingsToSave = [
          { key: "mercadopago_access_token", value: mercadoPagoSettings.accessToken },
          { key: "mercadopago_public_key", value: mercadoPagoSettings.publicKey },
        ];
      } else if (category === "mailu") {
        settingsToSave = [
          { key: "mailu_api_url", value: mailuSettings.apiUrl },
          { key: "mailu_api_key", value: mailuSettings.apiKey },
        ];
      }

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (!response.ok) throw new Error("Erro ao salvar configurações");

      toast({
        title: "Configurações salvas!",
        description: "As configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
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
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-800 border-r border-slate-700 flex-col">
        <div className="p-6 border-b border-slate-700">
          <Link href="/admin" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-emerald-400" />
            <div>
              <span className="text-xl font-bold text-white">IsaMail</span>
              <Badge className="ml-2 bg-emerald-600/20 text-emerald-400 text-xs">Admin</Badge>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
      </aside>

      {/* Main Content */}
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
                {/* Mobile menu content */}
              </SheetContent>
            </Sheet>

            <div>
              <h1 className="text-xl font-semibold text-white">Configurações do Sistema</h1>
              <p className="text-sm text-slate-400">Gerencie as configurações gerais</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="general" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400">
                <Globe2 className="h-4 w-4 mr-2" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="payment" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400">
                <Key className="h-4 w-4 mr-2" />
                Pagamentos
              </TabsTrigger>
              <TabsTrigger value="mailu" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400">
                <Server className="h-4 w-4 mr-2" />
                Mailu API
              </TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400">
                <Database className="h-4 w-4 mr-2" />
                Sistema
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Configurações Gerais</CardTitle>
                  <CardDescription className="text-slate-400">
                    Configurações básicas do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Nome do Site</Label>
                      <Input
                        value={settings.site_name?.value || ""}
                        onChange={(e) => setSettings({ ...settings, site_name: { ...settings.site_name, value: e.target.value } })}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">URL do Site</Label>
                      <Input
                        value={settings.site_url?.value || ""}
                        onChange={(e) => setSettings({ ...settings, site_url: { ...settings.site_url, value: e.target.value } })}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Email de Suporte</Label>
                      <Input
                        value={settings.support_email?.value || ""}
                        onChange={(e) => setSettings({ ...settings, support_email: { ...settings.support_email, value: e.target.value } })}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Dias de Trial</Label>
                      <Input
                        type="number"
                        value={settings.trial_days?.value || "14"}
                        onChange={(e) => setSettings({ ...settings, trial_days: { ...settings.trial_days, value: e.target.value } })}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleSaveSettings("general")} 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Settings */}
            <TabsContent value="payment">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Configurações de Pagamento</CardTitle>
                  <CardDescription className="text-slate-400">
                    Configure a integração com MercadoPago
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Access Token (Produção)</Label>
                    <Input
                      type="password"
                      value={mercadoPagoSettings.accessToken}
                      onChange={(e) => setMercadoPagoSettings({ ...mercadoPagoSettings, accessToken: e.target.value })}
                      placeholder="APP_USR-..."
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                    <p className="text-xs text-slate-400">
                      Token de acesso para a API do MercadoPago
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Public Key</Label>
                    <Input
                      type="password"
                      value={mercadoPagoSettings.publicKey}
                      onChange={(e) => setMercadoPagoSettings({ ...mercadoPagoSettings, publicKey: e.target.value })}
                      placeholder="APP_USR-..."
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                    <p className="text-xs text-slate-400">
                      Chave pública para o frontend
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-lg">
                    <p className="text-sm text-slate-300">
                      <strong>Webhook URL:</strong> https://isamail.space/api/payment/webhook
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure esta URL no painel do MercadoPago para receber notificações de pagamento
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleSaveSettings("payment")} 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mailu API Settings */}
            <TabsContent value="mailu">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Configurações Mailu API</CardTitle>
                  <CardDescription className="text-slate-400">
                    Configure a conexão com o servidor de email Mailu
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">API URL</Label>
                    <Input
                      value={mailuSettings.apiUrl}
                      onChange={(e) => setMailuSettings({ ...mailuSettings, apiUrl: e.target.value })}
                      placeholder="https://mail.isamail.space/api/v1"
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                    <p className="text-xs text-slate-400">
                      URL da API do Mailu (geralmente https://mail.seudominio.com/api/v1)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">API Key / Token</Label>
                    <Input
                      type="password"
                      value={mailuSettings.apiKey}
                      onChange={(e) => setMailuSettings({ ...mailuSettings, apiKey: e.target.value })}
                      placeholder="Bearer token ou API key"
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                    <p className="text-xs text-slate-400">
                      Token de autenticação gerado no painel administrativo do Mailu
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-lg">
                    <p className="text-sm font-medium text-white mb-2">Como obter o token:</p>
                    <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
                      <li>Acesse https://mail.isamail.space/admin/</li>
                      <li>Faça login como administrador</li>
                      <li>Vá em "Mailu API" ou "Admin API Tokens"</li>
                      <li>Crie um novo token com todas as permissões</li>
                      <li>Copie o token gerado</li>
                    </ol>
                  </div>
                  <Button 
                    onClick={() => handleSaveSettings("mailu")} 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Info */}
            <TabsContent value="system">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Informações do Sistema</CardTitle>
                  <CardDescription className="text-slate-400">
                    Status e informações técnicas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900 rounded-lg">
                      <p className="text-sm text-slate-400">Versão do Sistema</p>
                      <p className="text-lg font-medium text-white">1.0.0</p>
                    </div>
                    <div className="p-4 bg-slate-900 rounded-lg">
                      <p className="text-sm text-slate-400">Framework</p>
                      <p className="text-lg font-medium text-white">Next.js 16</p>
                    </div>
                    <div className="p-4 bg-slate-900 rounded-lg">
                      <p className="text-sm text-slate-400">Banco de Dados</p>
                      <p className="text-lg font-medium text-white">SQLite / Prisma</p>
                    </div>
                    <div className="p-4 bg-slate-900 rounded-lg">
                      <p className="text-sm text-slate-400">Email Server</p>
                      <p className="text-lg font-medium text-white">Mailu 2024.06</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-white mb-4">Inicialização do Sistema</h3>
                    <p className="text-sm text-slate-400 mb-4">
                      Clique no botão abaixo para criar o usuário administrador padrão e os planos iniciais.
                      <strong className="text-yellow-400"> Apenas execute se for a primeira vez.</strong>
                    </p>
                    <Button 
                      variant="outline"
                      className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/admin/seed", { method: "POST" });
                          const data = await response.json();
                          
                          if (response.ok) {
                            toast({
                              title: "Sistema inicializado!",
                              description: `Admin: ${data.admin.email} | Senha: ${data.admin.password}`,
                            });
                          } else {
                            throw new Error(data.error);
                          }
                        } catch (error: any) {
                          toast({
                            variant: "destructive",
                            title: "Erro",
                            description: error.message || "Erro ao inicializar",
                          });
                        }
                      }}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Inicializar Sistema
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
