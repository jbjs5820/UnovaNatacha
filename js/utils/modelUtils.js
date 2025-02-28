// Utilitário para gerenciar modelos Gemini
const ModelUtils = {
  // Mapeamento de modelos antigos para novos
  modelMapping: {
    // Modelos antigos
    'gemini-2.0-flash': 'gemini-2.0-flash',
    'gemini-2.0-flash-thinking-exp-01-21': 'gemini-2.0-flash',
    'gemini-2.0-pro-exp-02-05': 'gemini-pro',
    
    // Modelos atuais (mapeados para si mesmos)
    'gemini-pro': 'gemini-pro',
    'gemini-pro-vision': 'gemini-pro-vision',
    'gemini-1.5-pro': 'gemini-1.5-pro',
    'gemini-1.5-flash': 'gemini-1.5-flash',
    'gemini-2.0-flash': 'gemini-2.0-flash',
    
    // Modelos experimentais
    'gemini-1.5-flash-preview-0514': 'gemini-1.5-flash-preview-0514',
    'gemini-1.5-pro-preview-0514': 'gemini-1.5-pro-preview-0514',
    'gemini-1.5-flash-preview-0409': 'gemini-1.5-flash-preview-0409',
    'gemini-1.5-pro-preview-0409': 'gemini-1.5-pro-preview-0409',
    'gemini-1.5-flash-preview-0327': 'gemini-1.5-flash-preview-0327',
    'gemini-1.5-pro-preview-0327': 'gemini-1.5-pro-preview-0327',
    'gemini-1.5-flash-preview-0314': 'gemini-1.5-flash-preview-0314',
    'gemini-1.5-pro-preview-0314': 'gemini-1.5-pro-preview-0314',
  },
  
  // Lista de modelos válidos
  validModels: [
    // Modelos estáveis
    'gemini-pro',
    'gemini-pro-vision',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    
    // Modelos experimentais
    'gemini-1.5-flash-preview-0514',
    'gemini-1.5-pro-preview-0514',
    'gemini-1.5-flash-preview-0409',
    'gemini-1.5-pro-preview-0409',
    'gemini-1.5-flash-preview-0327',
    'gemini-1.5-pro-preview-0327',
    'gemini-1.5-flash-preview-0314',
    'gemini-1.5-pro-preview-0314',
  ],
  
  // Categorias de modelos para exibição na interface
  modelCategories: {
    'stable': [
      { id: 'gemini-pro', name: 'Gemini Pro' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    ],
    'experimental': [
      { id: 'gemini-1.5-flash-preview-0514', name: 'Gemini 1.5 Flash Preview (05/14)' },
      { id: 'gemini-1.5-pro-preview-0514', name: 'Gemini 1.5 Pro Preview (05/14)' },
      { id: 'gemini-1.5-flash-preview-0409', name: 'Gemini 1.5 Flash Preview (04/09)' },
      { id: 'gemini-1.5-pro-preview-0409', name: 'Gemini 1.5 Pro Preview (04/09)' },
      { id: 'gemini-1.5-flash-preview-0327', name: 'Gemini 1.5 Flash Preview (03/27)' },
      { id: 'gemini-1.5-pro-preview-0327', name: 'Gemini 1.5 Pro Preview (03/27)' },
      { id: 'gemini-1.5-flash-preview-0314', name: 'Gemini 1.5 Flash Preview (03/14)' },
      { id: 'gemini-1.5-pro-preview-0314', name: 'Gemini 1.5 Pro Preview (03/14)' },
    ]
  },
  
  // Função para obter um nome amigável para um modelo
  getModelDisplayName: function(modelId) {
    // Procurar em todas as categorias
    for (const category in this.modelCategories) {
      const model = this.modelCategories[category].find(m => m.id === modelId);
      if (model) {
        return model.name;
      }
    }
    
    // Se não encontrar, retornar o ID do modelo
    return modelId;
  },
  
  // Função para validar e normalizar um nome de modelo
  normalizeModelName: function(modelName) {
    // Log para debug
    console.log('Normalizing model name:', modelName);
    
    // Se o modelo for undefined ou null, retornar o modelo padrão
    if (!modelName) {
      return 'gemini-pro';
    }
    
    // Se o modelo estiver no mapeamento, retornar o modelo mapeado
    if (this.modelMapping[modelName]) {
      console.log(`Model ${modelName} mapped to ${this.modelMapping[modelName]}`);
      return this.modelMapping[modelName];
    }
    
    // Se o modelo não estiver no mapeamento, verificar se é válido
    if (this.validModels.includes(modelName)) {
      return modelName;
    }
    
    // Se chegou aqui, o modelo não é válido, retornar o modelo padrão
    console.warn(`Invalid model name: ${modelName}, using default model`);
    return 'gemini-pro';
  },
  
  // Função para obter o modelo do localStorage ou EnvConfig
  getModelFromStorage: function() {
    const storedModel = localStorage.getItem('geminiModel') || 
                        (typeof EnvConfig !== 'undefined' ? EnvConfig.DEFAULT_MODEL : 'gemini-pro');
    return this.normalizeModelName(storedModel);
  },
  
  // Função para salvar o modelo no localStorage
  saveModelToStorage: function(modelName) {
    const normalizedModel = this.normalizeModelName(modelName);
    localStorage.setItem('geminiModel', normalizedModel);
    return normalizedModel;
  },
  
  // Função para limpar modelos antigos do localStorage
  cleanupOldModels: function() {
    const currentModel = localStorage.getItem('geminiModel');
    if (currentModel && !this.validModels.includes(currentModel)) {
      console.log(`Cleaning up old model: ${currentModel}`);
      localStorage.setItem('geminiModel', this.normalizeModelName(currentModel));
    }
  },
  
  // Função para verificar se um modelo é experimental
  isExperimentalModel: function(modelName) {
    return this.modelCategories.experimental.some(m => m.id === modelName);
  }
};

// Executar limpeza de modelos antigos ao carregar
ModelUtils.cleanupOldModels();
