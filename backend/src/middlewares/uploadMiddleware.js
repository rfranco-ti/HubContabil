const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Verifica e garante que o diretório "uploads" exista na raiz do backend
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuração do motor de manuseio de arquivos (Disco)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Local de salvamento (Vault de Documentos)
  },
  filename: function (req, file, cb) {
    // Garante nomes de arquivos únicos para não sobrescrever documentos de clientes diferentes
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Tipos de arquivo permitidos
const allowedMimeTypes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Validação de tipo de arquivo
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}. Permitidos: PDF, PNG, JPG, DOC, DOCX`), false);
  }
};

// Configuração do multer com validações
const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10 Megabytes
  },
  fileFilter
});

// Middleware de erro para tamanho de arquivo
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'Arquivo muito grande. Tamanho máximo permitido: 10MB' 
      });
    }
    return res.status(400).json({ message: `Erro no upload: ${err.message}` });
  }
  
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  
  next();
};

module.exports = upload;
module.exports.handleUploadError = handleUploadError;
