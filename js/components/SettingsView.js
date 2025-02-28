// Componente para configurações do aplicativo
function SettingsView() {
  const [apiKey, setApiKey] = React.useState(localStorage.getItem('geminiApiKey') || EnvConfig.GEMINI_API_KEY);
  const [language, setLanguage] = React.useState(localStorage.getItem('appLanguage') || EnvConfig.DEFAULT_LANGUAGE);
  const [theme, setTheme] = React.useState(localStorage.getItem('appTheme') || EnvConfig.DEFAULT_THEME);
  const [model, setModel] = React.useState(ModelUtils.getModelFromStorage());
  const [supabaseUrl, setSupabaseUrl] = React.useState(localStorage.getItem('supabaseUrl') || EnvConfig.SUPABASE_URL);
  const [supabaseKey, setSupabaseKey] = React.useState(localStorage.getItem('supabaseKey') || EnvConfig.SUPABASE_ANON_KEY);
  const [saveStatus, setSaveStatus] = React.useState('');
  const [supabaseStatus, setSupabaseStatus] = React.useState('');
  const [isUsingEnvVars, setIsUsingEnvVars] = React.useState(false);
  const [showBackoffice, setShowBackoffice] = React.useState(false);

  // Verificar se estamos usando variáveis de ambiente para Supabase
  React.useEffect(() => {
    const isUsingEnv = EnvConfig.SUPABASE_URL && EnvConfig.SUPABASE_ANON_KEY;
    setIsUsingEnvVars(isUsingEnv);
    
    // Se estamos usando variáveis de ambiente, atualizar os campos
    if (isUsingEnv) {
      setSupabaseUrl(EnvConfig.SUPABASE_URL);
      setSupabaseKey(EnvConfig.SUPABASE_ANON_KEY);
    }
  }, []);

  const saveSettings = () => {
    // Normalizar e salvar o modelo
    const normalizedModel = ModelUtils.saveModelToStorage(model);
    if (normalizedModel !== model) {
      setModel(normalizedModel);
    }
    
    localStorage.setItem('geminiApiKey', apiKey);
    localStorage.setItem('appLanguage', language);
    localStorage.setItem('appTheme', theme);
    
    setSaveStatus('Configurações guardadas com sucesso!');
    setTimeout(() => setSaveStatus(''), 3000);
    
    // Aplicar tema
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const saveSupabaseSettings = () => {
    if (!supabaseUrl || !supabaseKey) {
      setSupabaseStatus('URL e chave Supabase são obrigatórios');
      setTimeout(() => setSupabaseStatus(''), 3000);
      return;
    }
    
    const success = SupabaseClient.init(supabaseUrl, supabaseKey);
    if (success) {
      setSupabaseStatus('Configurações Supabase guardadas com sucesso!');
    } else {
      setSupabaseStatus('Erro ao inicializar cliente Supabase. Verifique os dados.');
    }
    setTimeout(() => setSupabaseStatus(''), 3000);
  };

  const resetSettings = () => {
    if (confirm('Tem a certeza que pretende repor as configurações padrão?')) {
      setApiKey(EnvConfig.GEMINI_API_KEY);
      setLanguage(EnvConfig.DEFAULT_LANGUAGE);
      setTheme(EnvConfig.DEFAULT_THEME);
      setModel(ModelUtils.normalizeModelName(EnvConfig.DEFAULT_MODEL));
      setSupabaseUrl('');
      setSupabaseKey('');
      
      localStorage.removeItem('geminiApiKey');
      localStorage.removeItem('appLanguage');
      localStorage.removeItem('appTheme');
      localStorage.removeItem('geminiModel');
      localStorage.removeItem('supabaseUrl');
      localStorage.removeItem('supabaseKey');
      
      // Reset Supabase client
      SupabaseClient.reset();
      
      setSaveStatus('Configurações repostas para valores padrão.');
      setTimeout(() => setSaveStatus(''), 3000);
      
      document.documentElement.classList.remove('dark');
    }
  };

  const resetSupabaseSettings = () => {
    if (confirm('Tem a certeza que pretende remover as configurações do Supabase?')) {
      SupabaseClient.reset();
      setSupabaseUrl('');
      setSupabaseKey('');
      setSupabaseStatus('Configurações Supabase removidas');
      setTimeout(() => setSupabaseStatus(''), 3000);
    }
  };
  
  const testSupabaseConnection = async () => {
    setSupabaseStatus('Testando conexão...');
    
    if (!SupabaseClient.isInitialized()) {
      if (supabaseUrl && supabaseKey) {
        const success = SupabaseClient.init(supabaseUrl, supabaseKey);
        if (!success) {
          setSupabaseStatus('Erro ao inicializar cliente Supabase. Verifique os dados.');
          setTimeout(() => setSupabaseStatus(''), 3000);
          return;
        }
      } else {
        setSupabaseStatus('URL e chave Supabase são obrigatórios');
        setTimeout(() => setSupabaseStatus(''), 3000);
        return;
      }
    }
    
    try {
      // Testar a conexão com o Supabase
      const { data, error } = await SupabaseClient.getClient().from('ai_interactions').select('count', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === '42P01') {
          // Tabela não existe, vamos tentar criar
          setSupabaseStatus('Tabela ai_interactions não existe. Tentando criar...');
          
          try {
            // Usar o utilitário de configuração para criar a tabela
            const setupResult = await SupabaseSetup.initialize(SupabaseClient.getClient());
            
            if (setupResult.error) {
              setSupabaseStatus(`Erro ao criar tabela: ${setupResult.error.message || JSON.stringify(setupResult.error)}. Pode ser necessário criar manualmente.`);
            } else {
              setSupabaseStatus('Tabela ai_interactions criada com sucesso! Conexão estabelecida.');
            }
          } catch (createErr) {
            setSupabaseStatus(`Não foi possível criar a tabela: ${createErr.message}. Pode ser necessário criar manualmente.`);
          }
        } else {
          setSupabaseStatus(`Erro na conexão: ${error.message}`);
        }
      } else {
        setSupabaseStatus('Conexão com Supabase estabelecida com sucesso!');
      }
    } catch (error) {
      setSupabaseStatus(`Erro ao testar conexão: ${error.message}`);
    }
    
    setTimeout(() => setSupabaseStatus(''), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Configurações</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Configurações da API</h3>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apiKey">
              Chave API Gemini
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="apiKey"
              type="password"
              placeholder="Introduza a sua chave API Gemini"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Obtenha uma chave API em <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-blue-600 hover:underline">Google AI Studio</a>
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="model">
              Modelo Gemini
            </label>
            <select
              id="model"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <optgroup label="Modelos Estáveis">
                {ModelUtils.modelCategories.stable.map(modelInfo => (
                  <option key={modelInfo.id} value={modelInfo.id}>
                    {modelInfo.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Modelos Experimentais">
                {ModelUtils.modelCategories.experimental.map(modelInfo => (
                  <option key={modelInfo.id} value={modelInfo.id}>
                    {modelInfo.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Selecione o modelo Gemini a utilizar para as funcionalidades de IA
            </p>
            {ModelUtils.isExperimentalModel(model) && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 mt-2 text-xs" role="alert">
                <p className="font-bold">Atenção: Modelo Experimental</p>
                <p>Este é um modelo experimental e pode não estar disponível no futuro ou apresentar comportamentos inesperados.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Preferências de Interface</h3>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="language">
              Idioma
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="pt-PT">Português (Portugal)</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="theme">
              Tema
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Configurações Supabase (Base de Dados)</h3>
          {isUsingEnvVars && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 mt-2 text-xs" role="alert">
              <p className="font-bold">Atenção: Estamos usando variáveis de ambiente para Supabase</p>
              <p>As configurações de Supabase estão sendo carregadas das variáveis de ambiente.</p>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supabaseUrl">
              URL Supabase
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="supabaseUrl"
              type="text"
              placeholder="https://seu-projeto.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supabaseKey">
              Chave API Supabase (anon public)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="supabaseKey"
              type="password"
              placeholder="Introduza a sua chave API Supabase"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Utilize a chave anon/public do seu projeto Supabase
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={saveSupabaseSettings}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
            >
              Guardar Configurações Supabase
            </button>
            <button
              onClick={testSupabaseConnection}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ml-2"
            >
              Testar Conexão Supabase
            </button>
            <button
              onClick={resetSupabaseSettings}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ml-2"
            >
              Remover Configurações Supabase
            </button>
            <button
              onClick={async () => {
                if (!SupabaseClient.isInitialized()) {
                  setSupabaseStatus('Cliente Supabase não inicializado');
                  setTimeout(() => setSupabaseStatus(''), 3000);
                  return;
                }
                
                const confirmMessage = 
                  "Esta ação tentará criar a tabela 'ai_interactions' diretamente no Supabase.\n\n" +
                  "Isso pode falhar se você não tiver permissões suficientes.\n\n" +
                  "Deseja continuar?";
                
                if (confirm(confirmMessage)) {
                  setSupabaseStatus('Criando tabela manualmente...');
                  
                  try {
                    // Tentar criar a tabela diretamente
                    const result = await SupabaseSetup.createAIInteractionsTable(SupabaseClient.getClient());
                    
                    if (result.success) {
                      setSupabaseStatus(`Sucesso: ${result.message}`);
                    } else {
                      setSupabaseStatus(`Falha: ${result.error?.message || result.message || 'Erro desconhecido'}`);
                    }
                  } catch (error) {
                    setSupabaseStatus(`Erro: ${error.message}`);
                  }
                  
                  setTimeout(() => setSupabaseStatus(''), 5000);
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 ml-2"
            >
              Criar Tabela Manualmente
            </button>
          </div>
          {supabaseStatus && (
            <p className={`mt-2 text-sm ${supabaseStatus.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>
              {supabaseStatus}
            </p>
          )}
        </div>
        
        {/* Backoffice Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Ferramentas de Administração</h2>
          <button
            onClick={() => setShowBackoffice(!showBackoffice)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
          >
            {showBackoffice ? 'Ocultar Ferramentas' : 'Mostrar Ferramentas de Administração'}
          </button>
          
          {showBackoffice && <BackofficeView />}
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
            type="button"
            onClick={saveSettings}
          >
            Guardar Configurações
          </button>
          
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
            type="button"
            onClick={resetSettings}
          >
            Repor Padrões
          </button>
        </div>
        
        {saveStatus && (
          <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">
            {saveStatus}
          </div>
        )}
      </div>
    </div>
  );
}

window.SettingsView = SettingsView;
