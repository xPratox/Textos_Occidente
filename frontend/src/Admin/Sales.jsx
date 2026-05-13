import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CalendarRange, Download, Filter, Search } from "lucide-react";
import CreateSale from "./CreateSale";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [pendingSaleCode, setPendingSaleCode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchSales = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const response = await fetch(`${API_URL}/sales`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSales(data);
    } catch (err) {
      console.error("Error cargando ventas:", err);
      if (!silent) {
        setError("No se pudieron cargar las ventas. Por favor, intente de nuevo.");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchSales({ silent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  const addSale = () => {
    fetchSales();
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return "Fecha invalida";
    }
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) + " " + date.toLocaleTimeString("es-ES");
  };

  const handleUpdateSaleStatus = async (saleCode, newStatus) => {
    setActionMessage(null);
    setPendingSaleCode(saleCode);

    try {
      const response = await fetch(`${API_URL}/sales/${saleCode}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: newStatus }),
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        throw new Error(payload?.detail || `Error al actualizar la venta: ${response.status}`);
      }

      setSales((currentSales) => currentSales.map((sale) => (sale.codigo === saleCode ? payload : sale)));
      setActionMessage({
        type: "success",
        text: `La venta ${saleCode} fue marcada como ${newStatus}.`,
      });
    } catch (err) {
      console.error(`Error al actualizar la venta ${saleCode} a ${newStatus}:`, err);
      setActionMessage({
        type: "error",
        text: err.message || "No se pudo actualizar la venta.",
      });
    } finally {
      setPendingSaleCode(null);
    }
  };

  const generatePDF = (sale) => {
    try {
      const doc = new jsPDF();
      const customerLabel = sale.cliente?.cedula || sale.cliente?.full_name || "N/A";

      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(`Recibo de Venta: #${sale.codigo}`, 14, 22);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Cliente: ${customerLabel}`, 14, 35);
      doc.text(`Fecha: ${formatDate(sale.fecha_creacion)}`, 14, 42);
      doc.text(`Estado: ${sale.estado.charAt(0).toUpperCase() + sale.estado.slice(1)}`, 14, 49);

      const tableColumn = ["Producto", "Variante", "Cantidad", "Precio Unitario", "Subtotal"];
      const tableRows = sale.detalles.map((item) => {
        const productName = item.variante?.producto?.nombre || "Producto";
        const variantLabel = `${item.variante?.color || "N/A"} / ${item.variante?.talla || "N/A"}`;
        const subtotal = (item.cantidad * (item.precio_unitario || 0)).toFixed(2);

        return [
          productName,
          variantLabel,
          item.cantidad,
          `$${(item.precio_unitario || 0).toFixed(2)}`,
          `$${subtotal}`,
        ];
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        theme: "grid",
        headStyles: { fillColor: [15, 23, 42] },
      });

      const finalY = doc.lastAutoTable.finalY;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Total: $${(sale.total || 0).toFixed(2)}`, 14, finalY + 15);
      doc.save(`venta_${sale.codigo}.pdf`);
    } catch (err) {
      console.error("Error al generar PDF:", err);
      setActionMessage({
        type: "error",
        text: "No se pudo generar el PDF de la venta.",
      });
    }
  };

  function getComparableDate(value) {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value.split("T")[0];
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  const filteredSales = sales.filter((sale) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      sale.codigo?.toLowerCase().includes(search) ||
      sale.cliente?.cedula?.toLowerCase().includes(search) ||
      sale.cliente?.full_name?.toLowerCase().includes(search);

    const matchesStatus = statusFilter === "all" || sale.estado === statusFilter;
    const saleDate = getComparableDate(sale.fecha_creacion);
    const matchesDate = !dateFilter || saleDate === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const pendingSales = filteredSales.filter((sale) => sale.estado === "pendiente");
  const resolvedSales = filteredSales.filter((sale) => sale.estado === "confirmada" || sale.estado === "cancelada");

  const confirmedResolvedCount = resolvedSales.filter((sale) => sale.estado === "confirmada").length;
  const cancelledResolvedCount = resolvedSales.filter((sale) => sale.estado === "cancelada").length;

  const getStatusClasses = (status) => {
    if (status === "pendiente") return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    if (status === "confirmada") return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  };

  const renderResolvedRows = (saleList) => {
    return saleList.map((sale) => (
      <tr key={sale.id} className="transition-colors hover:bg-slate-50/80">
        <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-950">{sale.codigo || `#${sale.id}`}</td>
        <td className="px-6 py-5">
          <p className="font-medium text-slate-950">{sale.cliente?.full_name || "Cliente no disponible"}</p>
        </td>
        <td className="px-6 py-5">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(sale.estado)}`}>
            {sale.estado.charAt(0).toUpperCase() + sale.estado.slice(1)}
          </span>
        </td>
        <td className="px-6 py-5 text-center">
          <button
            type="button"
            onClick={() => generatePDF(sale)}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
            title="Descargar PDF de la Venta"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            PDF
          </button>
        </td>
      </tr>
    ));
  };

  const renderPendingRows = (saleList) => {
    return saleList.map((sale) => (
      <tr key={sale.id} className="transition-colors hover:bg-slate-50/80">
        <td className="whitespace-nowrap px-6 py-5 font-semibold text-slate-950">{sale.codigo || `#${sale.id}`}</td>
        <td className="px-6 py-5">
          <p className="font-medium text-slate-950">{sale.cliente?.full_name || "Cliente no disponible"}</p>
        </td>
        <td className="px-6 py-5">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(sale.estado)}`}>
            {sale.estado.charAt(0).toUpperCase() + sale.estado.slice(1)}
          </span>
        </td>
        <td className="px-6 py-5 text-center">
          <div className="mx-auto flex w-full max-w-[148px] flex-col items-stretch justify-center gap-2">
            <button
              type="button"
              onClick={() => handleUpdateSaleStatus(sale.codigo, "confirmada")}
              disabled={pendingSaleCode === sale.codigo}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              title="Confirmar Venta"
            >
              {pendingSaleCode === sale.codigo ? "Procesando..." : "Confirmar"}
            </button>
            <button
              type="button"
              onClick={() => handleUpdateSaleStatus(sale.codigo, "cancelada")}
              disabled={pendingSaleCode === sale.codigo}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              title="Cancelar Venta"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => generatePDF(sale)}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100"
              title="Descargar PDF de la Venta"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              PDF
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-8">
      <CreateSale onAddSale={addSale} />

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Registro transaccional</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Tabla de ventas</h2>
            <p className="mt-2 text-sm text-slate-500">Filtra por cliente, codigo, estado o fecha para ubicar operaciones con rapidez.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:min-w-[720px]">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <Search className="h-4 w-4" aria-hidden="true" />
                Busqueda
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Cliente, codigo o cedula"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </label>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <Filter className="h-4 w-4" aria-hidden="true" />
                Estado
              </span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
              >
                <option value="all">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <CalendarRange className="h-4 w-4" aria-hidden="true" />
                Fecha
              </span>
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </label>
          </div>
        </div>

        {actionMessage && (
          <div
            className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
              actionMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                : "bg-rose-50 text-rose-800 ring-1 ring-rose-200"
            }`}
          >
            {actionMessage.text}
          </div>
        )}

        {loading && <div className="py-8 text-center text-slate-600">Cargando ventas...</div>}
        {error && <div className="py-8 text-center text-rose-600">{error}</div>}
        {!loading && !error && filteredSales.length === 0 ? (
          <div className="py-10 text-center text-slate-500">No hay ventas que coincidan con los filtros seleccionados.</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_45%),linear-gradient(135deg,_#f8fafc,_#eef2ff)] px-6 py-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/90 px-5 py-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Confirmadas</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{confirmedResolvedCount}</p>
                  </div>
                  <div className="rounded-2xl bg-white/90 px-5 py-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Canceladas</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{cancelledResolvedCount}</p>
                  </div>
                </div>
              </div>

              {resolvedSales.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-500">No hay ventas confirmadas o canceladas con los filtros actuales.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        <th className="px-6 py-4">Codigo</th>
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-center">PDF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm text-slate-700">{renderResolvedRows(resolvedSales)}</tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-[28px] border border-amber-200 bg-white shadow-sm">
              <div className="border-b border-amber-200 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.24),_transparent_42%),linear-gradient(135deg,_#fffbeb,_#fff7ed)] px-6 py-5">
                <div className="rounded-2xl bg-white/90 px-5 py-4 shadow-sm ring-1 ring-amber-200">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Pendientes</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{pendingSales.length}</p>
                </div>
              </div>

              {pendingSales.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-500">No hay ventas pendientes con los filtros actuales.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-amber-50 text-left text-xs font-semibold uppercase tracking-[0.22em] text-amber-800">
                        <th className="px-6 py-4">Codigo</th>
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-center">Gestion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm text-slate-700">{renderPendingRows(pendingSales)}</tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </div>
  );
};

export default Sales;