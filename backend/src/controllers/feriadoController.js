const prisma = require('../config/prisma');

/**
 * GET /api/feriados/
 * Listar feriados (púbico) - com filtros opcionais
 * Query params: ano, abrangencia, uf
 */
const listarFeriados = async (req, res) => {
  try {
    const { ano, abrangencia, uf } = req.query;

    const where = {};
    if (ano) where.ano = parseInt(ano);
    if (abrangencia && ['NACIONAL', 'ESTADUAL', 'MUNICIPAL'].includes(abrangencia)) {
      where.abrangencia = abrangencia;
    }
    if (uf) where.uf = uf.toUpperCase();

    const feriados = await prisma.calendarioFeriado.findMany({
      where,
      orderBy: [{ data: 'asc' }],
      select: {
        id: true,
        data: true,
        nome: true,
        abrangencia: true,
        uf: true,
        municipio: true,
        ano: true,
        recorrente: true,
        setorAfetado: true,
        descricao: true
      }
    });

    res.json({ success: true, feriados, total: feriados.length });
  } catch (error) {
    console.error('[Feriados] Erro ao listar feriados:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar feriados', error: error.message });
  }
};

/**
 * GET /api/feriados/admin
 * Admin: listar todos os feriados com filtros avançados
 */
const listarFeriadosAdmin = async (req, res) => {
  try {
    const { ano, abrangencia, uf, recorrente } = req.query;

    const where = {};
    if (ano) where.ano = parseInt(ano);
    if (abrangencia && ['NACIONAL', 'ESTADUAL', 'MUNICIPAL'].includes(abrangencia)) {
      where.abrangencia = abrangencia;
    }
    if (uf) where.uf = uf.toUpperCase();
    if (recorrente !== undefined) where.recorrente = recorrente === 'true';

    const feriados = await prisma.calendarioFeriado.findMany({
      where,
      orderBy: [{ data: 'asc' }],
      select: {
        id: true,
        data: true,
        nome: true,
        abrangencia: true,
        uf: true,
        municipio: true,
        ano: true,
        recorrente: true,
        setorAfetado: true,
        descricao: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Estatísticas
    const stats = {
      total: feriados.length,
      nacionais: feriados.filter(f => f.abrangencia === 'NACIONAL').length,
      estaduais: feriados.filter(f => f.abrangencia === 'ESTADUAL').length,
      municipais: feriados.filter(f => f.abrangencia === 'MUNICIPAL').length,
      recorrentes: feriados.filter(f => f.recorrente).length
    };

    res.json({ success: true, feriados, estatisticas: stats });
  } catch (error) {
    console.error('[Feriados] Erro ao listar feriados (admin):', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar feriados', error: error.message });
  }
};

/**
 * GET /api/feriados/admin/ufs
 * Admin: listar UFs que possuem feriados estaduais/municipais
 */
const listarUFs = async (req, res) => {
  try {
    const ufs = await prisma.calendarioFeriado.findMany({
      where: { uf: { not: null } },
      select: { uf: true },
      distinct: ['uf'],
      orderBy: { uf: 'asc' }
    });

    res.json({ success: true, ufs: ufs.map(u => u.uf) });
  } catch (error) {
    console.error('[Feriados] Erro ao listar UFs:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar UFs', error: error.message });
  }
};

/**
 * GET /api/feriados/relevantes
 * Obter feriados relevantes para uma localização específica
 * Query params: uf (obrigatório), municipio (opcional), ano (opcional, default 2026)
 *
 * Lógica:
 * - Sempre inclui feriados NACIONAIS
 * - Se uf informado, inclui feriados ESTADUAIS daquela UF
 * - Se municipio informado, inclui feriados MUNICIPAIS daquele município
 */
const listarFeriadosRelevantes = async (req, res) => {
  try {
    const { uf, municipio, ano } = req.query;

    if (!uf) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro "uf" é obrigatório para buscar feriados relevantes'
      });
    }

    const anoAtual = ano ? parseInt(ano) : new Date().getFullYear();

    const where = {
      ano: anoAtual,
      OR: [
        { abrangencia: 'NACIONAL' },
        { abrangencia: 'ESTADUAL', uf: uf.toUpperCase() }
      ]
    };

    // Se município informado, adicionar feriados municipais
    if (municipio) {
      where.OR.push({
        abrangencia: 'MUNICIPAL',
        municipio: { contains: municipio, mode: 'insensitive' },
        uf: uf.toUpperCase()
      });
    }

    const feriados = await prisma.calendarioFeriado.findMany({
      where,
      orderBy: [{ data: 'asc' }],
      select: {
        id: true,
        data: true,
        nome: true,
        abrangencia: true,
        uf: true,
        municipio: true,
        ano: true,
        recorrente: true,
        setorAfetado: true,
        descricao: true
      }
    });

    res.json({ success: true, feriados, total: feriados.length, localizacao: { uf: uf.toUpperCase(), municipio } });
  } catch (error) {
    console.error('[Feriados] Erro ao listar feriados relevantes:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar feriados relevantes', error: error.message });
  }
};

/**
 * POST /api/feriados/admin
 * Admin: criar novo feriado
 */
