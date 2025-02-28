// Componente para configurações do aplicativo
function SettingsView() {
  const [apiKey, setApiKey] = React.useState(localStorage.getItem('geminiApiKey') || EnvConfig.GEMINI_API_KEY);
  const [language, setLanguage] = React.useState(localStorage.getItem('appLanguage') || EnvConfig.DEFAULT_LANGUAGE);
  const [theme, setTheme] = React.useState(localStorage.getItem('appTheme') || EnvConfig.DEFAULT_THEME);
  const [model, setModel] = React.useState(ModelUtils.getModelFromStorage());
  const [saveStatus, setSaveStatus] = React.useState('');

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

  const resetSettings = () => {
    if (confirm('Tem a certeza que pretende repor as configurações padrão?')) {
      setApiKey(EnvConfig.GEMINI_API_KEY);
      setLanguage(EnvConfig.DEFAULT_LANGUAGE);
      setTheme(EnvConfig.DEFAULT_THEME);
      setModel(ModelUtils.normalizeModelName(EnvConfig.DEFAULT_MODEL));
      
      localStorage.removeItem('geminiApiKey');
      localStorage.removeItem('appLanguage');
      localStorage.removeItem('appTheme');
      localStorage.removeItem('geminiModel');
      
      setSaveStatus('Configurações repostas para valores padrão.');
      setTimeout(() => setSaveStatus(''), 3000);
      
      document.documentElement.classList.remove('dark');
    }
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
