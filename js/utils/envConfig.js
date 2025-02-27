// Utilitário para gerenciar variáveis de ambiente
const EnvConfig = {
  // Valores padrão (serão substituídos se variáveis de ambiente estiverem disponíveis)
  GEMINI_API_KEY: '',
  DEFAULT_MODEL: 'gemini-2.0-pro-exp-02-05',
  DEFAULT_LANGUAGE: 'pt-PT',
  DEFAULT_THEME: 'light',
  
  // Carregar variáveis de ambiente do .env.local se disponível
  loadEnv: function() {
    // Em uma aplicação de produção, você usaria um carregador de env adequado
    // Para esta aplicação baseada em navegador, assumimos que os valores são carregados
    // durante a inicialização da aplicação
    
    // Tentar carregar do localStorage (que seria populado durante a inicialização)
    const envVars = localStorage.getItem('env_variables');
    if (envVars) {
      try {
        const parsedVars = JSON.parse(envVars);
        this.GEMINI_API_KEY = parsedVars.GEMINI_API_KEY || this.GEMINI_API_KEY;
        this.DEFAULT_MODEL = parsedVars.DEFAULT_MODEL || this.DEFAULT_MODEL;
        this.DEFAULT_LANGUAGE = parsedVars.DEFAULT_LANGUAGE || this.DEFAULT_LANGUAGE;
        this.DEFAULT_THEME = parsedVars.DEFAULT_THEME || this.DEFAULT_THEME;
      } catch (e) {
        console.error('Erro ao analisar variáveis de ambiente:', e);
      }
    }
    
    return this;
  },
  
  // Método para inicializar variáveis de ambiente a partir de um arquivo .env.local
  initFromEnvFile: async function() {
    try {
      const response = await fetch('/.env.local');
      if (response.ok) {
        const text = await response.text();
        const envVars = {};
        
        // Analisar o arquivo .env linha por linha
        text.split('\n').forEach(line => {
          // Ignorar comentários e linhas vazias
          if (line.trim() && !line.startsWith('#')) {
            const [key, value] = line.split('=').map(part => part.trim());
            if (key && value) {
              envVars[key] = value;
            }
          }
        });
        
        // Armazenar no localStorage para uso futuro
        localStorage.setItem('env_variables', JSON.stringify(envVars));
        
        // Atualizar as propriedades
        this.GEMINI_API_KEY = envVars.GEMINI_API_KEY || this.GEMINI_API_KEY;
        this.DEFAULT_MODEL = envVars.DEFAULT_MODEL || this.DEFAULT_MODEL;
        this.DEFAULT_LANGUAGE = envVars.DEFAULT_LANGUAGE || this.DEFAULT_LANGUAGE;
        this.DEFAULT_THEME = envVars.DEFAULT_THEME || this.DEFAULT_THEME;
      }
    } catch (e) {
      console.warn('Não foi possível carregar o arquivo .env.local:', e);
      console.info('Usando valores padrão ou do localStorage');
    }
    
    return this;
  }
};

// Inicializar ao carregar
EnvConfig.loadEnv();
