"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Send,
  MessageSquare,
  Phone,
  MailIcon,
  HelpCircle,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Mail, label: "Emails", href: "/dashboard/emails" },
  { icon: Globe, label: "Domínios", href: "/dashboard/domains" },
  { icon: FileText, label: "Faturas", href: "/dashboard/invoices" },
  { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
  { icon: HeadphonesIcon, label: "Suporte", href: "/dashboard/support", active: true },
];

interface UserData {
  id: string;
  name: string;
  email: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

export default function SupportPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível sair.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos.",
      });
      return;
    }

    setSending(true);
    try {
      // Simulate sending (in production, this would create a support ticket)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Mensagem enviada!",
        description: "Responderemos em até 24 horas úteis.",
      });

      setSubject("");
      setMessage("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
      });
    } finally {
      setSending(false);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-800 border-r border-slate-700 flex-col">
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
                <div className="p-6 border-b border-slate-700">
                  <Link href="/" className="flex items-center space-x-2">
                    <img src="/logo.svg" alt="IsaMail" className="h-8 w-8" />
                    <span className="text-xl font-bold text-white">IsaMail</span>
                  </Link>
                </div>
                <nav className="p-4 space-y-1">
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
              </SheetContent>
            </Sheet>

            <div>
              <h1 className="text-xl font-semibold text-white">Suporte</h1>
              <p className="text-sm text-slate-400">Como podemos ajudar?</p>
            </div>

            <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">
              Plano {getPlanLabel(user?.subscription?.plan || "basic")}
            </Badge>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Canais de Atendimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-slate-900 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center">
                      <MailIcon className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Email</p>
                      <p className="text-sm text-slate-400">suporte@isamail.space</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-slate-900 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Chat</p>
                      <p className="text-sm text-slate-400">Seg-Sex: 9h às 18h</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-slate-900 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Telefone</p>
                      <p className="text-sm text-slate-400">+55 (11) 99999-9999</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">FAQ Rápido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-lg">
                    <HelpCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">Como configurar DNS?</p>
                      <p className="text-xs text-slate-400">Acesse Domínios → Configurar</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-lg">
                    <HelpCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">Como criar um email?</p>
                      <p className="text-xs text-slate-400">Acesse Emails → Nova conta</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-lg">
                    <HelpCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">Como fazer upgrade?</p>
                      <p className="text-xs text-slate-400">Acesse Configurações → Plano</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Abrir Chamado</CardTitle>
                  <CardDescription className="text-slate-400">
                    Descreva seu problema ou dúvida. Responderemos em até 24 horas úteis.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-white">
                        Assunto
                      </Label>
                      <Input
                        id="subject"
                        placeholder="Ex: Problema ao configurar domínio"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-white">
                        Mensagem
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Descreva detalhadamente seu problema ou dúvida..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={sending}
                    >
                      {sending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
