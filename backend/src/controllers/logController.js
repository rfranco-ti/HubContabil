const fs = require('fs');
const path = require('path');
const { logger } = require('../middlewares/logger');

const logsDir = path.join(__dirname, '..', '..', 'logs');

/**
 * GET /api/logs
 * Listar logs do sistema com filtros
 */
const getLogs = async (req, res) => {
  try {
    console.log('=== GET /api/logs ===');
    
    const { level, limit = 100, search, startDate, endDate } = req.query;
    
    // Verificar se diretório de logs existe
    if (!fs.existsSync(logsDir)) {
      return res.json({ success: true, data: [], total: 0 });
    }

    // Ler arquivo de logs combinados
    const combinedLogPath = path.join(logsDir, 'combined.log');
    if (!fs.existsSync(combinedLogPath)) {
      return res.json({ success: true, data: [], total: 0 });
    }

    // Ler arquivo de logs
    const logContent = fs.readFileSync(combinedLogPath, 'utf-8');
    const logLines = logContent.trim().split('\n').filter(line => line.trim());

    // Parse de logs JSON
    const logs = [];
    for (const line of logLines) {
      try {
        const parsed = JSON.parse(line);
        logs.push(parsed);
      } catch (e) {
        // Ignorar linhas mal formatados
      }
    }

    // Aplicar filtros
    let filteredLogs = logs;

    // Filtrar por nível
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    // Filtrar por busca
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        (log.message && log.message.toLowerCase().includes(searchLower)) ||
        (log.url && log.url.toLowerCase().includes(searchLower)) ||
        (log.method && log.method.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por data
    if (startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= startDate);
    }
    if (endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= endDate);
    }

    // Limitar e ordenar (mais recentes primeiro)
    filteredLogs = filteredLogs.reverse().slice(0, parseInt(limit));

    console.log(`✅ ${filteredLogs.length} logs retornados`);
    res.json({ 
      success: true, 
      data: filteredLogs,
      total: filteredLogs.length
    });
  } catch (error) {
    console.error('❌ Erro ao ler logs:', error);
    res.status(500).json({ success: false, message: 'Erro ao ler logs', error: error.message });
  }
};

/**
 * GET /api/logs/stats
 * Obter estatísticas dos logs
 */
const getLogStats = async (req, res) => {
  try {
    console.log('=== GET /api/logs/stats ===');

    if (!fs.existsSync(logsDir)) {
      return res.json({ success: true, data: { total: 0, errors: 0, warnings: 0 } });
    }

    const combinedLogPath = path.join(logsDir, 'combined.log');
    const errorLogPath = path.join(logsDir, 'error.log');

    const combinedContent = fs.existsSync(combinedLogPath) 
      ? fs.readFileSync(combinedLogPath, 'utf-8') 
      : '';
    const errorContent = fs.existsSync(errorLogPath) 
      ? fs.readFileSync(errorLogPath, 'utf-8') 
      : '';

    const combinedLines = combinedContent.trim().split('\n').filter(line => line.trim());
    const errorLines = errorContent.trim().split('\n').filter(line => line.trim());

    // Contar por nível
    let infoCount = 0, warnCount = 0, errorCount = 0;
    combinedLines.forEach(line => {
      try {
        const log = JSON.parse(line);
        if (log.level === 'info') infoCount++;
        else if (log.level === 'warn') warnCount++;
        else if (log.level === 'error') errorCount++;
      } catch (e) {}
    });

    // Tamanho dos arquivos
    const combinedSize = fs.existsSync(combinedLogPath) 
      ? fs.statSync(combinedLogPath).size 
      : 0;
    const errorSize = fs.existsSync(errorLogPath) 
      ? fs.statSync(errorLogPath).size 
      : 0;

    const stats = {
      total: combinedLines.length,
      errors: errorLines.length,
      info: infoCount,
      warnings: warnCount,
      errorCount,
      fileSize: {
        combined: `${(combinedSize / 1024 / 1024).toFixed(2)} MB`,
        error: `${(errorSize / 1024 / 1024).toFixed(2)} MB`
      },
      lastUpdate: fs.existsSync(combinedLogPath)
        ? fs.statSync(combinedLogPath).mtime
        : null
    };

    console.log('✅ Estatísticas de logs calculadas');
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('❌ Erro ao calcular estatísticas:', error);
    res.status(500).json({ success: false, message: 'Erro ao calcular estatísticas', error: error.message });
  }
};

