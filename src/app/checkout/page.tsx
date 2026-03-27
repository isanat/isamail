"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  CreditCard,
  Loader2,
  Shield,
  Clock,
  ArrowLeft,
} from "lucide-react";

interface PlanDetails {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  accounts: number | string;
  storage: string;
  popular?: boolean;
}

const plans: PlanDetails[] = [
  {
    id: "basic",
    name: "Basic",
    monthlyPrice: 29,
    yearlyPrice: 289,
    features: [
      "1 conta de email",
      "5GB de armazenamento",
      "Domínio personalizado",
      "Webmail incluído",
      "Suporte por email",
    ],
    accounts: 1,
    storage: "5GB",
  },
  {
    id: "standard",
    name: "Standard",
    monthlyPrice: 79,
    yearlyPrice: 789,
    features: [
      "5 contas de email",
      "15GB por conta",
      "Domínio personalizado",
      "Webmail + IMAP/POP3",
      "Suporte prioritário",
      "Backup diário",
    ],
    accounts: 5,
    storage: "15GB cada",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    monthlyPrice: 199,
    yearlyPrice: 1989,
    features: [
      "20 contas de email",
      "30GB por conta",
      "Domínio personalizado",
      "Todos os protocolos",
      "Suporte 24/7",
      "Backup diário",
      "Anti-spam avançado",
    ],
    accounts: 20,
    storage: "30GB cada",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 499,
    yearlyPrice: 4989,
    features: [
      "Contas ilimitadas",
      "Armazenamento ilimitado",
      "Múltiplos domínios",
      "API de integração",
      "Suporte dedicado",
      "SLA garantido",
      "Customização completa",
    ],
    accounts: "∞",
    storage: "Ilimitado",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [selectedPlan, setSelectedPlan] = useState<string>("standard");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  useEffect(() => {
    // Check for payment status from redirect
    const status = searchParams.get("payment");
    if (status) {
      setPaymentStatus(status);
      if (status === "success") {
        toast({
          title: "Pagamento confirmado!",
          description: "Sua assinatura foi ativada com sucesso.",
        });
        setTimeout(() => router.push("/dashboard"), 3000);
      } else if (status === "failure") {
        toast({
          variant: "destructive",
          title: "Pagamento falhou",
          description: "Por favor, tente novamente.",
        });
      }
    }

    // Get plan from URL
    const planParam = searchParams.get("plan");
    if (planParam && plans.find((p) => p.id === planParam)) {
      setSelectedPlan(planParam);
    }
  }, [searchParams, router, toast]);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/payment/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlan,
          billingCycle,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar pagamento");
      }

      const data = await response.json();

      // Redirect to MercadoPago
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        throw new Error("URL de pagamento não disponível");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar pagamento",
      });
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getDiscount = () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) return 0;
    const monthlyTotal = plan.monthlyPrice * 12;
    const yearlyTotal = plan.yearlyPrice;
    const discount = ((monthlyTotal - yearlyTotal) / monthlyTotal) * 100;
    return Math.round(discount);
  };

  const getCurrentPrice = () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) return 0;
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  };

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <Card className="bg-slate-800 border-slate-700 max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Pagamento Confirmado!</h2>
            <p className="text-slate-400 mb-6">
              Sua assinatura foi ativada com sucesso. Redirecionando para o dashboard...
            </p>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => router.push("/dashboard")}
            >
              Ir para Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="text-slate-400 hover:text-white mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-white">Finalizar Assinatura</h1>
          <p className="text-slate-400 mt-2">Escolha seu plano e método de pagamento</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Plan Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Billing Cycle Toggle */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Ciclo de Cobrança</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    variant={billingCycle === "monthly" ? "default" : "outline"}
                    className={`flex-1 ${
                      billingCycle === "monthly"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "border-slate-600 text-slate-300 hover:bg-slate-700"
                    }`}
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Mensal
                  </Button>
                  <Button
                    variant={billingCycle === "yearly" ? "default" : "outline"}
                    className={`flex-1 relative ${
                      billingCycle === "yearly"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "border-slate-600 text-slate-300 hover:bg-slate-700"
                    }`}
                    onClick={() => setBillingCycle("yearly")}
                  >
                    Anual
                    {billingCycle === "yearly" && (
                      <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 text-xs">
                        -{getDiscount()}%
                      </Badge>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all relative ${
                    selectedPlan === plan.id
                      ? "bg-slate-800 border-emerald-600 ring-2 ring-emerald-600"
                      : "bg-slate-800 border-slate-700 hover:border-slate-600"
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-4 bg-emerald-600 text-white">
                      Mais Popular
                    </Badge>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{plan.name}</CardTitle>
                      {selectedPlan === plan.id && (
                        <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <CardDescription className="text-slate-400">
                      {plan.accounts === "∞" ? "Contas ilimitadas" : `${plan.accounts} contas`}
                      {" • "}
                      {plan.storage}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-white">
                        {formatPrice(billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice)}
                      </span>
                      <span className="text-slate-400">
                        /{billingCycle === "monthly" ? "mês" : "ano"}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                          <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-slate-300">
                  <span>Plano</span>
                  <span className="text-white font-medium">
                    {plans.find((p) => p.id === selectedPlan)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Ciclo</span>
                  <span className="text-white font-medium">
                    {billingCycle === "monthly" ? "Mensal" : "Anual"}
                  </span>
                </div>
                {billingCycle === "yearly" && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto</span>
                    <span>-{getDiscount()}%</span>
                  </div>
                )}
                <Separator className="bg-slate-700" />
                <div className="flex justify-between">
                  <span className="text-slate-300">Total</span>
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(getCurrentPrice())}
                    <span className="text-sm text-slate-400 font-normal">
                      /{billingCycle === "monthly" ? "mês" : "ano"}
                    </span>
                  </span>
                </div>

                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Pagar com MercadoPago
                    </>
                  )}
                </Button>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    Pagamento 100% seguro
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    Ativação imediata após confirmação
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
