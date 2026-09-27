import { Link } from "@tanstack/react-router";

export function BottomNav({ active }: { active: "invoices" | "report" }) {
  const item = (key: string) =>
    `flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
      active === key ? "text-primary" : "text-muted-foreground"
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 mx-auto flex max-w-md border-t border-border bg-background/95 backdrop-blur">
      <Link to="/" className={item("invoices")}>
        <span className="text-lg">🧾</span>
        Công nợ
      </Link>
      <Link to="/bao-cao" className={item("report")}>
        <span className="text-lg">📊</span>
        Báo cáo
      </Link>
    </nav>
  );
}
