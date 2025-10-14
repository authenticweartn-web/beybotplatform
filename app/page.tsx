"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  MessageSquare,
  ShoppingCart,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-sm fixed top-0 w-full z-50 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Bot className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">BeyBot</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="#testimonials" className="text-sm text-muted-foreground hover:text-white transition-colors">
                Testimonials
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Sales Agent
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Transform your e-commerce with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-primary">
                AI sales agents
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Automate customer conversations, boost sales, and provide 24/7 support for your Tunisian e-commerce
              business with intelligent AI agents.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="text-base px-8 h-12 w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-12 w-full sm:w-auto border-white/20 hover:bg-white/5 bg-transparent"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">3x</div>
              <div className="text-sm text-muted-foreground">Faster response time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">85%</div>
              <div className="text-sm text-muted-foreground">Customer satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">40%</div>
              <div className="text-sm text-muted-foreground">Increase in sales</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Always available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Everything you need to scale</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for Tunisian e-commerce businesses
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 bg-card border-white/10 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Intelligent Conversations</h3>
              <p className="text-muted-foreground">
                AI agents that understand context, handle multiple languages, and provide natural responses to customer
                inquiries.
              </p>
            </Card>
            <Card className="p-6 bg-card border-white/10 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Order Management</h3>
              <p className="text-muted-foreground">
                Seamlessly process orders, track shipments, and handle customer requests all through conversational AI.
              </p>
            </Card>
            <Card className="p-6 bg-card border-white/10 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Instant Responses</h3>
              <p className="text-muted-foreground">
                Never miss a sale with instant, accurate responses to customer questions at any time of day.
              </p>
            </Card>
            <Card className="p-6 bg-card border-white/10 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Sales Analytics</h3>
              <p className="text-muted-foreground">
                Track performance, understand customer behavior, and optimize your sales strategy with detailed
                insights.
              </p>
            </Card>
            <Card className="p-6 bg-card border-white/10 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">24/7 Availability</h3>
              <p className="text-muted-foreground">
                Your AI agent works around the clock, ensuring customers always get the help they need.
              </p>
            </Card>
            <Card className="p-6 bg-card border-white/10 hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Custom AI Training</h3>
              <p className="text-muted-foreground">
                Train your AI agent with your product catalog, brand voice, and business rules for personalized service.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 bg-card border-white/10">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">99 TND</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground">Perfect for small businesses</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Up to 500 conversations/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Basic AI agent</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Email support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Basic analytics</span>
                </li>
              </ul>
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full border-white/20 hover:bg-white/5 bg-transparent">
                  Get Started
                </Button>
              </Link>
            </Card>

            <Card className="p-8 bg-primary/10 border-primary relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                Most Popular
              </Badge>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">299 TND</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground">For growing businesses</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Up to 2,000 conversations/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Advanced AI agent</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Custom AI training</span>
                </li>
              </ul>
              <Link href="/login" className="block">
                <Button className="w-full">Get Started</Button>
              </Link>
            </Card>

            <Card className="p-8 bg-card border-white/10">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">Custom</span>
                </div>
                <p className="text-muted-foreground">For large organizations</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Unlimited conversations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Custom AI models</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Dedicated support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">SLA guarantee</span>
                </li>
              </ul>
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full border-white/20 hover:bg-white/5 bg-transparent">
                  Contact Sales
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to transform your e-commerce?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join hundreds of Tunisian businesses using BeyBot to automate sales and delight customers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="text-base px-8 h-12 w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 h-12 w-full sm:w-auto border-white/20 hover:bg-white/5 bg-transparent"
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bot className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">BeyBot</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered sales agents for Tunisian e-commerce businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-sm text-muted-foreground hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-sm text-muted-foreground hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-sm text-muted-foreground hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-sm text-muted-foreground">
            © 2025 BeyBot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
