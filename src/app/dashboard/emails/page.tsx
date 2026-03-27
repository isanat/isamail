"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Mail,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Key,
  LogOut,
  Menu,
  Globe,
  FileText,
  Settings,
  HeadphonesIcon,
  LayoutDashboard,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";

interface EmailAccount {
  id: string;
  email: string;
  displayName: string | null;
  quotaUsed: number;
  quotaLimit: number;
  isActive: boolean;
  mailuSynced: boolean;
  createdAt: string;
  domain: {
    id: string;
    domain: string;
  };
}

interface Domain {
  id: string;
  domain: string;
  isVerified: boolean;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Mail, label: "Emails", href: "/dashboard/emails", active: true },
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

export default function EmailsPage() {
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState({ localPart: "", domainId: "", password: "" });
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/dashboard/emails");
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Erro ao carregar dados");
      }
      const data = await response.json();
      setEmailAccounts(data.emailAccounts || []);
      setDomains(data.domains || []);
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as contas de email.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmail = async () => {
    if (!newEmail.localPart || !newEmail.domainId || !newEmail.password) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos.",
      });
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/dashboard/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmail),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar conta");
      }

      toast({
        title: "Sucesso",
        description: "Conta de email criada com sucesso!",
      });
      setCreateDialogOpen(false);
      setNewEmail({ localPart: "", domainId: "", password: "" });
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar conta",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    try {
      const response = await fetch(`/api/dashboard/emails/${emailId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir conta");
      }

      toast({
        title: "Sucesso",
        description: "Conta de email excluída com sucesso!",
      });
      fetchData();
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir a conta.",
      });
    }
  };

  const handleResetPassword = async (emailId: string) => {
    try {
      const response = await fetch(`/api/dashboard/emails/${emailId}/reset-password`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erro ao resetar senha");
      }

      const data = await response.json();
      toast({
        title: "Senha resetada",
        description: `Nova senha: ${data.newPassword}`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível resetar a senha.",
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredEmails = emailAccounts.filter((email) =>
    email.email.toLowerCase().includes(search.toLowerCase())
  );

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
              <h1 className="text-xl font-semibold text-white">Contas de Email</h1>
              <p className="text-sm text-slate-400">
                Gerencie suas contas de email
              </p>
            </div>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Conta
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Criar Nova Conta de Email</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Crie uma nova conta de email para seu domínio
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Nome de usuário</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="nome"
                        value={newEmail.localPart}
                        onChange={(e) => setNewEmail({ ...newEmail, localPart: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                      <span className="flex items-center text-slate-400">@</span>
                      <Select
                        value={newEmail.domainId}
                        onValueChange={(value) => setNewEmail({ ...newEmail, domainId: value })}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white w-48">
                          <SelectValue placeholder="Domínio" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {domains.filter((d) => d.isVerified).map((domain) => (
                            <SelectItem key={domain.id} value={domain.id}>
                              {domain.domain}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Senha</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={newEmail.password}
                      onChange={(e) => setNewEmail({ ...newEmail, password: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className="border-slate-700 text-slate-300"
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleCreateEmail}
                    disabled={creating}
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Criar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar contas de email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white pl-10"
              />
            </div>
          </div>

          {/* Email Accounts List */}
          {filteredEmails.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="py-12 text-center">
                <Mail className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">Nenhuma conta de email encontrada</p>
                <p className="text-sm text-slate-500">
                  {domains.filter((d) => d.isVerified).length === 0
                    ? "Verifique um domínio primeiro para criar contas"
                    : "Clique em 'Nova Conta' para criar sua primeira conta"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEmails.map((account) => (
                <Card key={account.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{account.email}</p>
                          <div className="flex items-center gap-3 mt-1">
                            {account.isActive ? (
                              <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ativo
                              </Badge>
                            ) : (
                              <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                                <XCircle className="h-3 w-3 mr-1" />
                                Inativo
                              </Badge>
                            )}
                            {account.mailuSynced ? (
                              <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                                Sincronizado
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                                <Clock className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
                            <span className="text-sm text-slate-400">
                              {formatBytes(account.quotaUsed)}
                              {account.quotaLimit > 0 && ` / ${formatBytes(account.quotaLimit)}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-white"
                          onClick={() => handleResetPassword(account.id)}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-600/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-800 border-slate-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Excluir conta</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-400">
                                Tem certeza que deseja excluir a conta {account.email}? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-slate-700 text-slate-300">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDeleteEmail(account.id)}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
