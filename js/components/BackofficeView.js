// Componente para o backoffice e ferramentas de administração
function BackofficeView() {
  const [activeSection, setActiveSection] = React.useState('');
  const [iframeUrl, setIframeUrl] = React.useState('');
  
  const handleToolSelection = (url) => {
    setIframeUrl(url);
    setActiveSection('iframe');
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Backoffice & Ferramentas de Administração</h2>
      
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
        <p className="font-bold">Área de Administração</p>
        <p>Estas ferramentas são destinadas apenas para administradores e desenvolvedores.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div 
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md cursor-pointer transition-all"
          onClick={() => handleToolSelection('setup-supabase-schema.html')}
        >
          <h3 className="font-semibold text-lg mb-2">Verificação de Schema</h3>
          <p className="text-gray-600 text-sm">Verificar se as tabelas do Supabase foram criadas corretamente.</p>
        </div>
        
        <div 
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md cursor-pointer transition-all"
          onClick={() => handleToolSelection('test-project-interactions.html')}
        >
          <h3 className="font-semibold text-lg mb-2">Teste de Interações</h3>
          <p className="text-gray-600 text-sm">Testar a criação de projetos e interações com IA.</p>
        </div>
        
        <div 
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md cursor-pointer transition-all"
          onClick={() => handleToolSelection('test-supabase-table.html')}
        >
          <h3 className="font-semibold text-lg mb-2">Teste de Tabelas</h3>
          <p className="text-gray-600 text-sm">Testar operações básicas nas tabelas do Supabase.</p>
        </div>
      </div>
      
      <div className="mb-4">
        <button
          onClick={() => setActiveSection('')}
          className={`${activeSection === 'iframe' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200`}
        >
          Fechar Ferramenta
        </button>
      </div>
      
      {activeSection === 'iframe' && (
        <div className="border border-gray-300 rounded-lg">
          <iframe 
            src={iframeUrl} 
            className="w-full h-screen rounded-lg"
            title="Ferramenta de Administração"
          ></iframe>
        </div>
      )}
    </div>
  );
}

// Export the component
window.BackofficeView = BackofficeView;
