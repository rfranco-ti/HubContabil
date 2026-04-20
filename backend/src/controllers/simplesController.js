/**
 * Controller para consulta de Simples Nacional via Cnpja API
 * Usa fetch direto pois o SDK não expõe o endpoint /simples
 *
 * Docs: https://docs.cnpja.com/#simples
 */

const CNPJA_API = "https://api.cnpja.com";

async function consultaSimples(req, res) {
  try {
    const cnpj = req.params.cnpj.replace(/\D/g, "");
    if (cnpj.length !== 14) {
      return res.status(400).json({ message: "CNPJ deve ter 14 dígitos" });
    }

    const apiKey = process.env.CNPJA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "CNPJA_API_KEY não configurada" });
    }

    // Estratégia: CACHE_IF_ERROR (usa cache se online falhar, economiza créditos)
    const url = `${CNPJA_API}/simples?taxId=${cnpj}&history=true&strategy=CACHE_IF_ERROR&maxAge=45`;

    const response = await fetch(url, {
      headers: {
        Authorization: apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 401)
        return res.status(401).json({ message: "API key inválida" });
      if (response.status === 404)
        return res.status(404).json({ message: "CNPJ não encontrado" });
      if (response.status === 429)
        return res.status(429).json({
          message: error.message || "Créditos insuficientes ou limite excedido",
        });
      if (response.status === 503)
        return res.status(503).json({
          message: "Serviço do Simples Nacional temporariamente indisponível",
        });
      return res
        .status(response.status)
        .json({ message: error.message || "Erro ao consultar Simples" });
    }

    const data = await response.json();

    res.json({
      success: true,
      data: {
        taxId: data.taxId,
        updated: data.updated,
        simples: data.simples || null,
        simei: data.simei || null,
      },
    });
  } catch (error) {
    console.error("Erro consulta Simples:", error.message);
    res.status(500).json({
      message: error.message || "Erro interno ao consultar Simples Nacional",
    });
  }
}

async function baixaComprovante(req, res) {
  try {
    const cnpj = req.params.cnpj.replace(/\D/g, "");
    if (cnpj.length !== 14) {
      return res.status(400).json({ message: "CNPJ deve ter 14 dígitos" });
    }

    const apiKey = process.env.CNPJA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "CNPJA_API_KEY não configurada" });
    }

    const url = `${CNPJA_API}/simples/certificate?taxId=${cnpj}`;

    const response = await fetch(url, {
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 401)
        return res.status(401).json({ message: "API key inválida" });
      if (response.status === 404)
        return res
          .status(404)
          .json({ message: "CNPJ não encontrado para emissão" });
      if (response.status === 429)
        return res
          .status(429)
          .json({ message: error.message || "Créditos insuficientes" });
      return res
        .status(response.status)
        .json({ message: error.message || "Erro ao gerar comprovante" });
    }

    // Retorna PDF
    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="comprovante-simples-${cnpj}.pdf"`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Erro comprovante Simples:", error.message);
    res
      .status(500)
      .json({ message: error.message || "Erro interno ao gerar comprovante" });
  }
}

module.exports = { consultaSimples, baixaComprovante };
