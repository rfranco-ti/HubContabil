import { FileSignature } from 'lucide-react';
import { DocumentGenerator } from '../components/DocumentGenerator';
import PageHeader from '../components/PageHeader';

/**
 * Página de Gerador de Documentos
 *
 * Interface para geração de documentos contábeis padronizados
 */
function GeradorDocumentos() {
  return (
    <div className="p-4 md:p-6 h-full flex flex-col overflow-y-auto">
      <PageHeader
        icon={<FileSignature size={24} />}
        title="Gerador de Documentos"
        subtitle="Crie e imprima documentos contábeis padronizados"
      />

      <div className="flex-1 min-h-0">
        <DocumentGenerator />
      </div>
    </div>
  );
}

export default GeradorDocumentos;