/**
 * GET /api/logs/download
 * Download de logs em TXT ou CSV
 */
const downloadLogs = async (req, res) => {
  try {
    console.log('=== GET /api/logs/download ===');
    
    const { format = 'txt', level } = req.query;
    
    if (!fs.existsSync(logsDir)) {
      return res.status(404).json({ success: false, message: 'Logs não encontrados' });
    }

    const combinedLogPath = path.join(logsDir, 'combined.log');
    if (!fs.existsSync(combinedLogPath)) {
      return res.status(404).json({ success: false, message: 'Arquivo de logs não existe' });
    }

    const logContent = fs.readFileSync(combinedLogPath, 'utf-8');
    const logLines = logContent.trim().split('\n').filter(line => line.trim());

    // Parse logs
    const logs = [];
    for (const line of logLines) {
      try {
        logs.push(JSON.parse(line));
      } catch (e) {}
    }

    // Filtrar por nível se necessário
    let filteredLogs = level ? logs.filter(log => log.level === level) : logs;

    // Gerar arquivo
    if (format === 'csv') {
      // Formato CSV
      const headers = 'timestamp,level,message,method,url,statusCode,duration,ip,userId\n';
      const rows = filteredLogs.map(log => {
        return [
          log.timestamp || '',
          log.level || '',
          `"${(log.message || '').replace(/"/g, '""')}"`,
          log.method || '',
          log.url || '',
          log.statusCode || '',
          log.duration || '',
          log.ip || '',
          log.userId || ''
        ].join(',');
      }).join('\n');

      const csvContent = headers + rows;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="logs_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\ufeff' + csvContent); // BOM para Excel
    } else {
      // Formato TXT (JSON linha a linha)
      const txtContent = filteredLogs.map(log => JSON.stringify(log, null, 2)).join('\n\n');
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="logs_${new Date().toISOString().split('T')[0]}.txt"`);
      res.send(txtContent);
    }

    console.log(`✅ Logs exportados em formato ${format}`);
  } catch (error) {
    console.error('❌ Erro ao exportar logs:', error);
    res.status(500).json({ success: false, message: 'Erro ao exportar logs', error: error.message });
  }
};

/**
 * DELETE /api/logs
 * Limpar logs antigos (apenas admin)
 */
const clearLogs = async (req, res) => {
  try {
    console.log('=== DELETE /api/logs ===');
    
    const { days = 7 } = req.query; // Limpar logs com mais de X dias

    if (!fs.existsSync(logsDir)) {
      return res.json({ success: true, message: 'Nenhum log para limpar' });
    }

    const files = ['combined.log', 'error.log'];
    let cleanedCount = 0;

    for (const file of files) {
      const filePath = path.join(logsDir, file);
      if (fs.existsSync(filePath)) {
        // Ler e filtrir logs recentes
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.trim().split('\n').filter(line => line.trim());
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

        const recentLogs = lines.filter(line => {
          try {
            const log = JSON.parse(line);
            return new Date(log.timestamp) >= cutoffDate;
          } catch (e) {
            return false;
          }
        });

        // Reescrever arquivo apenas com logs recentes
        fs.writeFileSync(filePath, recentLogs.join('\n'));
        cleanedCount += (lines.length - recentLogs.length);
      }
    }

    console.log(`✅ ${cleanedCount} logs antigos removidos`);
    res.json({ 
      success: true, 
      message: `${cleanedCount} logs antigos removidos`,
      removed: cleanedCount
    });
  } catch (error) {
    console.error('❌ Erro ao limpar logs:', error);
    res.status(500).json({ success: false, message: 'Erro ao limpar logs', error: error.message });
  }
};

module.exports = { getLogs, getLogStats, downloadLogs, clearLogs };
