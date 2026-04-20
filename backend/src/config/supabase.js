const { createClient } = require('@supabase/supabase-js');

// Inicializar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;
let storage = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Funções utilitárias de Storage
  storage = {
    /**
     * Upload de arquivo para bucket do Supabase
     */
    upload: async (bucket, path, fileBuffer, options = {}) => {
      try {
        const { data, error } = await supabase
          .storage
          .from(bucket)
          .upload(path, fileBuffer, {
            cacheControl: '3600',
            upsert: false,
            contentType: options.contentType || 'application/octet-stream',
            ...options
          });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error(`Storage upload error (${bucket}/${path}):`, error);
        throw error;
      }
    },

    /**
     * Download de arquivo do bucket
     */
    download: async (bucket, path) => {
      try {
        const { data, error } = await supabase
          .storage
          .from(bucket)
          .download(path);

        if (error) throw error;
        return data;
      } catch (error) {
        console.error(`Storage download error (${bucket}/${path}):`, error);
        throw error;
      }
    },

    /**
     * Obter URL pública de um arquivo
     */
    getPublicUrl: (bucket, path) => {
      const { data } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(path);

      return data.publicUrl;
    },

    /**
     * Deletar arquivo do bucket
     */
    delete: async (bucket, paths) => {
      try {
        const { data, error } = await supabase
          .storage
          .from(bucket)
          .remove(paths);

        if (error) throw error;
        return data;
      } catch (error) {
        console.error(`Storage delete error (${bucket}):`, error);
        throw error;
      }
    },

    /**
     * Listar arquivos de uma pasta
     */
    list: async (bucket, folderPath, options = {}) => {
      try {
        const { data, error } = await supabase
          .storage
          .from(bucket)
          .list(folderPath, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
            ...options
          });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error(`Storage list error (${bucket}/${folderPath}):`, error);
        throw error;
      }
    }
  };
} else {
  console.warn('⚠️  Supabase: Variáveis de ambiente não configuradas. Storage indisponível.');
}

module.exports = {
  supabase,
  storage
};
