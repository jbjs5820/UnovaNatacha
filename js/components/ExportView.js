// Componente para exportação de dados
function ExportView({ tasks, projects, resources }) {
  const exportJSON = () => {
    const data = { 
      tasks, 
      projects, 
      resources,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'phd-research-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Exportar para PDF usando jsPDF
  const exportPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text("Relatório de Pesquisa PhD", 105, 15, null, null, "center");
    
    // Data
    doc.setFontSize(12);
    doc.text(`Exportado em: ${new Date().toLocaleDateString()}`, 105, 25, null, null, "center");
    
    // Tarefas
    doc.setFontSize(16);
    doc.text("Tarefas", 20, 40);
    
    let yPos = 50;
    tasks.forEach((task, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${task.title} (${task.status})`, 20, yPos);
      yPos += 7;
      
      if (task.description) {
        doc.setFontSize(10);
        doc.text(`   ${task.description.substring(0, 80)}${task.description.length > 80 ? '...' : ''}`, 20, yPos);
        yPos += 10;
      }
    });
    
    // Projetos
    if (projects.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 10;
      }
      
      doc.setFontSize(16);
      doc.text("Projetos", 20, yPos);
      yPos += 10;
      
      projects.forEach((project, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${project.name}`, 20, yPos);
        yPos += 7;
        
        if (project.description) {
          doc.setFontSize(10);
          doc.text(`   ${project.description.substring(0, 80)}${project.description.length > 80 ? '...' : ''}`, 20, yPos);
          yPos += 10;
        }
      });
    }
    
    // Recursos
    if (resources.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 10;
      }
      
      doc.setFontSize(16);
      doc.text("Recursos", 20, yPos);
      yPos += 10;
      
      resources.forEach((resource, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${resource.title}`, 20, yPos);
        yPos += 7;
        
        if (resource.authors) {
          doc.setFontSize(10);
          doc.text(`   Autores: ${resource.authors}`, 20, yPos);
          yPos += 7;
        }
        
        if (resource.url) {
          doc.setFontSize(10);
          doc.text(`   URL: ${resource.url.substring(0, 80)}${resource.url.length > 80 ? '...' : ''}`, 20, yPos);
          yPos += 10;
        }
      });
    }
    
    doc.save("phd-research-report.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Exportar Dados</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold text-gray-800 mb-4">Opções de Exportação</h3>
        <p className="text-gray-600 mb-6">
          Exporte seus dados de pesquisa para diferentes formatos para backup ou compartilhamento.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={exportJSON}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
          >
            Exportar para JSON
          </button>
          
          <button
            onClick={exportPDF}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
          >
            Exportar para PDF
          </button>
        </div>
      </div>
    </div>
  );
}

window.ExportView = ExportView;
