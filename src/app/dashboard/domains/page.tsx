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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Globe,
  Plus,
  Search,
  Trash2,
  LogOut,
  Menu,
  Mail,
  FileText,
  Settings,
  HeadphonesIcon,
  LayoutDashboard,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Copy,
  ExternalLink,
  RefreshCw,
  Shield,
} from "lucide-react";

interface Domain {
  id: string;
  domain: string;
  isVerified: boolean;
  isIsamailSubdomain: boolean;
  dkimVerified: boolean;
  spfVerified: boolean;
  dmarcVerified: boolean;
  mxVerified: boolean;
  dkimPublicKey: string | null;
  lastDnsCheck: string | null;
  createdAt: string;
  _count?: {
    emailAccounts: number;
  };
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Mail, label: "Emails", href: "/dashboard/emails" },
  { icon: Globe, label: "Domínios", href: "/dashboard/domains", active: true },
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

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await fetch("/api/dashboard/domains");
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Erro ao carregar domínios");
      }
      const data = await response.json();
      setDomains(data.domains || []);
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os domínios.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite um domínio válido.",
      });
      return;
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(newDomain)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Formato de domínio inválido.",
      });
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/dashboard/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao adicionar domínio");
      }

      toast({
        title: "Sucesso",
        description: "Domínio adicionado! Configure os registros DNS para verificar.",
      });
      setCreateDialogOpen(false);
      setNewDomain("");
      fetchDomains();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao adicionar domínio",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    try {
      const response = await fetch(`/api/dashboard/domains/${domainId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir domínio");
      }

      toast({
        title: "Sucesso",
        description: "Domínio excluído com sucesso!",
      });
      fetchDomains();
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o domínio.",
      });
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      const response = await fetch(`/api/dashboard/domains/${domainId}/verify`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erro ao verificar domínio");
      }

      const data = await response.json();
      toast({
        title: "Verificação concluída",
        description: data.verified
          ? "Domínio verificado com sucesso!"
          : "Verificação pendente. Verifique os registros DNS.",
      });
      fetchDomains();
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível verificar o domínio.",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
  };

  const getDNSRecords = (domain: Domain) => {
    const mxRecord = {
      type: "MX",
      name: "@",
      value: "mail.isamail.space",
      priority: 10,
    };
    const spfRecord = {
      type: "TXT",
      name: "@",
      value: "v=spf1 mx a:mail.isamail.space ~all",
    };
    const dkimRecord = domain.dkimPublicKey
      ? {
          type: "TXT",
          name: "dkim._domainkey",
          value: `v=DKIM1; k=rsa; p=${domain.dkimPublicKey}`,
        }
      : null;
    const dmarcRecord = {
      type: "TXT",
      name: "_dmarc",
      value: `v=DMARC1; p=quarantine; rua=mailto:postmaster@${domain.domain}`,
    };

    return { mxRecord, spfRecord, dkimRecord, dmarcRecord };
  };

  const filteredDomains = domains.filter((domain) =>
    domain.domain.toLowerCase().includes(search.toLowerCase())
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
              <h1 className="text-xl font-semibold text-white">Domínios</h1>
              <p className="text-sm text-slate-400">
                Gerencie seus domínios e configure DNS
              </p>
            </div>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Domínio
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Adicionar Novo Domínio</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Digite o domínio que deseja usar para seus emails
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Domínio</Label>
                    <Input
                      placeholder="exemplo.com.br"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                    <p className="text-xs text-slate-500">
                      Você precisará configurar os registros DNS deste domínio
                    </p>
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
                    onClick={handleAddDomain}
                    disabled={creating}
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Adicionar
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
                placeholder="Buscar domínios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white pl-10"
              />
            </div>
          </div>

          {/* Domains List */}
          {filteredDomains.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="py-12 text-center">
                <Globe className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">Nenhum domínio configurado</p>
                <p className="text-sm text-slate-500">
                  Clique em &apos;Adicionar Domínio&apos; para começar
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredDomains.map((domain) => (
                <Card key={domain.id} className="bg-slate-800 border-slate-700">
                  <Accordion type="single" collapsible>
                    <AccordionItem value={`domain-${domain.id}`} className="border-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center">
                              <Globe className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="text-left">
                              <p className="text-white font-medium">{domain.domain}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {domain.isVerified ? (
                                  <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verificado
                                  </Badge>
                                ) : (
                                  <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pendente
                                  </Badge>
                                )}
                                {domain.isIsamailSubdomain && (
                                  <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                                    Subdomínio IsaMail
                                  </Badge>
                                )}
                                <span className="text-sm text-slate-400">
                                  {domain._count?.emailAccounts || 0} contas
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6">
                        {!domain.isIsamailSubdomain && (
                          <>
                            {/* DNS Status */}
                            <div className="mb-6">
                              <h4 className="text-sm font-medium text-white mb-3">Status DNS</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-900 rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">MX</span>
                                    {domain.mxVerified ? (
                                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-400" />
                                    )}
                                  </div>
                                </div>
                                <div className="bg-slate-900 rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">SPF</span>
                                    {domain.spfVerified ? (
                                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-400" />
                                    )}
                                  </div>
                                </div>
                                <div className="bg-slate-900 rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">DKIM</span>
                                    {domain.dkimVerified ? (
                                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-400" />
                                    )}
                                  </div>
                                </div>
                                <div className="bg-slate-900 rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-sm">DMARC</span>
                                    {domain.dmarcVerified ? (
                                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-400" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* DNS Records */}
                            <div className="mb-6">
                              <h4 className="text-sm font-medium text-white mb-3">Registros DNS para Configurar</h4>
                              <div className="bg-slate-900 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-slate-700">
                                    <tr>
                                      <th className="text-left text-slate-300 px-4 py-2">Tipo</th>
                                      <th className="text-left text-slate-300 px-4 py-2">Nome</th>
                                      <th className="text-left text-slate-300 px-4 py-2">Valor</th>
                                      <th className="w-10"></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(() => {
                                      const records = getDNSRecords(domain);
                                      return (
                                        <>
                                          <tr className="border-t border-slate-700">
                                            <td className="text-emerald-400 px-4 py-3">{records.mxRecord.type}</td>
                                            <td className="text-white px-4 py-3">{records.mxRecord.name}</td>
                                            <td className="text-slate-300 px-4 py-3">{records.mxRecord.priority} {records.mxRecord.value}</td>
                                            <td className="px-4 py-3">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 text-slate-400"
                                                onClick={() => copyToClipboard(`${records.mxRecord.priority} ${records.mxRecord.value}`)}
                                              >
                                                <Copy className="h-4 w-4" />
                                              </Button>
                                            </td>
                                          </tr>
                                          <tr className="border-t border-slate-700">
                                            <td className="text-emerald-400 px-4 py-3">{records.spfRecord.type}</td>
                                            <td className="text-white px-4 py-3">{records.spfRecord.name}</td>
                                            <td className="text-slate-300 px-4 py-3 font-mono text-xs">{records.spfRecord.value}</td>
                                            <td className="px-4 py-3">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 text-slate-400"
                                                onClick={() => copyToClipboard(records.spfRecord.value)}
                                              >
                                                <Copy className="h-4 w-4" />
                                              </Button>
                                            </td>
                                          </tr>
                                          {records.dkimRecord && (
                                            <tr className="border-t border-slate-700">
                                              <td className="text-emerald-400 px-4 py-3">{records.dkimRecord.type}</td>
                                              <td className="text-white px-4 py-3">{records.dkimRecord.name}</td>
                                              <td className="text-slate-300 px-4 py-3 font-mono text-xs truncate max-w-xs">{records.dkimRecord.value.substring(0, 50)}...</td>
                                              <td className="px-4 py-3">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-6 w-6 p-0 text-slate-400"
                                                  onClick={() => copyToClipboard(records.dkimRecord!.value)}
                                                >
                                                  <Copy className="h-4 w-4" />
                                                </Button>
                                              </td>
                                            </tr>
                                          )}
                                          <tr className="border-t border-slate-700">
                                            <td className="text-emerald-400 px-4 py-3">{records.dmarcRecord.type}</td>
                                            <td className="text-white px-4 py-3">{records.dmarcRecord.name}</td>
                                            <td className="text-slate-300 px-4 py-3 font-mono text-xs">{records.dmarcRecord.value}</td>
                                            <td className="px-4 py-3">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 text-slate-400"
                                                onClick={() => copyToClipboard(records.dmarcRecord.value)}
                                              >
                                                <Copy className="h-4 w-4" />
                                              </Button>
                                            </td>
                                          </tr>
                                        </>
                                      );
                                    })()}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!domain.isVerified && !domain.isIsamailSubdomain && (
                            <Button
                              variant="outline"
                              className="border-slate-700 text-slate-300"
                              onClick={() => handleVerifyDomain(domain.id)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Verificar DNS
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 hover:bg-red-600/20"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir Domínio
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-800 border-slate-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Excluir domínio</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  Tem certeza que deseja excluir o domínio {domain.domain}? Todas as contas de email associadas serão excluídas. Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-slate-700 text-slate-300">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDeleteDomain(domain.id)}
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
