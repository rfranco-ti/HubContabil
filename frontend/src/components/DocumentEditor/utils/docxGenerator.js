/**
 * Utilitário de exportação DOCX
 * 
 * NOTA: A geração real de DOCX será feita no backend
 * pois docx-templates requer módulos Node.js (stream, vm)
 * que não estão disponíveis no browser.
 */

// Prepara os dados para envio ao backend
export const prepareDOCXData = (templateData, clientData) => {
  return {
    template: templateData,
    data: clientData,
    timestamp: new Date().toISOString(),
  };
};

// Envia para o backend gerar o DOCX
export const generateDOCX = async (templateData, clientData) => {
  try {
    const response = await fetch('/api/templates/export-docx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        template: templateData,
        data: clientData,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar DOCX no backend');
    }

    // Receber blob do backend
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('❌ Erro ao gerar DOCX:', error);
    throw error;
  }
};

export default generateDOCX;