const criarFeriado = async (req, res) => {
  try {
    const { data, nome, abrangencia, uf, municipio, ano, recorrente, setorAfetado, descricao } = req.body;

    // Validações
    if (!data || !nome || !abrangencia) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: data, nome, abrangencia'
      });
    }

    if (!['NACIONAL', 'ESTADUAL', 'MUNICIPAL'].includes(abrangencia)) {
      return res.status(400).json({
        success: false,
        message: 'Abrangência deve ser: NACIONAL, ESTADUAL ou MUNICIPAL'
      });
    }

    // Validações por abrangência
    if (abrangencia === 'ESTADUAL' && !uf) {
      return res.status(400).json({
        success: false,
        message: 'Feriados estaduais devem informar a UF'
      });
    }

    if (abrangencia === 'MUNICIPAL' && !municipio) {
      return res.status(400).json({
        success: false,
        message: 'Feriados municipais devem informar o município'
      });
    }

    // Verificar duplicata
    const dataObj = new Date(data);
    const existente = await prisma.calendarioFeriado.findUnique({
      where: { data: dataObj }
    });

    if (existente) {
      return res.status(409).json({
        success: false,
        message: 'Já existe um feriado nesta data',
        feriadoExistente: { nome: existente.nome, data: existente.data }
      });
    }

    const feriado = await prisma.calendarioFeriado.create({
      data: {
        data: dataObj,
        nome,
        abrangencia,
        uf: uf ? uf.toUpperCase() : null,
        municipio: municipio || null,
        ano: ano || dataObj.getFullYear(),
        recorrente: recorrente !== undefined ? recorrente : true,
        setorAfetado: setorAfetado || ['geral'],
        descricao: descricao || null
      }
    });

    res.status(201).json({ success: true, message: 'Feriado criado com sucesso', feriado });
  } catch (error) {
    console.error('[Feriados] Erro ao criar feriado:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar feriado', error: error.message });
  }
};

/**
 * PUT /api/feriados/admin/:id
 * Admin: atualizar feriado
 */
const atualizarFeriado = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, nome, abrangencia, uf, municipio, ano, recorrente, setorAfetado, descricao } = req.body;

    const existente = await prisma.calendarioFeriado.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ success: false, message: 'Feriado não encontrado' });
    }

    const dataObj = data ? new Date(data) : existente.data;

    // Verificar duplicata (se mudou a data)
    if (data && data !== existente.data.toISOString()) {
      const duplicata = await prisma.calendarioFeriado.findUnique({
        where: { data: dataObj }
      });
      if (duplicata && duplicata.id !== id) {
        return res.status(409).json({
          success: false,
          message: 'Já existe outro feriado nesta data'
        });
      }
    }

    const feriado = await prisma.calendarioFeriado.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(abrangencia !== undefined && { abrangencia }),
        ...(uf !== undefined && { uf: uf ? uf.toUpperCase() : null }),
        ...(municipio !== undefined && { municipio }),
        ...(ano !== undefined && { ano }),
        ...(recorrente !== undefined && { recorrente }),
        ...(setorAfetado !== undefined && { setorAfetado }),
        ...(descricao !== undefined && { descricao })
      }
    });

    res.json({ success: true, message: 'Feriado atualizado', feriado });
  } catch (error) {
    console.error('[Feriados] Erro ao atualizar feriado:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar feriado', error: error.message });
  }
};

/**
 * DELETE /api/feriados/admin/:id
 * Admin: deletar feriado permanentemente
 */
const deletarFeriado = async (req, res) => {
  try {
    const { id } = req.params;

    const existente = await prisma.calendarioFeriado.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ success: false, message: 'Feriado não encontrado' });
    }

    await prisma.calendarioFeriado.delete({ where: { id } });

    res.json({ success: true, message: 'Feriado deletado com sucesso' });
  } catch (error) {
    console.error('[Feriados] Erro ao deletar feriado:', error);
    res.status(500).json({ success: false, message: 'Erro ao deletar feriado', error: error.message });
  }
};

/**
 * POST /api/feriados/admin/importar
 * Admin: importar múltiplos feriados de uma vez (JSON)
 * Body: array de feriados
 */
const importarFeriados = async (req, res) => {
  try {
    const feriadosData = req.body;

    if (!Array.isArray(feriadosData) || feriadosData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Envie um array de feriados no body'
      });
    }

    const resultados = { criados: 0, duplicados: 0, erros: 0, detalhes: [] };

    for (const f of feriadosData) {
      try {
        if (!f.data || !f.nome || !f.abrangencia) {
          resultados.erros++;
          resultados.detalhes.push({ feriado: f.nome || 'sem nome', erro: 'Campos obrigatórios faltando' });
          continue;
        }

        const dataObj = new Date(f.data);
        const existente = await prisma.calendarioFeriado.findUnique({ where: { data: dataObj } });

        if (existente) {
          resultados.duplicados++;
          resultados.detalhes.push({ feriado: f.nome, erro: 'Já existe feriado nesta data' });
          continue;
        }

        await prisma.calendarioFeriado.create({
          data: {
            data: dataObj,
            nome: f.nome,
            abrangencia: f.abrangencia,
            uf: f.uf ? f.uf.toUpperCase() : null,
            municipio: f.municipio || null,
            ano: f.ano || dataObj.getFullYear(),
            recorrente: f.recorrente !== undefined ? f.recorrente : true,
            setorAfetado: f.setorAfetado || ['geral'],
            descricao: f.descricao || null
          }
        });

        resultados.criados++;
        resultados.detalhes.push({ feriado: f.nome, status: 'criado' });

      } catch (err) {
        resultados.erros++;
        resultados.detalhes.push({ feriado: f.nome || 'desconhecido', erro: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Importação concluída',
      resultados: {
        criados: resultados.criados,
        duplicados: resultados.duplicados,
        erros: resultados.erros,
        total: feriadosData.length
      },
      detalhes: resultados.detalhes
    });
  } catch (error) {
    console.error('[Feriados] Erro ao importar feriados:', error);
    res.status(500).json({ success: false, message: 'Erro ao importar feriados', error: error.message });
  }
};

module.exports = {
  listarFeriados,
  listarFeriadosAdmin,
  listarUFs,
  listarFeriadosRelevantes,
  criarFeriado,
  atualizarFeriado,
  deletarFeriado,
  importarFeriados
};
