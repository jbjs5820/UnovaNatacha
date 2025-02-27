// Componente para geração de conteúdo com IA
function ContentGenerationTab() {
  const [prompt, setPrompt] = React.useState('');
  const [generatedContent, setGeneratedContent] = React.useState('');
  const [contentType, setContentType] = React.useState('resumo');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [language, setLanguage] = React.useState('pt');
  
  // Exemplos de prompts para diferentes tipos de conteúdo
  const promptExamples = {
    resumo: 'Crie um resumo sobre [tema] focado em [aspecto específico].',
    revisao: 'Faça uma revisão da literatura sobre [tema] destacando as principais descobertas dos últimos 5 anos.',
    metodologia: 'Descreva uma metodologia para investigar [problema de pesquisa] utilizando [abordagem].',
    conclusao: 'Elabore uma conclusão para um artigo sobre [tema] que discutiu [principais pontos].'
  };
  
  // Função para gerar conteúdo usando IA
  const generateContent = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Obter a chave API e modelo do localStorage ou do EnvConfig
      const apiKey = localStorage.getItem('geminiApiKey') || EnvConfig.GEMINI_API_KEY;
      const model = localStorage.getItem('geminiModel') || EnvConfig.DEFAULT_MODEL;
      
      // Usar o utilitário GeminiAPI para gerar conteúdo
      const content = await GeminiAPI.generateAcademicContent(
        apiKey,
        prompt,
        contentType,
        language,
        { model }
      );
      
      setGeneratedContent(content);
    } catch (err) {
      console.error('Erro na geração de conteúdo:', err);
      setError(err.message || 'Ocorreu um erro ao gerar conteúdo');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para copiar o conteúdo gerado para a área de transferência
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent)
      .then(() => {
        alert('Conteúdo copiado para a área de transferência!');
      })
      .catch(err => {
        console.error('Erro ao copiar:', err);
        alert('Não foi possível copiar o conteúdo. Por favor, copie manualmente.');
      });
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Descreva o que pretende gerar
          </label>
          <textarea
            id="prompt"
            rows="4"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={promptExamples[contentType]}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          ></textarea>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opções
          </label>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700">Tipo de Conteúdo</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="resumo">Resumo</option>
                <option value="revisao">Revisão de Literatura</option>
                <option value="metodologia">Metodologia</option>
                <option value="conclusao">Conclusão</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700">Idioma</label>
              <div className="mt-1 flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="language"
                    value="pt"
                    checked={language === 'pt'}
                    onChange={() => setLanguage('pt')}
                  />
                  <span className="ml-2">Português</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="language"
                    value="en"
                    checked={language === 'en'}
                    onChange={() => setLanguage('en')}
                  />
                  <span className="ml-2">Inglês</span>
                </label>
              </div>
            </div>
            
            <button
              onClick={generateContent}
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 disabled:opacity-50"
            >
              {isLoading ? 'A gerar...' : 'Gerar Conteúdo'}
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Conteúdo gerado */}
      {generatedContent && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Conteúdo Gerado</h3>
            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="text-gray-600 hover:text-gray-900"
                title="Copiar para área de transferência"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => alert('Funcionalidade de exportação para Word será implementada em breve.')}
                className="text-gray-600 hover:text-gray-900"
                title="Exportar para Word"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 prose max-w-none">
            {generatedContent.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <p>Nota: Este conteúdo foi gerado por IA e deve ser revisto e editado antes do uso académico.</p>
          </div>
        </div>
      )}
    </div>
  );
}

window.ContentGenerationTab = ContentGenerationTab;
