// Importar os modelos e utilitários
import { 
  createTaskModel, 
  createProjectModel, 
  createResourceModel, 
  detectResearchAreas, 
  calculateRelevance 
} from './utils/models.js';

// Importar os componentes principais
import TasksView from './components/TasksView.js';
import ProjectsView from './components/ProjectsView.js';
import ResourcesView from './components/ResourcesView.js';

// Importar os componentes do assistente de IA
import AIAssistantView from './components/ai/AIAssistantView.js';
import PaperSearchTab from './components/ai/PaperSearchTab.js';
import ContentGenerationTab from './components/ai/ContentGenerationTab.js';
import TextAnalysisTab from './components/ai/TextAnalysisTab.js';

// Exportar todos os componentes e utilitários
export {
  // Modelos e utilitários
  createTaskModel,
  createProjectModel,
  createResourceModel,
  detectResearchAreas,
  calculateRelevance,
  
  // Componentes principais
  TasksView,
  ProjectsView,
  ResourcesView,
  
  // Componentes do assistente de IA
  AIAssistantView,
  PaperSearchTab,
  ContentGenerationTab,
  TextAnalysisTab
};
