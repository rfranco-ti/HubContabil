import { useState } from 'react';
import { Upload, FileText, ScanLine, FilePlus2, Loader2, CheckCircle2, Download, FolderOpen } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';

export default function Documentos() {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [contratoResult, setContratoResult] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingOcr, setLoadingOcr] = useState(false);
  const [loadingContrato, setLoadingContrato] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoadingUpload(true);
    const formData = new FormData();
    formData.append('documento', file);
    try {
      const res = await fetch('/api/ged/upload', { method: 'POST', body: formData });
      const data = await res.json();
      setUploadResult(data);
    } catch { setUploadResult({ message: 'Erro de conexão.' }); }
    setLoadingUpload(false);
  };

  const handleOcr = async () => {
    if (!uploadResult?.filename) return;
    setLoadingOcr(true);
    try {
      const res = await fetch('/api/ged/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: uploadResult.filename })
      });
      const data = await res.json();
      setOcrResult(data);
    } catch { setOcrResult({ message: 'Erro de conexão.' }); }
    setLoadingOcr(false);
  };

  const handleGerarContrato = async () => {
    setLoadingContrato(true);
    try {
      const res = await fetch('/api/ged/gerar-contrato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razao_social: 'Empresa Exemplo LTDA',
          cnpj: '12.345.678/0001-99',
          endereco: 'Rua das Flores, 123 - Centro, Salvador/BA',
          valor_honorario: '1.500,00',
          dia_vencimento: '10'
        })
      });
      const data = await res.json();
      setContratoResult(data);
    } catch { setContratoResult({ message: 'Erro de conexão.' }); }
    setLoadingContrato(false);
  };

  const downloadPdf = () => {
    if (!contratoResult?.pdfBase64) return;
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${contratoResult.pdfBase64}`;
    link.download = contratoResult.filename || 'contrato.pdf';
    link.click();
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col bg-base-200 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FolderOpen size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-base-content">Gestão Eletrônica de Documentos</h1>
          <p className="text-sm text-base-content/60">Armazene, escaneie e gere documentos contábeis automaticamente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Card 1: Upload */}
        <Card>
          <div className="flex items-center mb-6">
            <div className="bg-primary/10 text-primary p-4 rounded-2xl mr-4"><Upload size={24} /></div>
            <div>
              <h2 className="text-xl font-bold text-base-content">Upload de Documento</h2>
              <p className="text-sm text-base-content/60 mt-0.5">Escolha um PDF ou imagem para arquivar.</p>
            </div>
          </div>

          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files[0])}
            className="file-input file-input-bordered w-full mb-4"
          />

          <Button 
            onClick={handleUpload} 
            disabled={loadingUpload || !file}
            loading={loadingUpload}
            className="w-full"
          >
            <Upload size={18} className="mr-2" />
            {loadingUpload ? 'Enviando...' : 'Enviar ao Cofre'}
          </Button>

          {uploadResult && (
            <div className="mt-4">
              <Badge variant="success" className="w-full justify-start">
                <CheckCircle2 size={16} className="mr-1" /> 
                {uploadResult.message}
              </Badge>
            </div>
          )}
        </Card>

        {/* Card 2: OCR */}
        <Card>
          <div className="flex items-center mb-6">
            <div className="bg-primary/10 text-primary p-4 rounded-2xl mr-4"><ScanLine size={24} /></div>
            <div>
              <h2 className="text-xl font-bold text-base-content">Leitura OCR</h2>
              <p className="text-sm text-base-content/60 mt-0.5">Extrair texto de um documento já enviado.</p>
            </div>
          </div>

          <p className="text-xs text-base-content/60 mb-4 font-medium">
            {uploadResult?.filename ? `Arquivo pronto: ${uploadResult.filename}` : 'Faça o upload primeiro →'}
          </p>

          <Button 
            onClick={handleOcr} 
            disabled={loadingOcr || !uploadResult?.filename}
            loading={loadingOcr}
            className="w-full"
          >
            <ScanLine size={18} className="mr-2" />
            {loadingOcr ? 'Escaneando (pode levar 30s)...' : 'Executar OCR'}
          </Button>

          {ocrResult && (
            <div className="mt-4 p-4 bg-base-200 rounded-xl border border-base-300 max-h-48 overflow-y-auto">
              <p className="text-xs font-bold text-base-content/60 uppercase mb-2">Texto Extraído:</p>
              <pre className="text-xs text-base-content whitespace-pre-wrap font-mono">{ocrResult.transcricao || ocrResult.message}</pre>
            </div>
          )}
        </Card>

        {/* Card 3: Gerar Contrato */}
        <Card>
          <div className="flex items-center mb-6">
            <div className="bg-primary/10 text-primary p-4 rounded-2xl mr-4"><FilePlus2 size={24} /></div>
            <div>
              <h2 className="text-xl font-bold text-base-content">Gerar Contrato</h2>
              <p className="text-sm text-base-content/60 mt-0.5">Contrato de prestação de serviços em PDF.</p>
            </div>
          </div>

          <p className="text-xs text-base-content/60 mb-4 font-medium">Preenche automaticamente um template com os dados do cliente selecionado.</p>

          <Button 
            onClick={handleGerarContrato} 
            disabled={loadingContrato}
            loading={loadingContrato}
            className="w-full"
          >
            <FileText size={18} className="mr-2" />
            {loadingContrato ? 'Gerando PDF...' : 'Gerar Contrato Exemplo'}
          </Button>

          {contratoResult && (
            <div className="mt-4">
              <Badge variant="success" className="w-full justify-start mb-3">
                <CheckCircle2 size={16} className="mr-1" /> 
                {contratoResult.message}
              </Badge>
              <Button variant="success" onClick={downloadPdf} className="w-full">
                <Download size={16} className="mr-2" />
                Baixar Contrato PDF
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
