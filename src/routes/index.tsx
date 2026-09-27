import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  formatDate,
  formatVND,
  loadInvoices,
  saveInvoices,
  STATUS_LABELS,
  type Invoice,
  type InvoiceStatus,
} from "../lib/invoices";
import { BottomNav } from "../components/BottomNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Công Nợ — Quản lý hoá đơn" },
      {
        name: "description",
        content:
          "Theo dõi công nợ: dự án, ngày xuất hoá đơn, số tiền, đối tượng và ngày thanh toán.",
      },
      { property: "og:title", content: "Công Nợ — Quản lý hoá đơn" },
      {
        property: "og:description",
        content: "Theo dõi công nợ đơn giản, đẹp và tối ưu cho điện thoại.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InvoiceListPage,
});

type Filter = "all" | InvoiceStatus;

const FILTER_TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "chua_thanh_toan", label: "Chưa TT" },
  { key: "da_thanh_toan", label: "Đã TT" },
  { key: "qua_han", label: "Quá hạn" },
];

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  chua_thanh_toan: "bg-amber-100 text-amber-700",
  da_thanh_toan: "bg-emerald-100 text-emerald-700",
  qua_han: "bg-rose-100 text-rose-700",
};

function InvoiceListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadInvoices());
  const [filter, setFilter] = useState<Filter>("all");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? invoices
        : invoices.filter((inv) => inv.status === filter),
    [invoices, filter],
  );

  const totalOutstanding = useMemo(
    () =>
      invoices
        .filter((i) => i.status !== "da_thanh_toan")
        .reduce((s, i) => s + i.amount, 0),
    [invoices],
  );

  const update = (next: Invoice[]) => {
    setInvoices(next);
    saveInvoices(next);
  };

  const markPaid = (id: string) => {
    update(
      invoices.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              status: "da_thanh_toan",
              paymentDate: new Date().toISOString().slice(0, 10),
            }
          : inv,
      ),
    );
  };

  const remove = (id: string) => update(invoices.filter((i) => i.id !== id));

  const addInvoice = (inv: Invoice) => {
    update([inv, ...invoices]);
    setShowForm(false);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 px-5 pb-4 pt-6 backdrop-blur">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Tổng công nợ
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
          {formatVND(totalOutstanding)}
        </h1>

        <div className="mt-4 flex gap-2 overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-5 pt-4">
        {filtered.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-4xl">🧾</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Không có hoá đơn nào ở trạng thái này.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((inv) => (
              <li
                key={inv.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-card-foreground">
                      {inv.project}
                    </h2>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {inv.recipient}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[inv.status]}`}
                  >
                    {STATUS_LABELS[inv.status]}
                  </span>
                </div>

                <p className="mt-3 text-xl font-bold text-card-foreground">
                  {formatVND(inv.amount)}
                </p>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Xuất HĐ: {formatDate(inv.invoiceDate)}</span>
                  <span className="text-right">
                    Thanh toán: {formatDate(inv.paymentDate)}
                  </span>
                </div>

                <div className="mt-3 flex gap-2">
                  {inv.status !== "da_thanh_toan" && (
                    <button
                      onClick={() => markPaid(inv.id)}
                      className="flex-1 rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground transition-opacity active:opacity-80"
                    >
                      Đánh dấu đã TT
                    </button>
                  )}
                  <button
                    onClick={() => remove(inv.id)}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors active:bg-secondary"
                  >
                    Xoá
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <button
        onClick={() => setShowForm(true)}
        aria-label="Thêm hoá đơn"
        className="fixed bottom-20 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-primary text-3xl font-light text-primary-foreground shadow-lg transition-transform active:scale-95"
      >
        +
      </button>

      {showForm && (
        <AddInvoiceSheet
          onClose={() => setShowForm(false)}
          onAdd={addInvoice}
        />
      )}

      <BottomNav active="invoices" />
    </div>
  );
}

function AddInvoiceSheet({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (inv: Invoice) => void;
}) {
  const [project, setProject] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [paymentDate, setPaymentDate] = useState("");

  const valid =
    project.trim() && recipient.trim() && Number(amount) > 0 && invoiceDate;

  const submit = () => {
    if (!valid) return;
    const due = paymentDate || null;
    const overdue = due && due < new Date().toISOString().slice(0, 10);
    onAdd({
      id: crypto.randomUUID(),
      project: project.trim(),
      recipient: recipient.trim(),
      amount: Number(amount),
      invoiceDate,
      paymentDate: due,
      status: overdue ? "qua_han" : "chua_thanh_toan",
    });
  };

  const inputCls =
    "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-card p-6 pb-10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-card-foreground">
          Thêm hoá đơn mới
        </h2>
        <div className="mt-4 space-y-3">
          <input
            className={inputCls}
            placeholder="Dự án *"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          />
          <input
            className={inputCls}
            placeholder="Đối tượng xuất hoá đơn *"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <input
            className={inputCls}
            placeholder="Số tiền (VND) *"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          />
          <label className="block text-xs font-medium text-muted-foreground">
            Ngày xuất hoá đơn *
            <input
              type="date"
              className={`${inputCls} mt-1`}
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-muted-foreground">
            Ngày được thanh toán (dự kiến)
            <input
              type="date"
              className={`${inputCls} mt-1`}
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </label>
        </div>
        <button
          onClick={submit}
          disabled={!valid}
          className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
        >
          Lưu hoá đơn
        </button>
      </div>
    </div>
  );
}

// Keep Link import used for future navigation
void Link;
