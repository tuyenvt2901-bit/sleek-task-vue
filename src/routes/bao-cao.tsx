import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  formatVND,
  loadInvoices,
  STATUS_LABELS,
  type Invoice,
  type InvoiceStatus,
} from "../lib/invoices";
import { BottomNav } from "../components/BottomNav";

export const Route = createFileRoute("/bao-cao")({
  head: () => ({
    meta: [
      { title: "Báo cáo — Công Nợ" },
      {
        name: "description",
        content: "Báo cáo tổng quan công nợ theo trạng thái và khách hàng.",
      },
      { property: "og:title", content: "Báo cáo — Công Nợ" },
      {
        property: "og:description",
        content: "Báo cáo tổng quan công nợ theo trạng thái và khách hàng.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportPage,
});

const STATUS_ORDER: InvoiceStatus[] = [
  "chua_thanh_toan",
  "qua_han",
  "da_thanh_toan",
];

const BAR_COLORS: Record<InvoiceStatus, string> = {
  chua_thanh_toan: "bg-amber-400",
  qua_han: "bg-rose-400",
  da_thanh_toan: "bg-emerald-400",
};

function ReportPage() {
  const [invoices] = useState<Invoice[]>(() => loadInvoices());

  const stats = useMemo(() => {
    const total = invoices.reduce((s, i) => s + i.amount, 0);
    const byStatus = STATUS_ORDER.map((status) => {
      const list = invoices.filter((i) => i.status === status);
      return {
        status,
        count: list.length,
        sum: list.reduce((s, i) => s + i.amount, 0),
      };
    });
    const byRecipient = new Map<string, number>();
    for (const inv of invoices) {
      if (inv.status === "da_thanh_toan") continue;
      byRecipient.set(
        inv.recipient,
        (byRecipient.get(inv.recipient) ?? 0) + inv.amount,
      );
    }
    const topDebtors = [...byRecipient.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    return { total, byStatus, topDebtors };
  }, [invoices]);

  const maxStatus = Math.max(...stats.byStatus.map((s) => s.sum), 1);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background pb-24">
      <header className="border-b border-border px-5 pb-4 pt-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Báo cáo công nợ
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tổng giá trị hoá đơn: {formatVND(stats.total)}
        </p>
      </header>

      <main className="flex-1 space-y-6 px-5 pt-5">
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-card-foreground">
            Theo trạng thái
          </h2>
          <div className="mt-4 space-y-4">
            {stats.byStatus.map(({ status, count, sum }) => (
              <div key={status}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-card-foreground">
                    {STATUS_LABELS[status]}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({count})
                    </span>
                  </span>
                  <span className="font-semibold text-card-foreground">
                    {formatVND(sum)}
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full ${BAR_COLORS[status]} transition-all`}
                    style={{ width: `${Math.round((sum / maxStatus) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-card-foreground">
            Khách hàng nợ nhiều nhất
          </h2>
          {stats.topDebtors.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Không còn khoản nợ nào. 🎉
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {stats.topDebtors.map(([name, sum], idx) => (
                <li
                  key={name}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                      {idx + 1}
                    </span>
                    <span className="truncate text-sm font-medium text-card-foreground">
                      {name}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-card-foreground">
                    {formatVND(sum)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <BottomNav active="report" />
    </div>
  );
}
