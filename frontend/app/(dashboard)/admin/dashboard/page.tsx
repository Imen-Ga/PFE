/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useMemo, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getInitials } from "@/utils/functions";
import IconDoc from "@/components/icons/IconDoc";
import IconCheck from "@/components/icons/IconCheck";
import IconClock from "@/components/icons/IconClock";
import { IconX } from "@/components/icons/IconX";
import { useChart } from "@/hooks/useAppChart";
import KpiCard from "@/components/KpiCard";
import { LegendDot } from "@/components/LegendDots";

Chart.register(...registerables);

export default function DashboardPage() {
  const users = useSelector((state: RootState) => state.users.users);
  const docs = useSelector((state: RootState) => state.docs.docs).filter((item: any) => item.status.toLowerCase() !== "draft");
  const MAX_DOCS = useMemo(() => {
    return Math.max(...users.map((d) => d.docs.length));
  }, [users])
  const docsStats = useMemo(() => {
    const total = docs.length || 1;
    const docsApproved = docs?.filter((item: any) => item.status === "approve");
    const docsRejected = docs?.filter((item: any) => item.status === "rejected");
    const docsPending = docs?.filter((item: any) => item.status === "pending");
    return { total, docsApproved, docsRejected, docsPending }
  }, [docs])

  const donutRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement>(null);

  const textColor = "rgba(115,115,115,0.9)";
  const gridColor = "rgba(0,0,0,0.06)";
  function getMonthlyStats(docs: any[]) {
    const submissions = Array(12).fill(0);
    const approved = Array(12).fill(0);

    docs.forEach((doc) => {
      const date = new Date(doc.submissionDate);
      const month = date.getMonth();

      submissions[month]++;

      if (doc.status === "approve") {
        approved[month]++;
      }
    });

    return { submissions, approved };
  }
  const { submissions, approved } = getMonthlyStats(docs);
  useChart(donutRef, () => ({
    type: "doughnut",
    data: {
      labels: ["Approuvés", "En attente", "Rejetés"],
      datasets: [{
        data: [docsStats?.docsApproved.length, docsStats?.docsPending.length, docsStats?.docsRejected.length],
        backgroundColor: ["#16a34a", "#d97706", "#dc2626"],
        borderWidth: 0,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw} docs` } },
      },
    },
  }));

  useChart(barRef, () => ({
    type: "bar",
    data: {
      labels: users.map((d) => d.name.split(" ")[0] + " " + d.name.split(" ")[1]?.[0] + "."),
      datasets: [{
        label: "Documents",
        data: users.map((d) => d.docs?.length),
        backgroundColor: ["#c5262e", "#e05a60", "#ea868a", "#f2b3b5"],
        borderRadius: 6,
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 }, stepSize: 2 }, beginAtZero: true },
      },
    },
  }));
  useChart(lineRef, () => ({
    type: "line",
    data: {
      labels: MONTHS,
      datasets: [
        {
          label: "Soumissions",
          data: submissions,
          borderColor: "#c5262e",
          backgroundColor: "rgba(197,38,46,0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: "#c5262e",
        },
        {
          label: "Approuvés",
          data: approved,
          borderColor: "#16a34a",
          backgroundColor: "transparent",
          fill: false,
          tension: 0.4,
          borderWidth: 2,
          borderDash: [4, 3],
          pointRadius: 3,
          pointBackgroundColor: "#16a34a",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 }, stepSize: 1 }, beginAtZero: true },
      },
    },
  }));


  return (
    <div className="space-y-5">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#c5262e] px-8 py-6 flex items-center justify-between">
        <div className="absolute -right-10 -top-14 w-52 h-52 rounded-full bg-white/5" />
        <div className="absolute right-16 top-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative z-10">
          <h1 className="text-2xl font-semibold text-white">Tableau de bord Administrateur</h1>
          <p className="text-sm text-white/70 mt-1">{"Suivez l'activité de votre plateforme en temps réel"}</p>
        </div>
        <span className="relative z-10 text-xs font-mono text-white/60 bg-white/10 px-3 py-2 rounded-lg capitalize">
          {TODAY}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Total documents"
          value={docsStats?.total}
          sub="Tous statuts confondus"
          iconColor="text-[#c5262e]"
          iconBg="bg-[#c5262e]/10"
          icon={<IconDoc />}
        />
        <KpiCard
          label="Approuvés"
          value={docsStats?.docsApproved.length}
          sub={`${Math.round((docsStats?.docsApproved.length / docsStats?.total) * 100)}% du total`}
          valueColor="text-green-600"
          iconColor="text-green-600"
          iconBg="bg-green-50"
          icon={<IconCheck />}
        />
        <KpiCard
          label="En attente"
          value={docsStats?.docsPending.length}
          sub={`${Math.round((docsStats?.docsPending.length / docsStats?.total) * 100)}% du total`}
          valueColor="text-amber-600"
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          icon={<IconClock />}
        />
        <KpiCard
          label="Rejetés"
          value={docsStats?.docsRejected.length}
          sub={`${Math.round((docsStats?.docsRejected.length / docsStats?.total) * 100)}% du total`}
          valueColor="text-red-600"
          iconColor="text-red-600"
          iconBg="bg-red-50"
          icon={<IconX />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Donut */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <p className="text-sm font-medium text-neutral-800">Répartition des documents</p>
          <p className="text-xs text-neutral-400 mt-0.5 mb-4">Par statut — {docsStats?.total} documents au total</p>
          <div className="flex gap-3 mb-3 flex-wrap">
            <LegendDot color="#16a34a" label={`Approuvés ${Math.round((docsStats?.docsApproved.length / docsStats?.total) * 100)}%`} />
            <LegendDot color="#d97706" label={`En attente ${Math.round((docsStats?.docsPending.length / docsStats?.total) * 100)}%`} />
            <LegendDot color="#dc2626" label={`Rejetés ${Math.round((docsStats?.docsRejected.length / docsStats?.total) * 100)}%`} />
          </div>
          <div className="relative h-52">
            <canvas ref={donutRef} />
          </div>
        </div>

        {/* Bar */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <p className="text-sm font-medium text-neutral-800">Documents par développeur</p>
          <p className="text-xs text-neutral-400 mt-0.5 mb-4">Contributions individuelles</p>
          <div className="flex gap-3 mb-3">
            <LegendDot color="#c5262e" label="Docs soumis" />
          </div>
          <div className="relative h-52">
            <canvas ref={barRef} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Line */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <p className="text-sm font-medium text-neutral-800">Activité mensuelle</p>
          <p className="text-xs text-neutral-400 mt-0.5 mb-4">Documents soumis par mois</p>
          <div className="flex gap-3 mb-3 flex-wrap">
            <LegendDot color="#c5262e" label="Soumissions" />
            <LegendDot color="#16a34a" label="Approuvés" dashed />
          </div>
          <div className="relative h-48">
            <canvas ref={lineRef} />
          </div>
        </div>

        {/* Dev ranking */}
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <p className="text-sm font-medium text-neutral-800">Classement développeurs</p>
          <p className="text-xs text-neutral-400 mt-0.5 mb-4">Nombre de documents soumis</p>
          <div className="space-y-0 divide-y divide-neutral-100">
            {users.map((dev) => (
              <div key={dev.email} className="flex items-center gap-3 py-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{ background: "#fef2f2", color: "#c5262e" }}
                >
                  {getInitials(dev.name ?? "")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{dev.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${(dev.docs?.length / MAX_DOCS) * 100}%`, background: "#c5262e" }}
                      />
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-neutral-800 shrink-0">{dev.docs.length}</span>
              </div>
            ))}

          </div>
        </div>
      </div>

    </div>
  );
}