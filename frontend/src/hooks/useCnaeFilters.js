import { useState, useMemo, useCallback, useEffect } from "react";

const ITEMS_PER_PAGE = [20, 50, 100];

/**
 * Hook para filtros de CNAE com URL Sync e validação de alíquota por anexo.
 *
 * URL Sync: filtros são persistidos na URL como query params.
 * Aliquota-Anexo: a alíquota selecionada é validada contra os anexos selecionados.
 */
export function useCnaeFilters(cnaes, searchParams, setSearchParams) {
  const [filters, setFilters] = useState(() => ({
    busca: searchParams.get("busca") || "",
    tipo: searchParams.get("tipo") ? searchParams.get("tipo").split(",") : [],
    simples: searchParams.get("simples") || "Todos",
    anexo: searchParams.get("anexo") ? searchParams.get("anexo").split(",") : [],
    aliquota: searchParams.get("aliquota") || "Todas",
    fatorR: searchParams.get("fatorR") || "Todos",
    precisaIE: searchParams.get("precisaIE") || "Todos",
    soComObs: searchParams.get("soComObs") === "true",
    obsBusca: searchParams.get("obsBusca") || "",
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
    if (filters.tipo.length > 0) params.set("tipo", filters.tipo.join(","));
    if (filters.simples !== "Todos") params.set("simples", filters.simples);
    if (filters.anexo.length > 0) params.set("anexo", filters.anexo.join(","));
    if (filters.aliquota !== "Todas") params.set("aliquota", filters.aliquota);
    if (filters.fatorR !== "Todos") params.set("fatorR", filters.fatorR);
    if (filters.precisaIE !== "Todos")
      params.set("precisaIE", filters.precisaIE);
    if (filters.soComObs) params.set("soComObs", "true");
    if (filters.obsBusca) params.set("obsBusca", filters.obsBusca);
    if (pagina > 1) params.set("pagina", String(pagina));
    if (porPagina !== 50) params.set("porPagina", String(porPagina));

    setSearchParams(params, { replace: true });
  }, [filters, pagina, porPagina, setSearchParams]);

  // Calcula aliquotas disponíveis com base nos anexos selecionados
  const aliquotasDisponiveis = useMemo(() => {
    if (filters.anexo.length === 0) {
      // Nenhum anexo selecionado → todas as aliquotas do dataset
      return [...new Set(cnaes.map((c) => c.aliquota).filter(Boolean))].sort(
        (a, b) => {
          const na = parseFloat(a.replace(/[,%aà ]/gi, "").replace(",", "."));
          const nb = parseFloat(b.replace(/[,%aà ]/gi, "").replace(",", "."));
          return na - nb;
        },
      );
    }
    // Filtra CNAEs que têm pelo menos um dos anexos selecionados
    const cnaesFiltrados = cnaes.filter((c) =>
      c.anexoLista.some((a) => filters.anexo.includes(a)),
    );
    return [
      ...new Set(cnaesFiltrados.map((c) => c.aliquota).filter(Boolean)),
    ].sort((a, b) => {
      const na = parseFloat(a.replace(/[,%aà ]/gi, "").replace(",", "."));
      const nb = parseFloat(b.replace(/[,%aà ]/gi, "").replace(",", "."));
      return na - nb;
    });
  }, [cnaes, filters.anexo]);

  // Verifica se a alíquota selecionada é compatível com os anexos
  const aliquotaIncompativel =
    filters.aliquota !== "Todas" &&
    filters.anexo.length > 0 &&
    !aliquotasDisponiveis.includes(filters.aliquota);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagina(1);
  }, []);

  const limparFiltros = useCallback(() => {
    setFilters({
      busca: "",
      tipo: [],
      simples: "Todos",
      anexo: [],
      aliquota: "Todas",
      fatorR: "Todos",
      precisaIE: "Todos",
      soComObs: false,
      obsBusca: "",
    });
    setPagina(1);
  }, []);

  const toggleMulti = useCallback((key, value) => {
    setFilters((prev) => {
      const arr = prev[key];
      const novo = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      // Se mudou anexos e a alíquota ficou incompatível, reseta alíquota
      if (key === "anexo") {
        return { ...prev, [key]: novo, aliquota: "Todas" };
      }
      return { ...prev, [key]: novo };
    });
    setPagina(1);
  }, []);

  const filtrados = useMemo(() => {
    const busca = filters.busca.toLowerCase().trim();
    const obsBusca = filters.obsBusca.toLowerCase().trim();

    return cnaes.filter((c) => {
      if (busca) {
        const matchCodigo =
          c.codigo.toLowerCase().includes(busca) ||
          c.codigo.replace(/[-/]/g, "").includes(busca.replace(/[-/]/g, ""));
        const matchDesc = c.descricao.toLowerCase().includes(busca);
        if (!matchCodigo && !matchDesc) return false;
      }
      if (filters.tipo.length > 0 && !filters.tipo.includes(c.tipo))
        return false;
      if (filters.simples !== "Todos" && c.simples !== filters.simples)
        return false;
      if (
        filters.anexo.length > 0 &&
        !filters.anexo.some((a) => c.anexoLista.includes(a))
      )
        return false;
      // Se alíquota incompatível com anexos, ignora filtro de alíquota
      if (
        !aliquotaIncompativel &&
        filters.aliquota !== "Todas" &&
        c.aliquota !== filters.aliquota
      )
        return false;
      if (filters.fatorR !== "Todos" && c.fatorR !== filters.fatorR)
        return false;
      if (filters.precisaIE !== "Todos" && c.precisaIE !== filters.precisaIE)
        return false;
      if (filters.soComObs && !c.observacaoIE) return false;
      if (obsBusca && !c.observacaoIE.toLowerCase().includes(obsBusca))
        return false;
      return true;
    });
  }, [cnaes, filters, aliquotaIncompativel]);

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
    aliquotasDisponiveis,
    aliquotaIncompativel,
    updateFilter,
    limparFiltros,
    toggleMulti,
    setPagina,
    setPorPagina,
  };
}
