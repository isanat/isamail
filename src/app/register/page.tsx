"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Globe,
  ArrowLeft,
} from "lucide-react";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 29,
    accounts: "1 conta",
    storage: "5GB",
  },
  {
    id: "standard",
    name: "Standard",
    price: 79,
    accounts: "5 contas",
    storage: "15GB cada",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 199,
    accounts: "20 contas",
    storage: "30GB cada",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 499,
    accounts: "Ilimitadas",
    storage: "Ilimitado",
  },
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get("plan") || "standard");
  const [domainOption, setDomainOption] = useState<"subdomain" | "custom">("subdomain");
  const [domain, setDomain] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 8) {
      newErrors.password = "Senha deve ter pelo menos 8 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Senhas não conferem";
    }

    if (domainOption === "custom" && !domain.trim()) {
      newErrors.domain = "Domínio é obrigatório";
    } else if (domainOption === "custom" && !/^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/.test(domain)) {
      newErrors.domain = "Domínio inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          plan: selectedPlan,
          domainOption,
          domain: domainOption === "custom" ? domain : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar conta");
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Você será redirecionado para o dashboard.",
      });

      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <img src="/logo.svg" alt="IsaMail" className="h-12 w-12" />
              </div>
              <CardTitle className="text-2xl text-white">Criar sua conta</CardTitle>
              <CardDescription className="text-slate-400">
                Comece seu período de teste gratuito de 14 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Informações Pessoais</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Nome Completo *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 ${
                          errors.name ? "border-red-500" : ""
                        }`}
                      />
                      {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 ${
                          errors.email ? "border-red-500" : ""
                        }`}
                      />
                      {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white">Senha *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 8 caracteres"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className={`bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 pr-10 ${
                            errors.password ? "border-red-500" : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white">Confirmar Senha *</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Repita a senha"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className={`bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 ${
                          errors.confirmPassword ? "border-red-500" : ""
                        }`}
                      />
                      {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Telefone (opcional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Plan Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Selecione o Plano</h3>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                          selectedPlan === plan.id
                            ? "border-emerald-500 bg-emerald-500/10"
                            : "border-slate-600 bg-slate-900 hover:border-slate-500"
                        }`}
                      >
                        {plan.popular && (
                          <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs">
                            Popular
                          </Badge>
                        )}
                        <div className="text-center">
                          <p className="font-semibold text-white">{plan.name}</p>
                          <p className="text-2xl font-bold text-emerald-400">R${plan.price}</p>
                          <p className="text-xs text-slate-400">/mês</p>
                          <div className="mt-2 text-xs text-slate-400">
                            <p>{plan.accounts}</p>
                            <p>{plan.storage}</p>
                          </div>
                        </div>
                        {selectedPlan === plan.id && (
                          <div className="absolute top-2 right-2">
                            <Check className="h-4 w-4 text-emerald-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Domain Option */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Configuração de Domínio</h3>
                  
                  <RadioGroup
                    value={domainOption}
                    onValueChange={(value) => setDomainOption(value as "subdomain" | "custom")}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        domainOption === "subdomain"
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-slate-600 bg-slate-900 hover:border-slate-500"
                      }`}
                      onClick={() => setDomainOption("subdomain")}
                    >
                      <RadioGroupItem value="subdomain" id="subdomain" className="text-emerald-500" />
                      <div className="flex-1">
                        <Label htmlFor="subdomain" className="text-white font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Usar subdomínio IsaMail
                        </Label>
                        <p className="text-sm text-slate-400 mt-1">
                          Crie emails como contato@empresa.isamail.space
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        domainOption === "custom"
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-slate-600 bg-slate-900 hover:border-slate-500"
                      }`}
                      onClick={() => setDomainOption("custom")}
                    >
                      <RadioGroupItem value="custom" id="custom" className="text-emerald-500" />
                      <div className="flex-1">
                        <Label htmlFor="custom" className="text-white font-medium flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Usar meu próprio domínio
                        </Label>
                        <p className="text-sm text-slate-400 mt-1">
                          Configure emails no seu domínio existente
                        </p>
                      </div>
                    </div>
                  </RadioGroup>

                  {domainOption === "custom" && (
                    <div className="space-y-2">
                      <Label htmlFor="domain" className="text-white">Seu Domínio</Label>
                      <Input
                        id="domain"
                        type="text"
                        placeholder="suaempresa.com.br"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className={`bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 ${
                          errors.domain ? "border-red-500" : ""
                        }`}
                      />
                      {errors.domain && <p className="text-red-400 text-sm">{errors.domain}</p>}
                      <p className="text-xs text-slate-400">
                        Você precisará configurar os registros DNS após o cadastro.
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar Conta Gratuita"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-slate-400 text-sm">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                  Fazer login
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
