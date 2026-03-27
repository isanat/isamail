"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Shield,
  MoreHorizontal,
  DollarSign,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  companyDoc: string | null;
  contactName: string | null;
  commission: number;
  status: string;
  customDomain: string | null;
  notes: string | null;
  createdAt: string;
  _count: { users: number };
  activeCustomers: number;
  monthlyRevenue: number;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Clientes", href: "/admin/customers" },
  { icon: Building2, label: "Parceiros", href: "/admin/partners", active: true },
  { icon: CreditCard, label: "Planos", href: "/admin/plans" },
  { icon: Globe, label: "Domínios", href: "/admin/domains" },
  { icon: Mail, label: "Emails", href: "/admin/emails" },
  { icon: Settings, label: "Configurações", href: "/admin/settings" },
];

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: "",
    email: "",
    phone: "",
    companyDoc: "",
    contactName: "",
    commission: "10",
    customDomain: "",
    notes: "",
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchPartners();
  }, [search, statusFilter]);

  const fetchPartners = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/admin/partners?${params}`);
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await response.json();
      setPartners(data.partners || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os parceiros.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartner = async () => {
    try {
      const response = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPartner),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar parceiro");
      }

      toast({
        title: "Parceiro criado!",
        description: "O parceiro foi cadastrado com sucesso.",
      });

      setDialogOpen(false);
      setNewPartner({
        name: "",
        email: "",
        phone: "",
        companyDoc: "",
        contactName: "",
        commission: "10",
        customDomain: "",
        notes: "",
      });
      fetchPartners();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    }
  };

  const handleUpdateStatus = async (partnerId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/partners/${partnerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar status");

      toast({
        title: "Status atualizado!",
        description: `Parceiro ${status === "active" ? "ativado" : status === "suspended" ? "suspense" : "atualizado"}.`,
      });

      fetchPartners();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string }> = {
      active: { bg: "bg-emerald-600/20", text: "text-emerald-400" },
      pending: { bg: "bg-yellow-600/20", text: "text-yellow-400" },
      suspended: { bg: "bg-red-600/20", text: "text-red-400" },
    };
    const variant = variants[status] || variants.pending;
    return (
      <Badge className={`${variant.bg} ${variant.text} border-0`}>
        {status === "active" ? "Ativo" : status === "suspended" ? "Suspenso" : "Pendente"}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
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
              <h1 className="text-xl font-semibold text-white">Parceiros / Revendedores</h1>
              <p className="text-sm text-slate-400">Empresas que vendem seus serviços</p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Parceiro
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-white">Novo Parceiro</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Cadastre uma empresa parceira/revendedora
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2 col-span-2">
                    <Label className="text-white">Nome da Empresa</Label>
                    <Input
                      value={newPartner.name}
                      onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Email</Label>
                    <Input
                      type="email"
                      value={newPartner.email}
                      onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Telefone</Label>
                    <Input
                      value={newPartner.phone}
                      onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">CNPJ</Label>
                    <Input
                      value={newPartner.companyDoc}
                      onChange={(e) => setNewPartner({ ...newPartner, companyDoc: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Contato</Label>
                    <Input
                      value={newPartner.contactName}
                      onChange={(e) => setNewPartner({ ...newPartner, contactName: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Comissão (%)</Label>
                    <Input
                      type="number"
                      value={newPartner.commission}
                      onChange={(e) => setNewPartner({ ...newPartner, commission: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Domínio Customizado</Label>
                    <Input
                      placeholder="partner.seudominio.com"
                      value={newPartner.customDomain}
                      onChange={(e) => setNewPartner({ ...newPartner, customDomain: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-white">Observações</Label>
                    <Textarea
                      value={newPartner.notes}
                      onChange={(e) => setNewPartner({ ...newPartner, notes: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-600 text-white">
                    Cancelar
                  </Button>
                  <Button onClick={handleCreatePartner} className="bg-emerald-600 hover:bg-emerald-700">
                    Criar Parceiro
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar parceiros..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="suspended">Suspensos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total de Parceiros</p>
                    <p className="text-2xl font-bold text-white">{partners.length}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Parceiros Ativos</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {partners.filter(p => p.status === "active").length}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Receita do Mês</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(partners.reduce((sum, p) => sum + p.monthlyRevenue, 0))}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Partners Table */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-400">Empresa</TableHead>
                    <TableHead className="text-slate-400">Contato</TableHead>
                    <TableHead className="text-slate-400">Comissão</TableHead>
                    <TableHead className="text-slate-400">Clientes</TableHead>
                    <TableHead className="text-slate-400">Receita/Mês</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Cadastro</TableHead>
                    <TableHead className="text-slate-400 w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-slate-400 py-8">
                        Nenhum parceiro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    partners.map((partner) => (
                      <TableRow key={partner.id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell>
                          <div>
                            <p className="text-white font-medium">{partner.name}</p>
                            <p className="text-sm text-slate-400">{partner.email}</p>
                            {partner.customDomain && (
                              <p className="text-xs text-emerald-400">{partner.customDomain}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-slate-300">{partner.contactName || "-"}</p>
                          <p className="text-sm text-slate-400">{partner.phone || ""}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-emerald-600 text-emerald-400">
                            {partner.commission}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {partner.activeCustomers} ativos / {partner._count.users} total
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {formatCurrency(partner.monthlyRevenue)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(partner.status)}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {formatDate(partner.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800 border-slate-700">
                              <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              {partner.status !== "active" && (
                                <DropdownMenuItem 
                                  className="text-emerald-400 hover:text-emerald-300 hover:bg-slate-700"
                                  onClick={() => handleUpdateStatus(partner.id, "active")}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Ativar
                                </DropdownMenuItem>
                              )}
                              {partner.status === "active" && (
                                <DropdownMenuItem 
                                  className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                                  onClick={() => handleUpdateStatus(partner.id, "suspended")}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Suspender
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
