import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientesAPI } from "../services/api";
import { getToken } from "../utils/auth";

/**
 * Hook para consulta de CNPJ com cache (5 min staleTime)
 * Para consultas gerais onde dados cached são aceitáveis
 */
export function useConsultaCnpj(cnpj) {
  const cleanCnpj = cnpj?.replace(/\D/g, "") || "";

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["cnpj", cleanCnpj],
    queryFn: async () => {
      if (cleanCnpj.length !== 14) {
        throw new Error("CNPJ inválido. Deve conter 14 dígitos.");
      }

      const response = await fetch(
        `/api/clientes/consulta-fresh/${cleanCnpj}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erro ao consultar CNPJ");
      }

      return result.data;
    },
    enabled: cleanCnpj.length === 14,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  return {
    data: data || null,
    isLoading: isLoading || isFetching,
    error: error ? error.message : null,
    apiUsed: data?.apiUsed || null,
    refetch,
  };
}

/**
 * Hook para consulta de CNPJ SEMPRE fresca (staleTime: 0)
 * SEMPRE chama o backend - sem cache do TanStack Query
 * Para página de detalhes onde dados atualizados são obrigatórios
 */
export function useConsultaCnpjFresh(cnpj) {
  const cleanCnpj = cnpj?.replace(/\D/g, "") || "";

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["cnpj-fresh", cleanCnpj],
    queryFn: async () => {
      if (cleanCnpj.length !== 14) {
        throw new Error("CNPJ inválido. Deve conter 14 dígitos.");
      }

      // Consulta o endpoint fresh que ignora TODOS os caches do backend
      const response = await fetch(
        `/api/clientes/consulta-fresh/${cleanCnpj}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erro ao consultar CNPJ");
      }

      return result.data;
    },
    enabled: cleanCnpj.length === 14,
    staleTime: 0, // SEMPRE refetch - dados frescos obrigatórios
    gcTime: 1 * 60 * 1000, // 1 min apenas para GC
    retry: 0, // Sem retry automático (evita consumir créditos extras)
    refetchOnMount: "always", // Sempre refetch ao montar componente
    refetchOnWindowFocus: false,
  });

  return {
    data: data || null,
    isLoading: isLoading || isFetching,
    error: error ? error.message : null,
    apiUsed: data?.apiUsed || null,
    refetch,
  };
}

/**
 * Hook para salvar dados de CNPJ no banco local
 */
export function useSalvarCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados) => {
      if (dados._id) {
        const response = await clientesAPI.update(dados._id, dados);
        return response.data;
      } else {
        const response = await clientesAPI.create(dados);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
    },
  });
}

/**
 * Hook para lista de clientes com cache
 */
export function useClientes() {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const response = await clientesAPI.getAll();
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para cliente por ID com cache
 */
export function useClienteById(id) {
  return useQuery({
    queryKey: ["cliente", id],
    queryFn: async () => {
      const response = await clientesAPI.getById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para config de APIs CNPJ (admin)
 */
export function useCnpjApiConfigs() {
  return useQuery({
    queryKey: ["cnpj-api-configs"],
    queryFn: async () => {
      const response = await fetch("/api/cnpj-api-config", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) throw new Error("Erro ao buscar configs");
      return response.json();
    },
    staleTime: 30 * 1000, // 30s (mesmo TTL do backend)
    gcTime: 5 * 60 * 1000,
  });
}
