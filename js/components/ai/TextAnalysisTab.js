// Componente para análise de texto com IA
function TextAnalysisTab() {
  const [inputText, setInputText] = React.useState('');
  const [analysisType, setAnalysisType] = React.useState('summary');
  const [analysisResult, setAnalysisResult] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  // Função para realizar a análise de texto
  const analyzeText = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Obter a chave API e modelo
      const apiKey = localStorage.getItem('geminiApiKey') || EnvConfig.GEMINI_API_KEY;
      const model = ModelUtils.getModelFromStorage();
      
      // Usar o utilitário GeminiAPI para analisar o texto
      const result = await GeminiAPI.analyzeText(
        apiKey,
        inputText,
        analysisType,
        { 
          model,
          interactionType: 'text_analysis',
          metadata: {
            analysisType,
            textLength: inputText.length,
            characterCount: inputText.length,
            wordCount: inputText.trim().split(/\s+/).length
          }
        }
      );
      
      setAnalysisResult(result);
    } catch (err) {
      console.error('Erro na análise de texto:', err);
      setError(err.message || 'Ocorreu um erro ao analisar o texto');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Renderizar o resultado da análise baseado no tipo
  const renderAnalysisResult = () => {
    if (!analysisResult) return null;
    
    switch (analysisType) {
      case 'summary':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Resumo</h4>
              <p className="text-gray-700">{analysisResult.summary}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Pontos-Chave</h4>
              <ul className="list-disc pl-5 space-y-1">
                {analysisResult.keyPoints.map((point, index) => (
                  <li key={index} className="text-gray-700">{point}</li>
                ))}
              </ul>
            </div>
            
            {analysisResult.suggestions && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Sugestões de Melhoria</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-gray-700">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
        
      case 'keywords':
        return (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Palavras-Chave Identificadas</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Termo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Relevância
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ocorrências
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analysisResult.keywords.map((keyword, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {keyword.term}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${Math.round(keyword.relevance * 100)}%` }}
                            ></div>
                          </div>
                          <span className="ml-2">{Math.round(keyword.relevance * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {keyword.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'sentiment':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <h4 className="font-semibold text-gray-800">Sentimento Geral:</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                analysisResult.sentiment === 'positivo' ? 'bg-green-100 text-green-800' :
                analysisResult.sentiment === 'negativo' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {analysisResult.sentiment.charAt(0).toUpperCase() + analysisResult.sentiment.slice(1)}
              </span>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Pontuação de Sentimento</h4>
              <div className="flex items-center">
                <span className="text-red-500 mr-2">Negativo</span>
                <div className="flex-grow bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${analysisResult.score >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ 
                      width: `${Math.abs(analysisResult.score) * 100}%`,
                      marginLeft: analysisResult.score >= 0 ? '50%' : `${(1 - Math.abs(analysisResult.score)) * 50}%`
                    }}
                  ></div>
                </div>
                <span className="text-green-500 ml-2">Positivo</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Tons Identificados</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.tones.map((tone, index) => (
                  <div key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {tone.tone} ({Math.round(tone.confidence * 100)}%)
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Análise</h4>
              <p className="text-gray-700">{analysisResult.analysis}</p>
            </div>
          </div>
        );
        
      case 'structure':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Seções Identificadas</h4>
              <ul className="list-disc pl-5 space-y-1">
                {analysisResult.sections.map((section, index) => (
                  <li key={index} className="text-gray-700">{section}</li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Coerência</h4>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.round(analysisResult.coherenceScore * 100)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2">{Math.round(analysisResult.coherenceScore * 100)}%</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Coesão</h4>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.round(analysisResult.cohesionScore * 100)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2">{Math.round(analysisResult.cohesionScore * 100)}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Problemas Estruturais</h4>
              <ul className="list-disc pl-5 space-y-1">
                {analysisResult.structuralIssues.map((issue, index) => (
                  <li key={index} className="text-gray-700">{issue}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Sugestões</h4>
              <ul className="list-disc pl-5 space-y-1">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-gray-700">{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        );
        
      default:
        return <p>Tipo de análise não suportado.</p>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Texto para Análise
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Cole aqui o texto que deseja analisar..."
            rows={8}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Análise
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="summary"
                type="radio"
                value="summary"
                checked={analysisType === 'summary'}
                onChange={() => setAnalysisType('summary')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="summary" className="ml-2 block text-sm text-gray-700">
                Resumo e Pontos-Chave
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="keywords"
                type="radio"
                value="keywords"
                checked={analysisType === 'keywords'}
                onChange={() => setAnalysisType('keywords')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="keywords" className="ml-2 block text-sm text-gray-700">
                Palavras-Chave
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="sentiment"
                type="radio"
                value="sentiment"
                checked={analysisType === 'sentiment'}
                onChange={() => setAnalysisType('sentiment')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="sentiment" className="ml-2 block text-sm text-gray-700">
                Análise de Sentimento
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="structure"
                type="radio"
                value="structure"
                checked={analysisType === 'structure'}
                onChange={() => setAnalysisType('structure')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="structure" className="ml-2 block text-sm text-gray-700">
                Estrutura e Coerência
              </label>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={analyzeText}
              disabled={isLoading || !inputText.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Analisando...' : 'Analisar Texto'}
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {analysisResult && !isLoading && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Resultados da Análise</h3>
          <div className="bg-white border border-gray-200 rounded-md p-4">
            {renderAnalysisResult()}
          </div>
        </div>
      )}
    </div>
  );
}

window.TextAnalysisTab = TextAnalysisTab;
