import { useMemo } from "react";

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function CalendarView({ days = [] }) {
  const byDate = useMemo(() => {
    const m = {};
    days.forEach((d) => (m[d.date] = d));
    return m;
  }, [days]);

  const max = useMemo(() => Math.max(1, ...days.map((d) => d.count)), [days]);

  const months = useMemo(() => {
    if (days.length === 0) return [];
    const dates = days.map((d) => new Date(d.date + "T00:00:00"));
    const min = new Date(Math.min(...dates));
    const maxD = new Date(Math.max(...dates));
    const out = [];
    let cur = new Date(min.getFullYear(), min.getMonth(), 1);
    while (cur <= maxD) {
      out.push(new Date(cur));
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
    return out;
  }, [days]);

  function levelFor(n) {
    if (!n) return "";
    const r = n / max;
    if (r < 0.34) return "l1";
    if (r < 0.67) return "l2";
    return "l3";
  }

  return (
    <div>
      {months.length === 0 && (
        <p style={{ color: "var(--muted)" }}>
          Sem detecções no período. A ausência de detecção não prova ausência de fogo.
        </p>
      )}
      {months.map((m) => {
        const year = m.getFullYear();
        const month = m.getMonth();
        const first = new Date(year, month, 1);
        const last = new Date(year, month + 1, 0);
        const offset = first.getDay();
        const totalDays = last.getDate();
        const cells = [];

        for (let i = 0; i < offset; i++) cells.push(null);
        for (let d = 1; d <= totalDays; d++) {
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          cells.push({ day: d, info: byDate[key] });
        }

        return (
          <div key={year + "-" + month}>
            <div className="month-title">
              {MONTHS[month]} {year}
            </div>
            <div className="calendar">
              {WEEK.map((w, i) => (
                <div key={i} className="cal-head">
                  {w}
                </div>
              ))}
              {cells.map((c, i) =>
                c === null ? (
                  <div key={i} className="cal-cell empty" />
                ) : (
                  <div
                    key={i}
                    className={`cal-cell ${levelFor(c.info?.count || 0)}`}
                    title={
                      c.info
                        ? `${c.info.count} detecções (MODIS: ${c.info.modis}, VIIRS: ${c.info.viirs})`
                        : "sem detecção"
                    }
                  >
                    <span className="d">{c.day}</span>
                    {c.info && <span className="n">{c.info.count}</span>}
                  </div>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}