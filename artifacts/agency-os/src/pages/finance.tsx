import { useState } from "react";
import {
  useListInvoices, useListQuotations, useListPurchaseOrders, useListProposals,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, FileCheck, ShoppingCart, Briefcase, FileSpreadsheet } from "lucide-react";
import InvoicesPage from "@/pages/invoices";
import QuotationsPage from "@/pages/quotations";
import PurchaseOrdersPage from "@/pages/purchase-orders";
import ProposalsPage from "@/pages/proposals";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { toast } from "sonner";

const TABS = [
  { key: "invoices",        label: "Invoices",        icon: FileText },
  { key: "quotations",      label: "Quotations",      icon: FileCheck },
  { key: "purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
  { key: "proposals",       label: "Proposals",       icon: Briefcase },
] as const;

type TabKey = typeof TABS[number]["key"];

function useTabFromUrl(): [TabKey, (tab: TabKey) => void] {
  const search = typeof window !== "undefined" ? window.location.search : "";
  const params = new URLSearchParams(search);
  const raw = params.get("tab") as TabKey | null;
  const valid = TABS.some((t) => t.key === raw);
  const [tab, setTabState] = useState<TabKey>(valid && raw ? raw : "invoices");

  const setTab = (t: TabKey) => {
    setTabState(t);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", t);
    window.history.pushState({}, "", url.toString());
  };

  return [tab, setTab];
}

export default function FinancePage() {
  const [activeTab, setActiveTab] = useTabFromUrl();

  // Load data for Excel export — only the active tab
  const { data: invoices } = useListInvoices();
  const { data: quotations } = useListQuotations();
  const { data: orders } = useListPurchaseOrders();
  const { data: proposals } = useListProposals();

  function handleExport() {
    let data: any[] = [];
    let sheetName = "Data";
    let filename = "AgencyOS_Export.xlsx";

    if (activeTab === "invoices" && invoices) {
      sheetName = "Invoices";
      filename = "AgencyOS_Invoices.xlsx";
      data = invoices.map((inv: any) => ({
        "Invoice #":   inv.number ?? "",
        "Client":      inv.clientName ?? inv.client?.companyName ?? "",
        "Status":      inv.status ?? "",
        "Issue Date":  inv.invoiceDate ? format(new Date(inv.invoiceDate), "dd MMM yyyy") : "",
        "Due Date":    inv.dueDate    ? format(new Date(inv.dueDate),    "dd MMM yyyy") : "",
        "Total (₹)":   inv.total ?? 0,
      }));
    } else if (activeTab === "quotations" && quotations) {
      sheetName = "Quotations";
      filename = "AgencyOS_Quotations.xlsx";
      data = quotations.map((q: any) => ({
        "Quote #":     q.number ?? "",
        "Client":      q.clientName ?? q.client?.companyName ?? "",
        "Status":      q.status ?? "",
        "Valid Until": q.validUntil ? format(new Date(q.validUntil), "dd MMM yyyy") : "",
        "Total (₹)":   q.total ?? 0,
      }));
    } else if (activeTab === "purchase-orders" && orders) {
      sheetName = "Purchase Orders";
      filename = "AgencyOS_PurchaseOrders.xlsx";
      data = orders.map((po: any) => ({
        "PO #":        po.number ?? "",
        "Vendor":      po.vendorName ?? "",
        "Status":      po.status ?? "",
        "Order Date":  po.orderDate ? format(new Date(po.orderDate), "dd MMM yyyy") : "",
        "Total (₹)":   po.total ?? 0,
      }));
    } else if (activeTab === "proposals" && proposals) {
      sheetName = "Proposals";
      filename = "AgencyOS_Proposals.xlsx";
      data = proposals.map((p: any) => ({
        "Title":       p.title ?? "",
        "Client":      p.clientName ?? p.client?.companyName ?? "",
        "Status":      p.status ?? "",
        "Template":    p.template ?? "",
        "Created":     p.createdAt ? format(new Date(p.createdAt), "dd MMM yyyy") : "",
      }));
    }

    if (!data.length) {
      toast("No data to export");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Auto-width columns
    const colWidths = Object.keys(data[0] ?? {}).map((key) => ({
      wch: Math.max(key.length, ...data.map((row) => String(row[key] ?? "").length)),
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, filename);
  }

  const currentTab = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="p-6 animated-fade-in space-y-0">
      {/* Page header */}
      <div className="flex items-center justify-between pb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading">Finance &amp; Docs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Invoices, Quotations, Purchase Orders &amp; Proposals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2 shrink-0">
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 border-b border-border overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              aria-selected={isActive}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap rounded-t-lg",
                isActive
                  ? "border-primary text-foreground bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="pt-2 -mx-6">
        {activeTab === "invoices"        && <InvoicesPage />}
        {activeTab === "quotations"      && <QuotationsPage />}
        {activeTab === "purchase-orders" && <PurchaseOrdersPage />}
        {activeTab === "proposals"       && <ProposalsPage />}
      </div>
    </div>
  );
}
