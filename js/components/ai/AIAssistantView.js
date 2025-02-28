// Componente principal do Assistente de IA
function AIAssistantView({ resources, setResources, googleApiKey }) {
  const [activeTab, setActiveTab] = React.useState('search');
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Assistente de IA para Pesquisa</h2>
      </div>
      
      {/* Tabs de navegação */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pesquisa de Artigos
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'generate'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Geração de Conteúdo
          </button>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analyze'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Análise de Texto
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Histórico de IA
          </button>
        </nav>
      </div>
      
      {/* Conteúdo das tabs */}
      <div className="mt-6">
        {activeTab === 'search' && <PaperSearchTab resources={resources} setResources={setResources} googleApiKey={googleApiKey} />}
        {activeTab === 'generate' && <ContentGenerationTab />}
        {activeTab === 'analyze' && <TextAnalysisTab />}
        {activeTab === 'history' && <AIHistoryView />}
      </div>
    </div>
  );
}

window.AIAssistantView = AIAssistantView;
