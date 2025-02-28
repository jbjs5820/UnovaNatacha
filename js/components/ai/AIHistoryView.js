// Componente para visualizar o histórico de interações com IA
function AIHistoryView() {
  const [interactions, setInteractions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedInteraction, setSelectedInteraction] = React.useState(null);
  const [filter, setFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [exportFormat, setExportFormat] = React.useState('json');
  const [dataSource, setDataSource] = React.useState('');
  const itemsPerPage = 10;
  
  // Carregar interações ao montar o componente
  React.useEffect(() => {
    loadInteractions();
  }, [filter, page]);
  
  // Função para carregar interações
  const loadInteractions = async () => {
    setLoading(true);
    setError(null);
    
    // Verificar se temos o serviço de interações
    if (!window.AIInteractionsService) {
      setLoading(false);
      setError('Serviço de interações AI não disponível.');
      return;
    }
    
    const options = {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      sortBy: 'created_at',
      sortDirection: 'desc'
    };
    
    // Adicionar filtro por tipo se não for 'all'
    if (filter !== 'all') {
      options.type = filter;
    }
    
    try {
      const result = await AIInteractionsService.getInteractions(options);
      
      setLoading(false);
      
      if (!result.success) {
        console.error('Erro ao carregar interações:', result.error);
        setError('Não foi possível carregar as interações: ' + (result.error?.message || 'Erro desconhecido'));
        return;
      }
      
      setInteractions(result.data || []);
      setTotalCount(result.count || 0);
      setDataSource(result.source || '');
      
      // Se não houver dados e estamos em uma página > 1, voltar para a página 1
      if (result.data.length === 0 && page > 1) {
        setPage(1);
      }
    } catch (error) {
      setLoading(false);
      console.error('Exceção ao carregar interações:', error);
      setError('Erro ao carregar interações: ' + error.message);
    }
  };
  
  // Função para exportar interações
  const exportInteractions = async () => {
    if (!window.AIInteractionsService) {
      setError('Serviço de interações AI não disponível.');
      return;
    }
    
    try {
      // Implementar exportação usando o serviço
      // Por enquanto, vamos criar uma exportação básica
      const { data: interactions } = await AIInteractionsService.getInteractions({
        limit: 1000, // Exportar mais interações
        sortBy: 'created_at',
        sortDirection: 'desc'
      });
      
      if (!interactions || interactions.length === 0) {
        setError('Não há interações para exportar.');
        return;
      }
      
      let data, mimeType, filename;
      
      if (exportFormat === 'json') {
        data = JSON.stringify(interactions, null, 2);
        mimeType = 'application/json';
        filename = `ai-interactions-${new Date().toISOString().slice(0, 10)}.json`;
      } else if (exportFormat === 'csv') {
        // Converter para CSV
        const headers = ['id', 'created_at', 'prompt', 'response', 'model', 'interaction_type'];
        const csvRows = [headers.join(',')];
        
        for (const item of interactions) {
          const values = headers.map(header => {
            const value = item[header];
            // Escapar strings com aspas e vírgulas
            return typeof value === 'string' 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          });
          csvRows.push(values.join(','));
        }
        
        data = csvRows.join('\n');
        mimeType = 'text/csv';
        filename = `ai-interactions-${new Date().toISOString().slice(0, 10)}.csv`;
      } else {
        setError('Formato de exportação não suportado.');
        return;
      }
      
      // Criar e fazer download do arquivo
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar interações:', error);
      setError('Falha ao exportar interações: ' + error.message);
    }
  };
  
  // Função para excluir uma interação
  const deleteInteraction = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta interação? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      const result = await AIInteractionsService.deleteInteraction(id);
      
      if (!result.success) {
        console.error('Erro ao excluir interação:', result.error);
        setError('Falha ao excluir a interação: ' + (result.error?.message || 'Erro desconhecido'));
        return;
      }
      
      // Recarregar dados
      loadInteractions();
      
      // Fechar modal se a interação excluída estiver sendo visualizada
      if (selectedInteraction && selectedInteraction.id === id) {
        setSelectedInteraction(null);
      }
    } catch (error) {
      console.error('Exceção ao excluir interação:', error);
      setError('Erro ao excluir a interação: ' + error.message);
    }
  };
  
  // Função para formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-PT', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Tipo de interação para exibição
  const getInteractionTypeDisplay = (type) => {
    const types = {
      'paper_search': 'Pesquisa de Artigos',
      'content_generation': 'Geração de Conteúdo',
      'text_analysis': 'Análise de Texto'
    };
    return types[type] || type;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Histórico de Interações com IA</h2>
        
        <div className="flex space-x-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
          
          <button
            onClick={exportInteractions}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
            disabled={interactions.length === 0}
          >
            Exportar
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Filtros */}
        <div className="p-4 border-b">
          <div className="flex space-x-4">
            <button
              onClick={() => { setFilter('all'); setPage(1); }}
              className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              Todos
            </button>
            <button
              onClick={() => { setFilter('paper_search'); setPage(1); }}
              className={`px-3 py-1 rounded ${filter === 'paper_search' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              Pesquisas
            </button>
            <button
              onClick={() => { setFilter('content_generation'); setPage(1); }}
              className={`px-3 py-1 rounded ${filter === 'content_generation' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              Conteúdo
            </button>
            <button
              onClick={() => { setFilter('text_analysis'); setPage(1); }}
              className={`px-3 py-1 rounded ${filter === 'text_analysis' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
            >
              Análises
            </button>
          </div>
        </div>
        
        {/* Lista de interações */}
        {loading ? (
          <div className="p-8 text-center">
            <p>A carregar interações...</p>
          </div>
        ) : interactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {error ? 'Erro ao carregar interações.' : 'Não há interações para exibir.'}
            </p>
            {!error && !window.AIInteractionsService && (
              <p className="mt-2 text-sm text-blue-600">
                Configure a Supabase em Definições para ativar o histórico de IA.
              </p>
            )}
          </div>
        ) : (
          <div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prompt
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modelo
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interactions.map((interaction) => (
                  <tr key={interaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(interaction.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getInteractionTypeDisplay(interaction.interaction_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                      {interaction.prompt.substring(0, 100) + (interaction.prompt.length > 100 ? '...' : '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {interaction.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedInteraction(interaction)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => deleteInteraction(interaction.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Paginação */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={interactions.length < itemsPerPage}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Próximo
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{(page - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{(page - 1) * itemsPerPage + interactions.length}</span> de{' '}
                    <span className="font-medium">{totalCount}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Anterior</span>
                      &laquo;
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Página {page}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={interactions.length < itemsPerPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Próximo</span>
                      &raquo;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Histórico de Interações com IA</h2>
          <p className="text-sm text-gray-500">
            {dataSource && (
              <span className="mr-2">
                Fonte: <span className="font-medium">{
                  dataSource === 'supabase' ? 'Supabase' : 
                  dataSource === 'local' ? 'Local' : 
                  dataSource === 'merged' ? 'Supabase + Local' : 
                  dataSource
                }</span>
              </span>
            )}
            {totalCount > 0 && (
              <span>Total: <span className="font-medium">{totalCount}</span> interações</span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (window.AIInteractionsService) {
                AIInteractionsService.syncLocalInteractions()
                  .then(result => {
                    if (result.success) {
                      alert(`Sincronização concluída! ${result.synced} interações sincronizadas.`);
                      loadInteractions();
                    } else {
                      setError('Falha na sincronização: ' + (result.error?.message || 'Erro desconhecido'));
                    }
                  })
                  .catch(error => {
                    console.error('Erro na sincronização:', error);
                    setError('Erro na sincronização: ' + error.message);
                  });
              } else {
                setError('Serviço de interações AI não disponível.');
              }
            }}
            className="mr-2 inline-flex items-center rounded-md border border-transparent bg-blue-100 px-3 py-2 text-sm font-medium leading-4 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sincronizar Local
          </button>
        </div>
      </div>
      
      {/* Modal de detalhes */}
      {selectedInteraction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Detalhes da Interação</h3>
              <button 
                onClick={() => setSelectedInteraction(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Tipo</h4>
                  <p className="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {getInteractionTypeDisplay(selectedInteraction.interaction_type)}
                  </p>
                  
                  <h4 className="font-semibold mt-4 mb-2">Data e Hora</h4>
                  <p className="text-gray-700">{formatDate(selectedInteraction.created_at)}</p>
                  
                  <h4 className="font-semibold mt-4 mb-2">Modelo utilizado</h4>
                  <p className="text-gray-700">{selectedInteraction.model}</p>
                  
                  <h4 className="font-semibold mt-4 mb-2">Prompt</h4>
                  <div className="bg-gray-50 p-3 rounded border text-gray-700 max-h-60 overflow-y-auto whitespace-pre-wrap">
                    {selectedInteraction.prompt}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Resposta da IA</h4>
                  <div className="bg-gray-50 p-3 rounded border text-gray-700 max-h-96 overflow-y-auto whitespace-pre-wrap">
                    {selectedInteraction.response}
                  </div>
                </div>
              </div>
              
              {selectedInteraction.metadata && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Metadados Adicionais</h4>
                  <pre className="bg-gray-50 p-3 rounded border text-gray-700 text-xs overflow-x-auto">
                    {JSON.stringify(selectedInteraction.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end space-x-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedInteraction.response);
                  alert('Resposta copiada para a área de transferência!');
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
              >
                Copiar Resposta
              </button>
              <button
                onClick={() => deleteInteraction(selectedInteraction.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Excluir
              </button>
              <button
                onClick={() => setSelectedInteraction(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.AIHistoryView = AIHistoryView;
