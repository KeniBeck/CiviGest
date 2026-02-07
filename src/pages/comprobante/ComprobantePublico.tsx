import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  Download,
  Eye,
  AlertCircle,
  Shield,
  CheckCircle,
  Github,
  User,
  Calendar,
  CalendarCheck,
  MapPin,
  CreditCard,
  FileSearch,
  ArrowDownToLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useComprobantesByDocumento } from "@/hooks/queries/useComprobante";
import { useNotification } from "@/hooks/useNotification";
import { ComprobantePublicoModal } from "@/components/features/permisos/ComprobantePublicoModal";
import { ticketService } from "@/services/ticket.service";
import type { Permiso } from "@/types/permiso.type";
import Logo from "@/assets/tu ciudaddigital LOGO sin nombre.svg";
import "./ComprobantePublico.css";

export default function ComprobantePublico() {
  const notify = useNotification();
  const [documento, setDocumento] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPermiso, setSelectedPermiso] = useState<Permiso | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [urlParams, setUrlParams] = useState<{ dni?: string; idPago?: string }>(
    {},
  );

  const { data, isLoading, isError, refetch } = useComprobantesByDocumento(
    searchQuery,
    false,
  );

  // Leer parámetros de URL (para QR codes)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dni = params.get("dni");
    const idPago = params.get("idPago");

    if (dni) {
      setUrlParams({ dni, idPago: idPago || undefined });
      setDocumento(dni);
      setSearchQuery(dni);
    }
  }, []);

  // Ejecutar búsqueda automáticamente cuando searchQuery se setea desde URL
  useEffect(() => {
    if (searchQuery && urlParams.dni) {
      // Pequeño delay para asegurar que el estado está listo
      const timer = setTimeout(() => {
        refetch();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, urlParams.dni, refetch]);

  // Abrir modal automáticamente cuando viene con idPago en URL
  useEffect(() => {
    if (urlParams.idPago && data && data.items.length > 0) {
      // Buscar el permiso que tiene el pago con el id especificado
      const permisoConPago = data.items.find((permiso) =>
        permiso.pagos?.some((pago) => pago.id.toString() === urlParams.idPago),
      );

      if (permisoConPago) {
        setSelectedPermiso(permisoConPago);
        setIsModalOpen(true);
        // Limpiar el parámetro para que no se abra de nuevo
        setUrlParams((prev) => ({ ...prev, idPago: undefined }));
      }
    }
  }, [data, urlParams.idPago]);

  // Habilitar scroll en esta página pública
  useEffect(() => {
    // Guardar estado original
    const htmlOriginalOverflow = document.documentElement.style.overflow;
    const bodyOriginalOverflow = document.body.style.overflow;
    const rootElement = document.getElementById("root");
    const rootOriginalOverflow = rootElement?.style.overflow;

    // Habilitar scroll forzadamente
    document.documentElement.style.setProperty("overflow", "auto", "important");
    document.documentElement.style.setProperty("height", "auto", "important");
    document.body.style.setProperty("overflow", "auto", "important");
    document.body.style.setProperty("height", "auto", "important");
    if (rootElement) {
      rootElement.style.setProperty("overflow", "auto", "important");
      rootElement.style.setProperty("height", "auto", "important");
    }

    // Restaurar al desmontar
    return () => {
      document.documentElement.style.overflow = htmlOriginalOverflow;
      document.body.style.overflow = bodyOriginalOverflow;
      if (rootElement && rootOriginalOverflow !== undefined) {
        rootElement.style.overflow = rootOriginalOverflow;
      }
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedDocumento = documento.trim();

    if (!trimmedDocumento) {
      notify.error("Error", "Por favor ingrese un documento de identificación");
      return;
    }

    if (trimmedDocumento.length < 3) {
      notify.error("Error", "El documento debe tener al menos 3 caracteres");
      return;
    }

    // Solo actualizar si es diferente al query actual
    if (trimmedDocumento !== searchQuery) {
      setSearchQuery(trimmedDocumento);
      // Esperar un tick para que se actualice el estado
      setTimeout(() => {
        refetch();
      }, 0);
    } else {
      refetch();
    }
  };

  const handleViewPermiso = (permiso: Permiso) => {
    setSelectedPermiso(permiso);
    setIsModalOpen(true);
  };

  const handleDownloadTicket = async (permiso: Permiso) => {
    const pago = permiso.pagos?.[0];

    if (!pago) {
      notify.error("Error", "No se encontró información de pago");
      return;
    }

    setDownloadingId(permiso.id);
    try {
      const configuracion = (pago.subsede as any)?.configuracion;

      const pdfBlob = await ticketService.generateTicketPermiso({
        pago: pago as any,
        permiso,
        logoUrl: configuracion?.logo,
        nombreCliente: configuracion?.nombreCliente,
        slogan: configuracion?.slogan,
      });

      const filename = `ticket-${permiso.folio}-${Date.now()}.pdf`;
      ticketService.downloadPDF(pdfBlob, filename);
      notify.success("Éxito", "Ticket descargado correctamente");
    } catch (error) {
      console.error("Error al descargar ticket:", error);
      notify.error("Error", "Error al descargar el ticket");
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `$${num.toFixed(2)}`;
  };

  const getEstatusColor = (estatus: string) => {
    switch (estatus) {
      case "APROBADO":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
      case "RECHAZADO":
        return "bg-rose-50 text-rose-700 border border-rose-200/50";
      case "PENDIENTE":
        return "bg-amber-50 text-amber-700 border border-amber-200/50";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200/50";
    }
  };

  return (
    <div
      data-comprobante-page
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden"
      style={{ overflow: "auto", height: "auto" }}
    >
      {/* Elementos decorativos neumórficos de fondo */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/20 to-indigo-100/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-100/20 to-pink-100/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

      {/* Hero Section - Diseño neumórfico glassmorphism */}
      <div
        className={`relative backdrop-blur-xl bg-gradient-to-br from-white/70 via-white/60 to-white/50 border-b border-white/20 shadow-[0_8px_32px_rgba(15,23,42,0.08)] transition-all duration-700 ${
          searchQuery ? "py-10" : "py-20"
        }`}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 shadow-[8px_8px_24px_rgba(0,0,0,0.06),-8px_-8px_24px_rgba(255,255,255,0.9),inset_2px_2px_6px_rgba(0,0,0,0.03)] group-hover:shadow-[10px_10px_28px_rgba(0,0,0,0.08),-10px_-10px_28px_rgba(255,255,255,1),inset_2px_2px_6px_rgba(0,0,0,0.04)] transition-all duration-300">
                  <img
                    src={Logo}
                    alt="Tu Ciudad Digital"
                    className="h-16 w-16 md:h-20 md:w-20 object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>

            <h1
              className={`font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-600 mb-4 transition-all duration-700 ${
                searchQuery
                  ? "text-3xl md:text-4xl"
                  : "text-5xl md:text-6xl lg:text-7xl"
              }`}
              style={{
                textShadow: "0 2px 20px rgba(59, 130, 246, 0.1)",
                letterSpacing: "-0.02em",
              }}
            >
              Consulta tus Comprobantes
            </h1>
            {!searchQuery && (
              <>
                <p className="text-lg md:text-xl text-slate-600 mb-10 animate-fade-in font-medium max-w-2xl mx-auto leading-relaxed">
                  Ingresa tu documento de identificación para ver tus permisos y
                  descargar tickets
                </p>

                {/* Badges informativos */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-[2px_2px_8px_rgba(0,0,0,0.04),-2px_-2px_8px_rgba(255,255,255,0.8)] border border-white/50">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">
                      Seguro y Confiable
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-[2px_2px_8px_rgba(0,0,0,0.04),-2px_-2px_8px_rgba(255,255,255,0.8)] border border-white/50">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-slate-700">
                      Descarga Instantánea
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Buscador con efecto neumórfico */}
            <form onSubmit={handleSearch} className="relative">
              <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
                <div className="relative flex-1 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Input
                    type="text"
                    placeholder="Ingresa tu documento de identificación (INE, CURP, etc.)"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    className="relative pl-14 h-16 text-base bg-white/90 backdrop-blur-md border-0 focus:ring-2 focus:ring-blue-400/50 rounded-3xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,1),0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.07),inset_-2px_-2px_5px_rgba(255,255,255,1),0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300"
                  />
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500/70" />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="h-16 px-10 !bg-gradient-to-br !from-blue-500 !to-indigo-600 hover:!from-blue-600 hover:!to-indigo-700 !text-white shadow-[0_8px_24px_rgba(59,130,246,0.25)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.35)] rounded-3xl font-semibold whitespace-nowrap transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 !border-0"
                  style={{
                    background:
                      "linear-gradient(to bottom right, rgb(59, 130, 246), rgb(99, 102, 241))",
                  }}
                >
                  {isLoading ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Estado de Carga */}
          {isLoading && (
            <div className="text-center py-20 animate-fade-in">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute w-24 h-24 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-xl"></div>
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-white to-slate-50 shadow-[inset_4px_4px_12px_rgba(0,0,0,0.06),inset_-4px_-4px_12px_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.08)] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-500 border-r-indigo-500"></div>
                </div>
              </div>
              <p className="text-slate-700 text-lg font-medium">
                Buscando tus comprobantes...
              </p>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="relative bg-gradient-to-br from-white to-red-50/30 backdrop-blur-xl rounded-[2rem] shadow-[8px_8px_32px_rgba(239,68,68,0.1),-8px_-8px_32px_rgba(255,255,255,0.9)] p-12 text-center animate-fade-in overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-red-200/15 to-pink-200/15 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-50 to-white shadow-[4px_4px_16px_rgba(239,68,68,0.15),-4px_-4px_16px_rgba(255,255,255,0.9)] mb-6">
                  <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-red-800 mb-3">
                  Error al buscar comprobantes
                </h3>
                <p className="text-red-600/90 text-lg">
                  Ocurrió un error al procesar tu solicitud. Por favor,
                  inténtalo de nuevo.
                </p>
              </div>
            </div>
          )}

          {/* Sin resultados */}
          {!isLoading &&
            !isError &&
            data &&
            data.items.length === 0 &&
            searchQuery && (
              <div className="relative bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-xl rounded-[2rem] shadow-[8px_8px_32px_rgba(0,0,0,0.06),-8px_-8px_32px_rgba(255,255,255,0.9)] p-16 text-center animate-fade-in overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-br from-slate-200/15 to-blue-200/15 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="w-28 h-28 bg-gradient-to-br from-white to-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[8px_8px_24px_rgba(0,0,0,0.06),-8px_-8px_24px_rgba(255,255,255,0.9),inset_2px_2px_6px_rgba(0,0,0,0.04)]">
                    <FileText className="h-14 w-14 text-slate-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-4">
                    No se encontraron permisos
                  </h3>
                  <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                    No hay permisos asociados al documento{" "}
                    <strong className="text-slate-800">{searchQuery}</strong>
                  </p>
                  <Button
                    onClick={() => {
                      setDocumento("");
                      setSearchQuery("");
                    }}
                    className="h-16 px-10 !bg-gradient-to-br !from-blue-500 !to-indigo-600 hover:!from-blue-600 hover:!to-indigo-700 !text-white shadow-[0_8px_24px_rgba(59,130,246,0.25)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.35)] rounded-3xl font-semibold whitespace-nowrap transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 !border-0"
                    style={{
                      background:
                        "linear-gradient(to bottom right, rgb(59, 130, 246), rgb(99, 102, 241))",
                    }}
                  >
                    Realizar otra búsqueda
                  </Button>
                </div>
              </div>
            )}

          {/* Lista de Resultados */}
          {!isLoading && !isError && data && data.items.length > 0 && (
            <div className="space-y-8 animate-slide-up">
              <div className="relative bg-gradient-to-br from-white to-blue-50/40 backdrop-blur-xl rounded-[2rem] shadow-[8px_8px_32px_rgba(0,0,0,0.06),-8px_-8px_32px_rgba(255,255,255,0.9)] p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-200/15 to-indigo-200/15 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-blue-600 mb-3">
                    Comprobantes Encontrados
                  </h2>
                  <p className="text-slate-600 text-lg">
                    Se encontraron{" "}
                    <strong className="text-blue-600">
                      {data.pagination.totalItems}
                    </strong>{" "}
                    permiso(s) para el documento{" "}
                    <strong className="text-slate-800">{searchQuery}</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {data.items.map((permiso, index) => {
                  const pago = permiso.pagos?.[0];

                  return (
                    <Card
                      key={permiso.id}
                      className="relative overflow-hidden bg-gradient-to-br from-white to-white/80 backdrop-blur-xl rounded-[2rem] shadow-[12px_12px_40px_rgba(0,0,0,0.06),-12px_-12px_40px_rgba(255,255,255,0.9)] hover:shadow-[16px_16px_48px_rgba(0,0,0,0.08),-16px_-16px_48px_rgba(255,255,255,1)] transition-all duration-500 animate-fade-in-up border-0 group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Decoración de fondo */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/10 to-indigo-200/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-200/10 to-pink-200/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>

                      <div className="relative z-10 p-8">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[4px_4px_16px_rgba(59,130,246,0.2),-2px_-2px_12px_rgba(255,255,255,0.3)]">
                                <FileText className="h-6 w-6 text-white" />
                              </div>
                              <h3 className="text-2xl font-bold text-slate-800">
                                {permiso.tipoPermiso?.nombre}
                              </h3>
                            </div>
                            <p className="text-sm text-slate-600 mb-3 ml-16">
                              Folio:{" "}
                              <span className="font-bold text-slate-900 bg-slate-100/50 px-3 py-1 rounded-lg">
                                {permiso.folio}
                              </span>
                            </p>
                            <div className="ml-16">
                              <Badge
                                className={`${getEstatusColor(permiso.estatus)} shadow-[2px_2px_8px_rgba(0,0,0,0.05),-2px_-2px_8px_rgba(255,255,255,0.5)] px-4 py-1.5 text-sm font-semibold`}
                              >
                                {permiso.estatus}
                              </Badge>
                            </div>
                          </div>

                          {pago && (
                            <div className="relative bg-gradient-to-br from-blue-50/60 to-indigo-50/60 backdrop-blur-sm rounded-2xl p-6 shadow-[inset_2px_2px_8px_rgba(0,0,0,0.04),inset_-2px_-2px_8px_rgba(255,255,255,0.8),4px_4px_16px_rgba(59,130,246,0.1)] border border-white/50 overflow-hidden">
                              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-300/15 to-indigo-300/15 rounded-full blur-xl"></div>
                              <p className="text-xs text-slate-600 font-semibold mb-2 relative z-10 uppercase tracking-wide">
                                Total Pagado
                              </p>
                              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 relative z-10">
                                {formatCurrency(pago.total)}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <div className="relative bg-gradient-to-br from-white/90 to-slate-50/60 backdrop-blur-sm rounded-3xl p-6 shadow-[6px_6px_20px_rgba(0,0,0,0.08),-6px_-6px_20px_rgba(255,255,255,0.9)] border border-white/60 overflow-hidden group/card hover:shadow-[8px_8px_28px_rgba(0,0,0,0.1),-8px_-8px_28px_rgba(255,255,255,1)] hover:-translate-y-1 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-300/20 to-blue-300/20 rounded-full blur-2xl group-hover/card:scale-125 transition-transform duration-500"></div>
                            <div className="flex items-start justify-between mb-4 relative z-10">
                              <div className="flex-1">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                                  Solicitante
                                </p>
                                <p className="text-base font-black text-slate-900 leading-tight">
                                  {permiso.nombreCiudadano}
                                </p>
                              </div>
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-white flex items-center justify-center shadow-[4px_4px_12px_rgba(0,0,0,0.08),-4px_-4px_12px_rgba(255,255,255,0.9),inset_1px_1px_3px_rgba(0,0,0,0.03)] group-hover/card:shadow-[6px_6px_16px_rgba(0,0,0,0.1),-6px_-6px_16px_rgba(255,255,255,1)] group-hover/card:scale-110 group-hover/card:rotate-6 transition-all duration-300 flex-shrink-0">
                                <User className="h-7 w-7 text-slate-600 group-hover/card:scale-110 transition-transform duration-300" />
                              </div>
                            </div>
                          </div>

                          <div className="relative bg-gradient-to-br from-white/90 to-blue-50/60 backdrop-blur-sm rounded-3xl p-6 shadow-[6px_6px_20px_rgba(59,130,246,0.1),-6px_-6px_20px_rgba(255,255,255,0.9)] border border-white/60 overflow-hidden group/card hover:shadow-[8px_8px_28px_rgba(59,130,246,0.15),-8px_-8px_28px_rgba(255,255,255,1)] hover:-translate-y-1 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl group-hover/card:scale-125 transition-transform duration-500"></div>
                            <div className="flex items-start justify-between mb-4 relative z-10">
                              <div className="flex-1">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                                  Fecha de Emisión
                                </p>
                                <p className="text-base font-black text-slate-900 leading-tight">
                                  {formatDate(permiso.fechaEmision)}
                                </p>
                              </div>
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-[4px_4px_12px_rgba(59,130,246,0.15),-4px_-4px_12px_rgba(255,255,255,0.9),inset_1px_1px_3px_rgba(0,0,0,0.03)] group-hover/card:shadow-[6px_6px_16px_rgba(59,130,246,0.2),-6px_-6px_16px_rgba(255,255,255,1)] group-hover/card:scale-110 group-hover/card:rotate-6 transition-all duration-300 flex-shrink-0">
                                <Calendar className="h-7 w-7 text-blue-600 group-hover/card:scale-110 transition-transform duration-300" />
                              </div>
                            </div>
                          </div>

                          <div className="relative bg-gradient-to-br from-white/90 to-emerald-50/60 backdrop-blur-sm rounded-3xl p-6 shadow-[6px_6px_20px_rgba(16,185,129,0.1),-6px_-6px_20px_rgba(255,255,255,0.9)] border border-white/60 overflow-hidden group/card hover:shadow-[8px_8px_28px_rgba(16,185,129,0.15),-8px_-8px_28px_rgba(255,255,255,1)] hover:-translate-y-1 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-300/20 to-teal-300/20 rounded-full blur-2xl group-hover/card:scale-125 transition-transform duration-500"></div>
                            <div className="flex items-start justify-between mb-4 relative z-10">
                              <div className="flex-1">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                                  Vigencia hasta
                                </p>
                                <p className="text-base font-black text-slate-900 leading-tight">
                                  {formatDate(permiso.fechaVencimiento)}
                                </p>
                              </div>
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center shadow-[4px_4px_12px_rgba(16,185,129,0.15),-4px_-4px_12px_rgba(255,255,255,0.9),inset_1px_1px_3px_rgba(0,0,0,0.03)] group-hover/card:shadow-[6px_6px_16px_rgba(16,185,129,0.2),-6px_-6px_16px_rgba(255,255,255,1)] group-hover/card:scale-110 group-hover/card:rotate-6 transition-all duration-300 flex-shrink-0">
                                <CalendarCheck className="h-7 w-7 text-emerald-600 group-hover/card:scale-110 transition-transform duration-300" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {permiso.sede && permiso.subsede && (
                          <div className="relative bg-gradient-to-br from-white/90 to-indigo-50/60 backdrop-blur-sm rounded-3xl p-6 mb-8 shadow-[6px_6px_20px_rgba(99,102,241,0.1),-6px_-6px_20px_rgba(255,255,255,0.9)] border border-white/60 overflow-hidden group/location hover:shadow-[8px_8px_28px_rgba(99,102,241,0.15),-8px_-8px_28px_rgba(255,255,255,1)] hover:-translate-y-1 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-300/20 to-purple-300/20 rounded-full blur-2xl group-hover/location:scale-125 transition-transform duration-500"></div>
                            <div className="flex items-start justify-between relative z-10">
                              <div className="flex-1">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">
                                  Ubicación
                                </p>
                                <p className="text-base font-black text-slate-900 leading-tight">
                                  {permiso.sede.name} - {permiso.subsede.name}
                                </p>
                              </div>
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-[4px_4px_12px_rgba(99,102,241,0.15),-4px_-4px_12px_rgba(255,255,255,0.9),inset_1px_1px_3px_rgba(0,0,0,0.03)] group-hover/location:shadow-[6px_6px_16px_rgba(99,102,241,0.2),-6px_-6px_16px_rgba(255,255,255,1)] group-hover/location:scale-110 group-hover/location:rotate-6 transition-all duration-300 flex-shrink-0">
                                <MapPin className="h-7 w-7 text-indigo-600 group-hover/location:scale-110 transition-transform duration-300" />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button
                            onClick={() => handleViewPermiso(permiso)}
                            className="flex-1 h-14 !bg-gradient-to-br !from-blue-500 !to-indigo-600 hover:!from-blue-600 hover:!to-indigo-700 !text-white shadow-[0_8px_24px_rgba(59,130,246,0.25)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.35)] rounded-2xl font-semibold text-base transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 !border-0 group/btn"
                            style={{
                              background:
                                "linear-gradient(to bottom right, rgb(59, 130, 246), rgb(99, 102, 241))",
                            }}
                          >
                            <Eye className="mr-2 h-5 w-5 group-hover/btn:scale-110 transition-transform duration-300" />
                            Ver Detalles
                          </Button>

                          {pago && (
                            <Button
                              onClick={() => handleDownloadTicket(permiso)}
                              disabled={downloadingId === permiso.id}
                              className="flex-1 h-14 !bg-gradient-to-br !from-indigo-500 !to-purple-600 hover:!from-indigo-600 hover:!to-purple-700 !text-white shadow-[0_8px_24px_rgba(99,102,241,0.25)] hover:shadow-[0_12px_32px_rgba(99,102,241,0.35)] rounded-2xl font-semibold text-base transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 !border-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none group/btn"
                              style={{
                                background:
                                  downloadingId === permiso.id
                                    ? undefined
                                    : "linear-gradient(to bottom right, rgb(99, 102, 241), rgb(147, 51, 234))",
                              }}
                            >
                              <Download className="mr-2 h-5 w-5 group-hover/btn:scale-110 transition-transform duration-300" />
                              {downloadingId === permiso.id
                                ? "Descargando..."
                                : "Descargar Ticket"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Botón para nueva búsqueda */}
              <div className="text-center pt-8">
                <Button
                  onClick={() => {
                    setDocumento("");
                    setSearchQuery("");
                  }}
                  size="lg"
                     className="h-16 px-10 !bg-gradient-to-br !from-blue-500 !to-indigo-600 hover:!from-blue-600 hover:!to-indigo-700 !text-white shadow-[0_8px_24px_rgba(59,130,246,0.25)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.35)] rounded-3xl font-semibold whitespace-nowrap transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 !border-0"
                    style={{
                      background:
                        "linear-gradient(to bottom right, rgb(59, 130, 246), rgb(99, 102, 241))",
                    }}
                  >
                  Realizar otra búsqueda
                </Button>
              </div>
            </div>
          )}

          {/* Mensaje inicial (sin búsqueda realizada) */}
          {!searchQuery && !isLoading && (
            <div className="relative bg-gradient-to-br from-white to-blue-50/40 backdrop-blur-xl rounded-[2rem] shadow-[12px_12px_40px_rgba(0,0,0,0.06),-12px_-12px_40px_rgba(255,255,255,0.9)] p-16 text-center overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-blue-200/15 to-indigo-200/15 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100/60 to-indigo-100/60 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 shadow-[8px_8px_24px_rgba(59,130,246,0.1),-8px_-8px_24px_rgba(255,255,255,0.9),inset_2px_2px_8px_rgba(0,0,0,0.04)]">
                  <Search className="h-16 w-16 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4">
                  ¿Cómo funciona?
                </h3>
                <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                  Ingresa tu documento de identificación en el buscador de
                  arriba para consultar tus permisos y descargar los
                  comprobantes correspondientes.
                </p>

                {/* Pasos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
                  <div className="relative bg-gradient-to-br from-white/90 to-blue-50/60 backdrop-blur-sm rounded-3xl p-7 shadow-[6px_6px_20px_rgba(59,130,246,0.1),-6px_-6px_20px_rgba(255,255,255,0.9)] border border-white/60 group/step hover:shadow-[8px_8px_28px_rgba(59,130,246,0.15),-8px_-8px_28px_rgba(255,255,255,1)] hover:-translate-y-1 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-2xl group-hover/step:scale-125 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] group-hover/step:shadow-[0_10px_24px_rgba(59,130,246,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] group-hover/step:scale-110 transition-all duration-300">
                          <span className="text-white font-black text-2xl">
                            1
                          </span>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-[4px_4px_12px_rgba(59,130,246,0.15),-4px_-4px_12px_rgba(255,255,255,0.9),inset_1px_1px_3px_rgba(0,0,0,0.03)] group-hover/step:scale-110 group-hover/step:rotate-6 transition-all duration-300">
                          <CreditCard className="h-7 w-7 text-blue-600 group-hover/step:scale-110 transition-transform duration-300" />
                        </div>
                      </div>
                      <h4 className="font-black text-slate-900 mb-3 text-xl">
                        Ingresa tu DNI
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Escribe tu documento de identificación en el campo de
                        búsqueda
                      </p>
                    </div>
                  </div>

                  <div className="relative bg-gradient-to-br from-white/90 to-indigo-50/60 backdrop-blur-sm rounded-3xl p-7 shadow-[6px_6px_20px_rgba(99,102,241,0.1),-6px_-6px_20px_rgba(255,255,255,0.9)] border border-white/60 group/step hover:shadow-[8px_8px_28px_rgba(99,102,241,0.15),-8px_-8px_28px_rgba(255,255,255,1)] hover:-translate-y-1 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-300/20 to-purple-300/20 rounded-full blur-2xl group-hover/step:scale-125 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] group-hover/step:shadow-[0_10px_24px_rgba(99,102,241,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] group-hover/step:scale-110 transition-all duration-300">
                          <span className="text-white font-black text-2xl">
                            2
                          </span>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center shadow-[4px_4px_12px_rgba(99,102,241,0.15),-4px_-4px_12px_rgba(255,255,255,0.9),inset_1px_1px_3px_rgba(0,0,0,0.03)] group-hover/step:scale-110 group-hover/step:rotate-6 transition-all duration-300">
                          <FileSearch className="h-7 w-7 text-indigo-600 group-hover/step:scale-110 transition-transform duration-300" />
                        </div>
                      </div>
                      <h4 className="font-black text-slate-900 mb-3 text-xl">
                        Consulta tus permisos
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Visualiza todos tus permisos y su información detallada
                      </p>
                    </div>
                  </div>

                  <div className="relative bg-gradient-to-br from-white/90 to-purple-50/60 backdrop-blur-sm rounded-3xl p-7 shadow-[6px_6px_20px_rgba(147,51,234,0.1),-6px_-6px_20px_rgba(255,255,255,0.9)] border border-white/60 group/step hover:shadow-[8px_8px_28px_rgba(147,51,234,0.15),-8px_-8px_28px_rgba(255,255,255,1)] hover:-translate-y-1 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-2xl group-hover/step:scale-125 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(147,51,234,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] group-hover/step:shadow-[0_10px_24px_rgba(147,51,234,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] group-hover/step:scale-110 transition-all duration-300">
                          <span className="text-white font-black text-2xl">
                            3
                          </span>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shadow-[4px_4px_12px_rgba(147,51,234,0.15),-4px_-4px_12px_rgba(255,255,255,0.9),inset_1px_1px_3px_rgba(0,0,0,0.03)] group-hover/step:scale-110 group-hover/step:rotate-6 transition-all duration-300">
                          <ArrowDownToLine className="h-7 w-7 text-purple-600 group-hover/step:scale-110 transition-transform duration-300" />
                        </div>
                      </div>
                      <h4 className="font-black text-slate-900 mb-3 text-xl">
                        Descarga tu ticket
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Obtén tu comprobante en formato PDF al instante
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative backdrop-blur-xl bg-gradient-to-br from-white/60 via-white/50 to-white/40 border-t border-white/20 shadow-[0_-8px_32px_rgba(15,23,42,0.06)] mt-16">
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Logo y Nombre */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-3 shadow-[4px_4px_12px_rgba(0,0,0,0.04),-4px_-4px_12px_rgba(255,255,255,0.8)]">
                    <img
                      src={Logo}
                      alt="Tu Ciudad Digital"
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">
                    Tu Ciudad Digital
                  </h4>
                  <p className="text-sm text-slate-600">
                    Transformando la gestión municipal
                  </p>
                </div>
              </div>

              {/* Info Central */}
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">
                  © {new Date().getFullYear()} Tu Ciudad Digital. Todos los
                  derechos reservados.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-slate-500">
                    Plataforma segura y cifrada
                  </span>
                </div>
              </div>

              {/* Desarrollador */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">
                    Desarrollado por
                  </p>
                  <a
                    href="https://github.com/KeniBeck"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-slate-800 hover:text-blue-600 transition-colors duration-300 flex items-center justify-end gap-2 group"
                  >
                    <span>KeniBeck</span>
                    <Github className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                </div>
                <a
                  href="https://github.com/KeniBeck"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-full p-1 shadow-[4px_4px_12px_rgba(0,0,0,0.06),-4px_-4px_12px_rgba(255,255,255,0.8)] group-hover:shadow-[6px_6px_16px_rgba(0,0,0,0.08),-6px_-6px_16px_rgba(255,255,255,1)] transition-all duration-300">
                    <img
                      src="https://github.com/KeniBeck.png"
                      alt="KeniBeck"
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-white group-hover:ring-blue-400 transition-all duration-300"
                    />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Detalles */}
      <ComprobantePublicoModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        permiso={selectedPermiso}
      />
    </div>
  );
}
