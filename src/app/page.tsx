"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Shield,
  Zap,
  Globe,
  Mail,
  Settings,
  HeadphonesIcon,
  Check,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Privacidade Total",
    description: "Seus dados são seus. Sem rastreamento, sem publicidade, sem compartilhamento de dados com terceiros.",
  },
  {
    icon: Zap,
    title: "Alta Performance",
    description: "Servidores otimizados para garantir entrega rápida e confiável de seus emails.",
  },
  {
    icon: Globe,
    title: "Domínio Personalizado",
    description: "Use seu próprio domínio ou crie um subdomínio gratuito em isamail.space.",
  },
  {
    icon: Mail,
    title: "Anti-Spam Avançado",
    description: "Filtros inteligentes que bloqueiam 99.9% de spam e phishing antes de chegar à sua caixa.",
  },
  {
    icon: Settings,
    title: "Administração Fácil",
    description: "Painel intuitivo para gerenciar contas, aliases e configurações de domínio.",
  },
  {
    icon: HeadphonesIcon,
    title: "Suporte Dedicado",
    description: "Equipe especializada disponível para ajudar com qualquer questão técnica.",
  },
];

const plans = [
  {
    name: "Basic",
    description: "Perfeito para profissionais autônomos",
    monthlyPrice: 29,
    features: [
      "1 conta de email",
      "5GB de armazenamento",
      "Domínio personalizado",
      "Anti-spam incluído",
      "Suporte por email",
    ],
    popular: false,
  },
  {
    name: "Standard",
    description: "Ideal para pequenas empresas",
    monthlyPrice: 79,
    features: [
      "5 contas de email",
      "15GB por conta",
      "Domínio personalizado",
      "Anti-spam avançado",
      "Suporte prioritário",
      "Relatórios de uso",
    ],
    popular: true,
  },
  {
    name: "Premium",
    description: "Para equipes em crescimento",
    monthlyPrice: 199,
    features: [
      "20 contas de email",
      "30GB por conta",
      "Domínio personalizado",
      "Anti-spam premium",
      "Suporte 24/7",
      "API de integração",
      "Backup automático",
    ],
    popular: false,
  },
  {
    name: "Enterprise",
    description: "Solução empresarial completa",
    monthlyPrice: 499,
    features: [
      "Contas ilimitadas",
      "Armazenamento ilimitado",
      "Domínios múltiplos",
      "SLA garantido",
      "Suporte dedicado",
      "API completa",
      "Integração AD/LDAP",
      "Auditoria e logs",
    ],
    popular: false,
  },
];

const faqs = [
  {
    question: "Posso usar meu próprio domínio?",
    answer: "Sim! Você pode configurar seu próprio domínio ou usar um subdomínio gratuito em isamail.space. Oferecemos suporte completo para configuração de DNS, DKIM, SPF e DMARC.",
  },
  {
    question: "Como funciona a migração de emails existentes?",
    answer: "Oferecemos ferramentas de migração gratuitas para transferir seus emails de provedores como Gmail, Outlook e outros. Nossa equipe de suporte pode ajudar durante todo o processo.",
  },
  {
    question: "Qual é a política de privacidade?",
    answer: "Seus dados são 100% seus. Não rastreamos, não vendemos e não compartilhamos suas informações. Todos os dados são criptografados em trânsito e em repouso.",
  },
  {
    question: "Posso fazer upgrade ou downgrade do plano?",
    answer: "Sim, você pode alterar seu plano a qualquer momento. O valor será calculado proporcionalmente (prorata) para o período restante do seu ciclo de faturamento.",
  },
  {
    question: "Quais formas de pagamento são aceitas?",
    answer: "Aceitamos cartões de crédito (Visa, Mastercard, Elo), PIX, e boleto bancário. Para planos Enterprise, oferecemos também faturamento corporativo.",
  },
  {
    question: "Existe período de teste gratuito?",
    answer: "Sim! Oferecemos 14 dias de teste gratuito em todos os planos, sem necessidade de cartão de crédito. Você pode cancelar a qualquer momento.",
  },
];

