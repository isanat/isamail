"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  FileText,
  Download,
  LogOut,
  Menu,
  Mail,
  Globe,
  Settings,
  HeadphonesIcon,
  LayoutDashboard,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  CreditCard,
  Calendar,
  DollarSign,
} from "lucide-react";

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  plan: string;
  billingCycle: string;
  dueDate: string;
  paidAt: string | null;
  mercadoPagoId: string | null;
  invoiceUrl: string | null;
  pdfUrl: string | null;
  createdAt: string;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Mail, label: "Emails", href: "/dashboard/emails" },
  { icon: Globe, label: "Domínios", href: "/dashboard/domains" },
  { icon: FileText, label: "Faturas", href: "/dashboard/invoices", active: true },
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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/dashboard/invoices");
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Erro ao carregar faturas");
      }
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as faturas.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pago
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case "cancelled":
      case "refunded":
        return (
          <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-600/20 text-slate-400 border-slate-600/30">
            {status}
          </Badge>
        );
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
              <h1 className="text-xl font-semibold text-white">Faturas</h1>
              <p className="text-sm text-slate-400">
                Histórico de pagamentos e faturas
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {invoices.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">Nenhuma fatura encontrada</p>
                <p className="text-sm text-slate-500">
                  Suas faturas aparecerão aqui após assinar um plano
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Total Pago</p>
                        <p className="text-xl font-bold text-white">
                          {formatCurrency(
                            invoices
                              .filter((i) => i.status === "paid")
                              .reduce((sum, i) => sum + i.amount, 0),
                            "BRL"
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-600/20 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Pendente</p>
                        <p className="text-xl font-bold text-white">
                          {invoices.filter((i) => i.status === "pending").length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Total Faturas</p>
                        <p className="text-xl font-bold text-white">{invoices.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Invoices List */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Histórico de Faturas</CardTitle>
                  <CardDescription className="text-slate-400">
                    Todas as suas faturas e pagamentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left text-slate-400 text-sm font-medium pb-3">
                            Fatura
                          </th>
                          <th className="text-left text-slate-400 text-sm font-medium pb-3">
                            Plano
                          </th>
                          <th className="text-left text-slate-400 text-sm font-medium pb-3">
                            Valor
                          </th>
                          <th className="text-left text-slate-400 text-sm font-medium pb-3">
                            Data
                          </th>
                          <th className="text-left text-slate-400 text-sm font-medium pb-3">
                            Status
                          </th>
                          <th className="text-right text-slate-400 text-sm font-medium pb-3">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice) => (
                          <tr
                            key={invoice.id}
                            className="border-b border-slate-700/50 hover:bg-slate-700/30"
                          >
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
                                  <FileText className="h-4 w-4 text-slate-400" />
                                </div>
                                <span className="text-white font-mono text-sm">
                                  #{invoice.id.substring(0, 8)}
                                </span>
                              </div>
                            </td>
                            <td className="py-4">
                              <div>
                                <p className="text-white">{getPlanLabel(invoice.plan)}</p>
                                <p className="text-xs text-slate-400">
                                  {invoice.billingCycle === "monthly" ? "Mensal" : "Anual"}
                                </p>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className="text-white font-medium">
                                {formatCurrency(invoice.amount, invoice.currency)}
                              </span>
                            </td>
                            <td className="py-4">
                              <div>
                                <p className="text-white text-sm">
                                  {formatDate(invoice.createdAt)}
                                </p>
                                {invoice.paidAt && (
                                  <p className="text-xs text-slate-400">
                                    Pago em {formatDate(invoice.paidAt)}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-4">{getStatusBadge(invoice.status)}</td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {invoice.status === "pending" && invoice.invoiceUrl && (
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => window.open(invoice.invoiceUrl!, "_blank")}
                                  >
                                    <CreditCard className="h-4 w-4 mr-1" />
                                    Pagar
                                  </Button>
                                )}
                                {invoice.pdfUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-700 text-slate-300"
                                    onClick={() => window.open(invoice.pdfUrl!, "_blank")}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    PDF
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
