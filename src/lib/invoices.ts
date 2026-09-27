export type InvoiceStatus = "chua_thanh_toan" | "da_thanh_toan" | "qua_han";

export interface Invoice {
  id: string;
  project: string; // Dự án
  invoiceDate: string; // Ngày xuất hoá đơn (ISO)
  amount: number; // Số tiền (VND)
  recipient: string; // Đối tượng xuất hoá đơn
  paymentDate: string | null; // Ngày được thanh toán (dự kiến hoặc thực tế)
  status: InvoiceStatus;
}

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  chua_thanh_toan: "Chưa thanh toán",
  da_thanh_toan: "Đã thanh toán",
  qua_han: "Quá hạn",
};

const STORAGE_KEY = "cong-no-invoices-v1";

function seed(): Invoice[] {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return iso(d);
  };
  const daysAhead = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return iso(d);
  };
  return [
    {
      id: crypto.randomUUID(),
      project: "Thiết kế website An Phát",
      invoiceDate: daysAgo(40),
      amount: 25_000_000,
      recipient: "Công ty An Phát",
      paymentDate: daysAgo(10),
      status: "qua_han",
    },
    {
      id: crypto.randomUUID(),
      project: "App đặt đồ ăn FoodGo",
      invoiceDate: daysAgo(15),
      amount: 48_500_000,
      recipient: "FoodGo JSC",
      paymentDate: daysAhead(15),
      status: "chua_thanh_toan",
    },
    {
      id: crypto.randomUUID(),
      project: "Landing page K Coffee",
      invoiceDate: daysAgo(60),
      amount: 12_000_000,
      recipient: "K Coffee",
      paymentDate: daysAgo(30),
      status: "da_thanh_toan",
    },
    {
      id: crypto.randomUUID(),
      project: "Hệ thống booking Nha Khoa Smile",
      invoiceDate: daysAgo(5),
      amount: 36_000_000,
      recipient: "Nha Khoa Smile",
      paymentDate: daysAhead(25),
      status: "chua_thanh_toan",
    },
  ];
}

export function loadInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const data = seed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
    return JSON.parse(raw) as Invoice[];
  } catch {
    return [];
  }
}

export function saveInvoices(invoices: Invoice[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
