"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, CreditCard, Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const plans = [
  {
    name: "Starter",
    price: 99,
    period: "month",
    features: ["Up to 500 conversations/month", "Basic AI agent", "Email support", "1 user account", "Basic analytics"],
    current: false,
  },
  {
    name: "Professional",
    price: 299,
    period: "month",
    features: [
      "Up to 2,000 conversations/month",
      "Advanced AI agent",
      "Priority support",
      "5 user accounts",
      "Advanced analytics",
      "Custom branding",
    ],
    current: true,
  },
  {
    name: "Enterprise",
    price: 799,
    period: "month",
    features: [
      "Unlimited conversations",
      "Premium AI agent",
      "24/7 dedicated support",
      "Unlimited users",
      "Custom integrations",
      "White-label solution",
      "SLA guarantee",
    ],
    current: false,
  },
]

const billingHistory = [
  {
    id: "INV-001",
    date: "2024-01-01",
    amount: 299,
    status: "paid",
    plan: "Professional",
  },
  {
    id: "INV-002",
    date: "2023-12-01",
    amount: 299,
    status: "paid",
    plan: "Professional",
  },
  {
    id: "INV-003",
    date: "2023-11-01",
    amount: 299,
    status: "paid",
    plan: "Professional",
  },
  {
    id: "INV-004",
    date: "2023-10-01",
    amount: 99,
    status: "paid",
    plan: "Starter",
  },
]

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are currently on the Professional plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground">Professional</h3>
              <p className="text-muted-foreground">299 TND per month</p>
              <p className="mt-2 text-sm text-muted-foreground">Next billing date: February 1, 2024</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-transparent">
                Change Plan
              </Button>
              <Button variant="outline" className="text-destructive hover:text-destructive bg-transparent">
                Cancel Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-foreground">Available Plans</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={`border-border bg-card ${plan.current ? "ring-2 ring-primary" : ""}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.current && <Badge>Current Plan</Badge>}
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price} TND</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" disabled={plan.current}>
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2025</p>
              </div>
            </div>
            <Button variant="outline" className="bg-transparent">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.plan}</TableCell>
                    <TableCell>{invoice.amount} TND</TableCell>
                    <TableCell>
                      <Badge variant="default">Paid</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
