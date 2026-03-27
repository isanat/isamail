"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Plus,
  Edit,
  Check,
  X,
  Shield,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  emailAccounts: number;
  storagePerAccount: number;
  features: string;
  isActive: boolean;
  sortOrder: number;
  _count: { subscriptions: number };
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Clientes", href: "/admin/customers" },
  { icon: Building2, label: "Parceiros", href: "/admin/partners" },
  { icon: CreditCard, label: "Planos", href: "/admin/plans", active: true },
  { icon: Globe, label: "Domínios", href: "/admin/domains" },
  { icon: Mail, label: "Emails", href: "/admin/emails" },
  { icon: Settings, label: "Configurações", href: "/admin/settings" },
];

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    monthlyPrice: "0",
    yearlyPrice: "0",
    emailAccounts: "1",
    storagePerAccount: "5",
    features: [] as string[],
    sortOrder: "0",
  });
  const [newFeature, setNewFeature] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/admin/plans");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os planos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      displayName: "",
      description: "",
      monthlyPrice: "0",
      yearlyPrice: "0",
      emailAccounts: "1",
      storagePerAccount: "5",
      features: [],
      sortOrder: "0",
    });
    setEditingPlan(null);
    setNewFeature("");
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description || "",
      monthlyPrice: plan.monthlyPrice.toString(),
      yearlyPrice: plan.yearlyPrice.toString(),
      emailAccounts: plan.emailAccounts.toString(),
      storagePerAccount: plan.storagePerAccount.toString(),
      features: JSON.parse(plan.features || "[]"),
      sortOrder: plan.sortOrder.toString(),
    });
    setDialogOpen(true);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  };

  const handleSubmit = async () => {
    try {
      const url = editingPlan ? `/api/admin/plans` : "/api/admin/plans";
      const method = editingPlan ? "PUT" : "POST";
      const body = editingPlan 
        ? { id: editingPlan.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar plano");
      }

      toast({
        title: editingPlan ? "Plano atualizado!" : "Plano criado!",
        description: `O plano foi ${editingPlan ? "atualizado" : "criado"} com sucesso.`,
      });

      setDialogOpen(false);
      resetForm();
      fetchPlans();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    }
  };

  const togglePlanStatus = async (planId: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: planId, isActive }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar status");

      toast({
        title: "Status atualizado!",
        description: `Plano ${isActive ? "ativado" : "desativado"}.`,
      });

      fetchPlans();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status.",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
              <h1 className="text-xl font-semibold text-white">Gestão de Planos</h1>
              <p className="text-sm text-slate-400">Configure os planos disponíveis</p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingPlan ? "Editar Plano" : "Novo Plano"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Configure os detalhes do plano
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Nome (identificador)</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s/g, "_") })}
                        placeholder="basic"
                        disabled={!!editingPlan}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Nome de Exibição</Label>
                      <Input
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        placeholder="Basic"
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Descrição</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição do plano..."
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Preço Mensal (R$)</Label>
                      <Input
                        type="number"
                        value={formData.monthlyPrice}
                        onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Preço Anual (R$)</Label>
                      <Input
                        type="number"
                        value={formData.yearlyPrice}
                        onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Contas de Email (-1 = ilimitado)</Label>
                      <Input
                        type="number"
                        value={formData.emailAccounts}
                        onChange={(e) => setFormData({ ...formData, emailAccounts: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Armazenamento/Conta (GB, -1 = ilimitado)</Label>
                      <Input
                        type="number"
                        value={formData.storagePerAccount}
                        onChange={(e) => setFormData({ ...formData, storagePerAccount: e.target.value })}
                        className="bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Recursos</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Adicionar recurso..."
                        className="bg-slate-900 border-slate-700 text-white"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                      />
                      <Button type="button" onClick={addFeature} variant="outline" className="border-slate-600 text-white">
                        Adicionar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="border-slate-600 text-slate-300 pr-1">
                          {feature}
                          <button onClick={() => removeFeature(index)} className="ml-2 hover:text-red-400">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="border-slate-600 text-white">
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
                    {editingPlan ? "Atualizar" : "Criar Plano"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`bg-slate-800 border-slate-700 flex flex-col ${!plan.isActive ? "opacity-60" : ""}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{plan.displayName}</CardTitle>
                    <Switch
                      checked={plan.isActive}
                      onCheckedChange={(checked) => togglePlanStatus(plan.id, checked)}
                    />
                  </div>
                  <CardDescription className="text-slate-400">
                    {plan.description || `Plano ${plan.displayName}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-center mb-4">
                    <span className="text-3xl font-bold text-white">
                      {formatCurrency(plan.monthlyPrice)}
                    </span>
                    <span className="text-slate-400">/mês</span>
                    <p className="text-sm text-emerald-400 mt-1">
                      {formatCurrency(plan.yearlyPrice)}/ano
                    </p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Contas de email:</span>
                      <span className="text-white">
                        {plan.emailAccounts === -1 ? "Ilimitado" : plan.emailAccounts}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Armazenamento:</span>
                      <span className="text-white">
                        {plan.storagePerAccount === -1 ? "Ilimitado" : `${plan.storagePerAccount}GB`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Assinantes:</span>
                      <span className="text-white">{plan._count.subscriptions}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {(JSON.parse(plan.features || "[]") as string[]).slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {(JSON.parse(plan.features || "[]") as string[]).length > 4 && (
                      <li className="text-sm text-slate-400">
                        +{(JSON.parse(plan.features || "[]") as string[]).length - 4} mais recursos
                      </li>
                    )}
                  </ul>

                  <Button 
                    variant="outline" 
                    className="w-full border-slate-600 text-white hover:bg-slate-700"
                    onClick={() => openEditDialog(plan)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Plano
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {plans.length === 0 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="text-center py-12">
                <CreditCard className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Nenhum plano cadastrado</p>
                <p className="text-sm text-slate-500 mt-2">
                  Clique em "Novo Plano" para adicionar
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
