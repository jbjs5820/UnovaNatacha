// Script para carregar variáveis de ambiente do arquivo .env.local
(function() {
  async function loadEnvFile() {
    try {
      const response = await fetch('.env.local');
      
      if (!response.ok) {
        console.warn('Arquivo .env.local não encontrado. Usando valores padrão.');
        return;
      }
      
      const text = await response.text();
      const envVars = {};
      
      // Processar o arquivo .env linha por linha
      text.split('\n').forEach(line => {
        // Ignorar comentários e linhas vazias
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const equalSignPos = trimmedLine.indexOf('=');
          if (equalSignPos > 0) {
            const key = trimmedLine.substring(0, equalSignPos).trim();
            const value = trimmedLine.substring(equalSignPos + 1).trim();
            
            // Remover aspas se presentes
            const cleanValue = value.replace(/^["'](.*)["']$/, '$1');
            
            envVars[key] = cleanValue;
          }
        }
      });
      
      // Armazenar no localStorage para uso pelo EnvConfig
      localStorage.setItem('env_variables', JSON.stringify(envVars));
      
      console.log('Variáveis de ambiente carregadas com sucesso.');
      
      // Recarregar o EnvConfig se já estiver disponível
      if (typeof EnvConfig !== 'undefined') {
        EnvConfig.loadEnv();
      }
    } catch (error) {
      console.error('Erro ao carregar arquivo .env.local:', error);
    }
  }
  
  // Carregar variáveis de ambiente ao inicializar
  loadEnvFile();
})();
