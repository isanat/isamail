"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  BarChart3,
  LogOut,
  Menu,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Shield,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  subscription: {
    plan: string;
    status: string;
    billingCycle: string;
  } | null;
  partner: {
    name: string;
  } | null;
  _count: {
    domains: number;
    emailAccounts: number;
    invoices: number;
  };
}

interface Partner {
  id: string;
  name: string;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Clientes", href: "/admin/customers", active: true },
  { icon: Building2, label: "Parceiros", href: "/admin/partners" },
  { icon: CreditCard, label: "Planos", href: "/admin/plans" },
  { icon: Globe, label: "Domínios", href: "/admin/domains" },
  { icon: Mail, label: "Emails", href: "/admin/emails" },
  { icon: Settings, label: "Configurações", href: "/admin/settings" },
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    partnerId: "",
    plan: "basic",
    billingCycle: "monthly",
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
    fetchPartners();
  }, [search, statusFilter]);

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/admin/customers?${params}`);
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os clientes.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await fetch("/api/admin/partners");
      const data = await response.json();
      setPartners(data.partners || []);
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const response = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar cliente");
      }

      toast({
        title: "Cliente criado!",
        description: "O cliente foi cadastrado com sucesso.",
      });

      setDialogOpen(false);
      setNewCustomer({
        name: "",
        email: "",
        password: "",
        phone: "",
        partnerId: "",
        plan: "basic",
        billingCycle: "monthly",
      });
      fetchCustomers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string }> = {
      active: { bg: "bg-emerald-600/20", text: "text-emerald-400" },
      trial: { bg: "bg-blue-600/20", text: "text-blue-400" },
      pending: { bg: "bg-yellow-600/20", text: "text-yellow-400" },
      cancelled: { bg: "bg-red-600/20", text: "text-red-400" },
      expired: { bg: "bg-slate-600/20", text: "text-slate-400" },
    };
    const variant = variants[status] || variants.pending;
    return (
      <Badge className={`${variant.bg} ${variant.text} border-0`}>
        {status === "active" ? "Ativo" : status === "trial" ? "Trial" : status === "cancelled" ? "Cancelado" : status === "expired" ? "Expirado" : "Pendente"}
      </Badge>
    );
  };

  const getPlanLabel = (plan: string) => {
    const labels: Record<string, string> = {
      basic: "Basic",
      standard: "Standard",
      premium: "Premium",
      enterprise: "Enterprise",
    };
    return labels[plan] || plan;
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
              <h1 className="text-xl font-semibold text-white">Gestão de Clientes</h1>
              <p className="text-sm text-slate-400">Gerencie todos os clientes</p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">Novo Cliente</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Cadastre um novo cliente manualmente
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-white">Nome</Label>
                    <Input
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Email</Label>
                    <Input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Senha</Label>
                    <Input
                      type="password"
                      value={newCustomer.password}
                      onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Telefone (opcional)</Label>
                    <Input
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Plano</Label>
                      <Select value={newCustomer.plan} onValueChange={(v) => setNewCustomer({ ...newCustomer, plan: v })}>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Ciclo</Label>
                      <Select value={newCustomer.billingCycle} onValueChange={(v) => setNewCustomer({ ...newCustomer, billingCycle: v })}>
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Parceiro (opcional)</Label>
                    <Select value={newCustomer.partnerId} onValueChange={(v) => setNewCustomer({ ...newCustomer, partnerId: v })}>
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                        <SelectValue placeholder="Nenhum" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {partners.map((partner) => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-600 text-white">
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateCustomer} className="bg-emerald-600 hover:bg-emerald-700">
                    Criar Cliente
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
                placeholder="Buscar por nome ou email..."
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
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-400">Cliente</TableHead>
                    <TableHead className="text-slate-400">Plano</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Parceiro</TableHead>
                    <TableHead className="text-slate-400">Contas</TableHead>
                    <TableHead className="text-slate-400">Cadastro</TableHead>
                    <TableHead className="text-slate-400 w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                        Nenhum cliente encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell>
                          <div>
                            <p className="text-white font-medium">{customer.name}</p>
                            <p className="text-sm text-slate-400">{customer.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {getPlanLabel(customer.subscription?.plan || "basic")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(customer.subscription?.status || "pending")}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {customer.partner?.name || "-"}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {customer._count.emailAccounts} emails / {customer._count.domains} domínios
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {formatDate(customer.createdAt)}
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
                              <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-slate-700">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
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