export default function Home() {
  const [isYearly, setIsYearly] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPrice = (monthlyPrice: number) => {
    if (isYearly) {
      return Math.round(monthlyPrice * 0.83); // 17% discount
    }
    return monthlyPrice;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.svg" alt="IsaMail" className="h-8 w-8" />
              <span className="text-xl font-bold text-white">IsaMail</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Recursos
              </a>
              <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Preços
              </a>
              <a href="#faq" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                FAQ
              </a>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Começar Grátis
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <nav className="flex flex-col space-y-4">
                <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white">
                  Recursos
                </a>
                <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white">
                  Preços
                </a>
                <a href="#faq" className="text-sm font-medium text-slate-300 hover:text-white">
                  FAQ
                </a>
                <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white">
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                      Começar Grátis
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 sm:py-32">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2310b981%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-4 bg-emerald-600/20 text-emerald-400 border-emerald-600/30">
                14 dias grátis • Sem cartão de crédito
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Email Profissional com{" "}
                <span className="text-emerald-400">Domínio Próprio</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Comunicação empresarial segura, privada e profissional. 
                Use seu próprio domínio ou crie emails em isamail.space.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                    Começar Agora
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#pricing">
                  <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                    Ver Planos
                  </Button>
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-emerald-400">99.9%</p>
                  <p className="text-sm text-slate-400">Uptime garantido</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-emerald-400">10k+</p>
                  <p className="text-sm text-slate-400">Empresas ativas</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-emerald-400">24/7</p>
                  <p className="text-sm text-slate-400">Suporte técnico</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Por que escolher o IsaMail?
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Uma solução completa de email profissional pensada para empresas que valorizam privacidade e performance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-emerald-600/50 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-emerald-600/20 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-400">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Planos que cabem no seu bolso
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
                Escolha o plano ideal para sua empresa. Todos incluem 14 dias grátis.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4">
                <Label htmlFor="billing-toggle" className={`text-sm ${!isYearly ? "text-white" : "text-slate-400"}`}>
                  Mensal
                </Label>
                <Switch
                  id="billing-toggle"
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                  className="data-[state=checked]:bg-emerald-600"
                />
                <Label htmlFor="billing-toggle" className={`text-sm ${isYearly ? "text-white" : "text-slate-400"}`}>
                  Anual
                  <Badge className="ml-2 bg-emerald-600/20 text-emerald-400 text-xs">
                    -17%
                  </Badge>
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`relative bg-slate-900 border-slate-700 flex flex-col ${
                    plan.popular ? "border-emerald-500 ring-2 ring-emerald-500/20" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-emerald-600 text-white">Mais Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                    <CardDescription className="text-slate-400">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="text-center mb-6">
                      <span className="text-4xl font-bold text-white">
                        R$ {getPrice(plan.monthlyPrice)}
                      </span>
                      <span className="text-slate-400">/mês</span>
                      {isYearly && (
                        <p className="text-sm text-emerald-400 mt-1">
                          R$ {getPrice(plan.monthlyPrice) * 12}/ano
                        </p>
                      )}
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2 text-sm text-slate-300">
                          <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/register?plan=${plan.name.toLowerCase()}`} className="w-full">
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-slate-700 hover:bg-slate-600 text-white"
                        }`}
                      >
                        {plan.popular ? "Começar Agora" : "Selecionar"}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Tire suas dúvidas sobre o IsaMail e nossos serviços.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-white hover:text-emerald-400 text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-400">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Pronto para profissionalizar seu email?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Comece seu período de teste gratuito de 14 dias hoje mesmo. Sem compromisso, sem cartão de crédito.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-slate-100 px-8">
                Criar Conta Gratuita
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/logo.svg" alt="IsaMail" className="h-8 w-8" />
                <span className="text-xl font-bold text-white">IsaMail</span>
              </div>
              <p className="text-slate-400 max-w-md">
                Email profissional com domínio próprio. Privacidade, performance e suporte especializado para sua empresa.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Produto</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Preços</a></li>
                <li><a href="#faq" className="text-slate-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} IsaMail. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Termos de Uso</a>
              <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
