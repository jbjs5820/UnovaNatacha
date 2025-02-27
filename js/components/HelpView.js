// Componente para exibir documentação e ajuda
function HelpView() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Ajuda e Documentação</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold text-gray-800 mb-4">Sobre a Aplicação</h3>
        <p className="text-gray-600 mb-6">
          Esta aplicação foi desenvolvida para ajudar investigadores de doutoramento a gerir os seus projetos, 
          tarefas e recursos de investigação de forma eficiente.
        </p>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Gestão de Tarefas</h4>
            <p className="text-gray-600">
              O separador de Tarefas permite-lhe criar, editar e acompanhar o progresso das suas tarefas de investigação.
              Pode categorizar tarefas, definir prazos e prioridades, e marcar tarefas como concluídas quando terminadas.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Gestão de Projetos</h4>
            <p className="text-gray-600">
              O separador de Projetos permite-lhe organizar o seu trabalho em projetos distintos.
              Pode associar tarefas a projetos específicos e acompanhar o progresso geral de cada projeto.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Gestão de Recursos</h4>
            <p className="text-gray-600">
              O separador de Recursos permite-lhe catalogar artigos, livros, websites e outros materiais relevantes para a sua investigação.
              Pode adicionar metadados como autores, datas de publicação e URLs para referência futura.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Assistente de IA</h4>
            <p className="text-gray-600">
              O Assistente de IA utiliza a API Gemini da Google para ajudar na sua investigação.
              Pode fazer perguntas relacionadas com a sua área de estudo, obter sugestões para os seus projetos,
              e pesquisar artigos académicos relevantes.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Exportação de Dados</h4>
            <p className="text-gray-600">
              O separador de Exportação permite-lhe exportar os seus dados de investigação em diferentes formatos,
              incluindo JSON e PDF, para backup ou partilha com colegas.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Configurações</h4>
            <p className="text-gray-600">
              O separador de Configurações permite-lhe personalizar a aplicação de acordo com as suas preferências.
              Pode definir a sua chave API Gemini, escolher o idioma da interface e selecionar o tema visual.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold text-gray-800 mb-4">Perguntas Frequentes</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Como os meus dados são armazenados?</h4>
            <p className="text-gray-600">
              Todos os dados são armazenados localmente no seu navegador utilizando localStorage.
              Nenhum dado é enviado para servidores externos, exceto quando utiliza o Assistente de IA,
              que envia consultas para a API Gemini da Google.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Como posso fazer backup dos meus dados?</h4>
            <p className="text-gray-600">
              Utilize o separador de Exportação para exportar todos os seus dados para um ficheiro JSON.
              Guarde este ficheiro num local seguro para backup.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Preciso de uma chave API Gemini?</h4>
            <p className="text-gray-600">
              Uma chave API padrão está incluída, mas para melhor desempenho e para evitar limitações de uso,
              recomendamos que obtenha a sua própria chave API gratuita em 
              <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-blue-600 hover:underline ml-1">
                Google AI Studio
              </a>.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Como posso reportar um problema ou sugerir uma funcionalidade?</h4>
            <p className="text-gray-600">
              Por favor, contacte o desenvolvedor através do email fornecido na documentação ou crie um issue
              no repositório do projeto, caso esteja disponível.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold text-gray-800 mb-4">Atalhos de Teclado</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="inline-block bg-gray-200 rounded px-2 py-1 text-sm font-mono">Ctrl + N</span>
            <span className="ml-2">Nova Tarefa</span>
          </div>
          <div>
            <span className="inline-block bg-gray-200 rounded px-2 py-1 text-sm font-mono">Ctrl + P</span>
            <span className="ml-2">Novo Projeto</span>
          </div>
          <div>
            <span className="inline-block bg-gray-200 rounded px-2 py-1 text-sm font-mono">Ctrl + R</span>
            <span className="ml-2">Novo Recurso</span>
          </div>
          <div>
            <span className="inline-block bg-gray-200 rounded px-2 py-1 text-sm font-mono">Ctrl + S</span>
            <span className="ml-2">Guardar Alterações</span>
          </div>
          <div>
            <span className="inline-block bg-gray-200 rounded px-2 py-1 text-sm font-mono">Ctrl + F</span>
            <span className="ml-2">Pesquisar</span>
          </div>
          <div>
            <span className="inline-block bg-gray-200 rounded px-2 py-1 text-sm font-mono">Ctrl + H</span>
            <span className="ml-2">Mostrar Ajuda</span>
          </div>
        </div>
      </div>
    </div>
  );
}

window.HelpView = HelpView;
