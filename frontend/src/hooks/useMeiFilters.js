import { useState, useMemo, useCallback, useEffect } from "react";

const ITEMS_PER_PAGE = [20, 50, 100];

/**
 * Hook para filtros de Atividades MEI com URL Sync.
 */
export function useMeiFilters(atividades, searchParams, setSearchParams) {
  const [filters, setFilters] = useState(() => ({
    busca: searchParams.get("busca") || "",
    iss: searchParams.get("iss") || "Todos",
    icms: searchParams.get("icms") || "Todos",
  }));
  const [pagina, setPagina] = useState(() => {
    const p = parseInt(searchParams.get("pagina"));
    return isNaN(p) ? 1 : p;
  });
  const [porPagina, setPorPagina] = useState(() => {
    const n = parseInt(searchParams.get("porPagina"));
    return ITEMS_PER_PAGE.includes(n) ? n : 50;
  });

  // Sincroniza filtros → URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.busca) params.set("busca", filters.busca);
    if (filters.iss !== "Todos") params.set("iss", filters.iss);
    if (filters.icms !== "Todos") params.set("icms", filters.icms);
    if (pagina > 1) params.set("pagina", String(pagina));
    if (porPagina !== 50) params.set("porPagina", String(porPagina));

    setSearchParams(params, { replace: true });
  }, [filters, pagina, porPagina, setSearchParams]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagina(1);
  }, []);

  const limparFiltros = useCallback(() => {
    setFilters({ busca: "", iss: "Todos", icms: "Todos" });
    setPagina(1);
  }, []);

  const filtrados = useMemo(() => {
    const busca = filters.busca.toLowerCase().trim();
    return atividades.filter((a) => {
      if (busca) {
        const matchCnae = a.cnae.toLowerCase().includes(busca);
        const matchOcupacao = a.ocupacao.toLowerCase().includes(busca);
        const matchDesc = a.descricao.toLowerCase().includes(busca);
        if (!matchCnae && !matchOcupacao && !matchDesc) return false;
      }
      if (filters.iss !== "Todos" && a.iss !== (filters.iss === "Sim"))
        return false;
      if (filters.icms !== "Todos" && a.icms !== (filters.icms === "Sim"))
        return false;
      return true;
    });
  }, [atividades, filters]);

  const total = filtrados.length;
  const inicio = (pagina - 1) * porPagina;
  const fim = inicio + porPagina;
  const paginaAtual = filtrados.slice(inicio, fim);
  const totalPaginas = Math.ceil(total / porPagina);

  return {
    filters,
    pagina,
    porPagina,
    paginaAtual,
    total,
    totalPaginas,
    ITEMS_PER_PAGE,
    updateFilter,
    limparFiltros,
    setPagina,
    setPorPagina,
  };
}
