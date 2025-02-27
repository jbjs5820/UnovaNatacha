// Modelos de dados para a aplicação

// Modelo de Tarefa
const createTaskModel = (data = {}) => ({
  id: data.id || Date.now(),
  title: data.title || '',
  description: data.description || '',
  assignedTo: data.assignedTo || '',
  dueDate: data.dueDate || '',
  priority: data.priority || 'Média',
  status: data.status || 'Não Iniciada',
  category: data.category || 'Investigação',
  comments: data.comments || [],
  files: data.files || [],
  progress: data.progress || 0,
  aiContent: data.aiContent || '', // Conteúdo gerado pela IA
  aiReviewed: data.aiReviewed || false // Indica se o conteúdo foi revisto pelo utilizador
});

// Modelo de Projeto
const createProjectModel = (data = {}) => ({
  id: data.id || Date.now(),
  name: data.name || '',
  description: data.description || '',
  deadline: data.deadline || '',
  members: data.members || [],
  status: data.status || 'Não Iniciado',
  progress: data.progress || 0,
  aiProposal: data.aiProposal || '', // Proposta detalhada gerada pela IA
  aiReviewed: data.aiReviewed || false // Revisão pelo utilizador
});

// Modelo de Recurso
const createResourceModel = (data = {}) => ({
  id: data.id || Date.now(),
  title: data.title || '',
  type: data.type || 'Artigo Científico',
  author: data.author || '',
  year: data.year || new Date().getFullYear(),
  url: data.url || '',
  notes: data.notes || '',
  area: data.area || 'Outra', // Área temática
  relevance: data.relevance || 'Média' // Relevância para o projeto
});

// Dados padrão de tarefas
const defaultTasks = [
  createTaskModel({
    id: 1,
    title: 'Revisão da Literatura',
    description: 'Realizar revisão da literatura sobre teorias de economia comportamental',
    assignedTo: 'Membro da Equipa 1',
    dueDate: '2025-03-15',
    priority: 'Alta',
    status: 'Em Curso',
    category: 'Investigação',
    progress: 30
  }),
  createTaskModel({
    id: 2,
    title: 'Plano de Análise de Dados',
    description: 'Desenvolver metodologia para análise de dados de equilíbrio de mercado',
    assignedTo: 'Membro da Equipa 2',
    dueDate: '2025-03-10',
    priority: 'Média',
    status: 'Não Iniciada',
    category: 'Análise',
    progress: 0
  })
];

// Dados padrão de projetos
const defaultProjects = [
  createProjectModel({
    id: 1,
    name: 'Análise de Equilíbrio de Mercado',
    description: 'Investigação sobre equilíbrio dinâmico em mercados emergentes',
    deadline: '2025-05-20',
    members: ['Membro da Equipa 1', 'Membro da Equipa 2', 'Membro da Equipa 3'],
    status: 'Em Curso',
    progress: 25
  })
];

// Dados padrão de recursos
const defaultResources = [
  createResourceModel({
    id: 1,
    title: 'Métodos Econométricos para Dados em Painel',
    type: 'Livro',
    author: 'Wooldridge, J.',
    year: 2020,
    notes: 'Capítulos 10-12 particularmente relevantes para a nossa metodologia',
    area: 'Economia',
    relevance: 'Alta'
  }),
  createResourceModel({
    id: 2,
    title: 'Abordagem da Teoria dos Jogos à Tomada de Decisão em Gestão',
    type: 'Artigo Científico',
    author: 'Schmidt, B.',
    year: 2023,
    url: 'https://doi.org/10.1234/example',
    notes: 'Fornece estrutura teórica para a nossa análise',
    area: 'Gestão',
    relevance: 'Média'
  })
];

// Detectar área do paper com base no texto
const detectArea = (text) => {
  text = text.toLowerCase();
  if (text.includes('econom') || text.includes('financ') || text.includes('mercado')) {
    return 'Economia';
  } else if (text.includes('gest') || text.includes('administra') || text.includes('negóci')) {
    return 'Gestão';
  } else if (text.includes('dados') || text.includes('estatístic') || text.includes('análise quantitativ')) {
    return 'Ciência de Dados';
  } else if (text.includes('ai') || text.includes('inteligência artificial') || text.includes('machine learning')) {
    return 'Inteligência Artificial';
  }
  return 'Outra';
};

// Calcular relevância com base na correspondência entre o título e a consulta
const calculateRelevance = (title, query) => {
  const words = query.toLowerCase().split(' ');
  const titleLower = title.toLowerCase();
  const matchCount = words.filter(word => titleLower.includes(word)).length;
  const ratio = matchCount / words.length;
  
  if (ratio > 0.7) return 'Alta';
  if (ratio > 0.4) return 'Média';
  return 'Baixa';
};

// Exportar os modelos como variáveis globais
window.createTaskModel = createTaskModel;
window.createProjectModel = createProjectModel;
window.createResourceModel = createResourceModel;
window.defaultTasks = defaultTasks;
window.defaultProjects = defaultProjects;
window.defaultResources = defaultResources;
window.detectArea = detectArea;
window.calculateRelevance = calculateRelevance;
