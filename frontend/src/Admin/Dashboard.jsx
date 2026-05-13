import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import download from "downloadjs";
import axios from "axios";
import { ArrowUpRight, BadgeDollarSign, CheckCircle2, Clock3, Download, Users2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { userData } = useAuth();
  const isAdmin = userData && (userData.role === "admin" || (Array.isArray(userData.roles) && userData.roles.includes("admin")));
  const [usersCount, setUsersCount] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportRange, setReportRange] = useState("month");
  const [year, setYear] = useState(new Date().getFullYear());

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
    },
  });

  useEffect(() => {
    if (!isAdmin) return;
    let mounted = true;

    const fetchUsersCount = async () => {
      try {
        const { data } = await api.get("/users/");
        if (mounted) {
          setUsersCount(Array.isArray(data) ? data.length : (data.count ?? null));
        }
      } catch (err) {
        console.error("No se pudo cargar conteo de usuarios:", err.response?.data || err.message);
        if (mounted) setUsersCount(null);
      }
    };

    fetchUsersCount();
    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/sales/");
      setVentas(data);
    } catch (error) {
      console.error("Error al obtener ventas:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const totalVentas = ventas.length;
    const ventasConfirmadas = ventas.filter((venta) => venta.estado === "confirmada").length;
    const ventasPendientes = ventas.filter((venta) => venta.estado === "pendiente").length;
    const montoTotal = ventas.reduce((sum, venta) => sum + venta.total, 0);

    return [
      {
        title: "Total ventas",
        value: totalVentas,
        detail: "Operaciones registradas",
        icon: BadgeDollarSign,
        tone: "bg-slate-950 text-white",
      },
      {
        title: "Confirmadas",
        value: ventasConfirmadas,
        detail: "Ventas cerradas con exito",
        icon: CheckCircle2,
        tone: "bg-emerald-50 text-emerald-700",
      },
      {
        title: "Pendientes",
        value: ventasPendientes,
        detail: "Requieren seguimiento",
        icon: Clock3,
        tone: "bg-amber-50 text-amber-700",
      },
      {
        title: "Facturacion",
        value: `$${montoTotal.toFixed(2)}`,
        detail: "Monto total acumulado",
        icon: ArrowUpRight,
        tone: "bg-blue-50 text-blue-700",
      },
    ];
  };

  const generatePDF = async () => {
    const ventasFiltradas = filterVentasByRange(reportRange);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontSize = 12;
      let y = 780;

      const drawText = async (text, x = 50, size = fontSize, isBold = false) => {
        page.drawText(text, { x, y, size, font: isBold ? boldFont : font, color: rgb(0, 0, 0) });
        y -= size + 6;
      };

      await drawText("REPORTE DE VENTAS - Textos Occidente", 50, 18, true);
      await drawText(`Generado: ${new Date().toLocaleString()}`);
      await drawText(`Periodo: ${getRangeTitle(reportRange)}`, 50, 14);
      await drawText("");

      const totalVentas = ventasFiltradas.length;
      const totalMonto = ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0);

      await drawText("RESUMEN:", 50, 14, true);
      await drawText(`• Ventas: ${totalVentas}`);
      await drawText(`• Monto: $${totalMonto.toFixed(2)}`);
      await drawText("");

      await drawText("DETALLE DE VENTAS:", 50, 14, true);
      await drawText("----------------------------------------");

      for (const venta of ventasFiltradas) {
        await drawText(`COD: ${venta.codigo}`, 50, 12, true);
        await drawText(`Fecha: ${new Date(venta.fecha_creacion).toLocaleDateString()}`);
        await drawText(`Cliente: ${venta.cliente.full_name} (${venta.cliente.cedula})`);
        await drawText(`Estado: ${venta.estado.toUpperCase()}`);
        await drawText(`Total: $${venta.total.toFixed(2)}`);
        await drawText("Productos:");

        for (const detalle of venta.detalles) {
          const prod = detalle.variante.producto;
          await drawText(
            `- ${prod.nombre} (${detalle.variante.color}/${detalle.variante.talla}) x${detalle.cantidad} | $${detalle.precio_unitario.toFixed(2)} c/u`,
            60,
            10
          );
        }

        await drawText("----------------------------------------");
        y -= 10;
      }

      const pdfBytes = await pdfDoc.save();
      download(pdfBytes, `reporte_${reportRange}_${new Date().toISOString().slice(0, 10)}.pdf`, "application/pdf");
    } catch (error) {
      console.error("Error al generar PDF:", error);
    }
  };

  const filterVentasByRange = (range) => {
    const now = new Date();
    let startDate;

    switch (range) {
      case "week":
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return ventas;
    }

    return ventas.filter((venta) => new Date(venta.fecha_creacion) >= startDate);
  };

  const prepareChartData = () => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    return months.map((month, index) => {
      const ventasMes = ventas.filter(
        (venta) => new Date(venta.fecha_creacion).getMonth() === index && new Date(venta.fecha_creacion).getFullYear() === year
      );

      return {
        month,
        total: ventasMes.reduce((sum, venta) => sum + venta.total, 0),
        confirmadas: ventasMes.filter((venta) => venta.estado === "confirmada").length,
        pendientes: ventasMes.filter((venta) => venta.estado === "pendiente").length,
      };
    });
  };

  const getRangeTitle = (range) => {
    const options = { week: "Semana", month: "Mes", year: "Ano" };
    return options[range] || "";
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-[28px] bg-white shadow-sm">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 animate-spin text-slate-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-slate-600">Cargando datos de ventas...</p>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();
  const filteredVentas = filterVentasByRange(reportRange);
  const filteredRevenue = filteredVentas.reduce((sum, venta) => sum + venta.total, 0);

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {getStats().map((stat) => {
          const Icon = stat.icon;
          return (
            <article
              key={stat.title}
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{stat.detail}</p>
                </div>
                <div className={`rounded-2xl p-3 ${stat.tone}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
            </article>
          );
        })}

        {isAdmin && (
          <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Usuarios</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{usersCount !== null ? usersCount : "-"}</p>
                <p className="mt-2 text-sm text-slate-500">Total de usuarios registrados</p>
              </div>
              <div className="rounded-2xl bg-violet-50 p-3 text-violet-700">
                <Users2 className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </article>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.9fr)]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Analitica mensual</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Comportamiento de ventas por mes</h2>
              <p className="mt-2 text-sm text-slate-500">Comparativa entre confirmadas, pendientes y facturacion del ano seleccionado.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="text-sm font-medium text-slate-600" htmlFor="dashboardYear">
                Ano
              </label>
              <input
                id="dashboardYear"
                type="number"
                value={year}
                onChange={(event) => setYear(Number(event.target.value) || new Date().getFullYear())}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white sm:w-32"
              />
            </div>
          </div>

          <div className="mt-8 h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={10}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 20,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
                  }}
                />
                <Bar dataKey="total" fill="#0f172a" radius={[10, 10, 0, 0]} name="Facturacion" />
                <Bar dataKey="confirmadas" fill="#2563eb" radius={[10, 10, 0, 0]} name="Confirmadas" />
                <Bar dataKey="pendientes" fill="#94a3b8" radius={[10, 10, 0, 0]} name="Pendientes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Resumen filtrado</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Reporte listo para exportar</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="reportRange" className="mb-2 block text-sm font-medium text-slate-600">Periodo</label>
                <select
                  id="reportRange"
                  value={reportRange}
                  onChange={(e) => setReportRange(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                >
                  <option value="week">Semanal</option>
                  <option value="month">Mensual</option>
                  <option value="year">Anual</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Ventas</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{filteredVentas.length}</p>
                </div>
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-blue-700">Facturacion</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">${filteredRevenue.toFixed(2)}</p>
                </div>
              </div>

              <button
                onClick={generatePDF}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Exportar a PDF
              </button>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Observaciones</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">Estado dominante</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {filteredVentas.filter((venta) => venta.estado === "confirmada").length >=
                  filteredVentas.filter((venta) => venta.estado === "pendiente").length
                    ? "Mayor proporcion de ventas confirmadas"
                    : "Pendientes por encima del cierre esperado"}
                </p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-900">Recomendacion visual</p>
                <p className="mt-2 text-sm leading-6 text-blue-900/80">
                  Usa este resumen para validar el periodo antes de descargar reportes o revisar el detalle operativo en Ventas.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;