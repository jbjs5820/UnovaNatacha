// Utilitário para interagir com a API Gemini
const GeminiAPI = {
  // Modelos disponíveis (obtidos do ModelUtils)
  get availableModels() {
    return ModelUtils.validModels;
  },
  
  // Função para enviar uma solicitação para a API Gemini
  async generateContent(apiKey, prompt, options = {}) {
    if (!apiKey) {
      throw new Error('Chave API Gemini não fornecida');
    }

    const defaultOptions = {
      model: ModelUtils.getModelFromStorage(),
      temperature: 0.7,
      maxOutputTokens: 100000,
      topK: 40,
      topP: 0.95,
    };

    const mergedOptions = { ...defaultOptions, ...options };
    
    // Normalizar o nome do modelo
    mergedOptions.model = ModelUtils.normalizeModelName(mergedOptions.model);
    
    try {
      console.log('Using Gemini model:', mergedOptions.model);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${mergedOptions.model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: mergedOptions.temperature,
            maxOutputTokens: mergedOptions.maxOutputTokens,
            topK: mergedOptions.topK,
            topP: mergedOptions.topP,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Erro na API Gemini: ${response.status}`);
      }

      const data = await response.json();
      
      // Extrair o texto da resposta
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        const responseText = data.candidates[0].content.parts[0].text;
        
        // Salvar interação no Supabase se inicializado e interactionType está definido
        if (SupabaseClient.isInitialized() && mergedOptions.interactionType) {
          this.saveInteraction(prompt, responseText, mergedOptions.model, mergedOptions.interactionType, mergedOptions.metadata);
        }
        
        return responseText;
      } else {
        throw new Error('Formato de resposta inesperado da API Gemini');
      }
    } catch (error) {
      console.error('Erro ao chamar a API Gemini:', error);
      throw error;
    }
  },

  // Função para salvar uma interação na base de dados
  async saveInteraction(prompt, response, model, type, metadata = {}) {
    try {
      // Usar AIUtils para salvar a interação (que vai usar o melhor serviço disponível)
      if (window.AIUtils) {
        const result = await AIUtils.storeInteraction(prompt, response, model, type, metadata);
        if (result.success) {
          console.log('Interação salva com sucesso via AIUtils.');
          return result;
        } else {
          console.warn('Falha ao salvar interação via AIUtils:', result.error);
        }
      }
      
      // Fallback para AIInteractionsService
      if (window.AIInteractionsService) {
        const result = await AIInteractionsService.storeInteraction(prompt, response, model, type, metadata);
        if (result.success) {
          console.log('Interação salva com sucesso via AIInteractionsService.');
          return result;
        } else {
          console.warn('Falha ao salvar interação via AIInteractionsService:', result.error);
        }
      }
      
      // Fallback para SupabaseClient
      if (window.SupabaseClient && SupabaseClient.isInitialized()) {
        await SupabaseClient.storeAIInteraction({
          prompt,
          response,
          model,
          type,
          metadata
        });
        console.log('Interação salva com sucesso via SupabaseClient.');
        return { success: true, source: 'supabase' };
      } else {
        console.log('Nenhum serviço de armazenamento disponível. Interação não será salva.');
        return { success: false, error: 'Nenhum serviço de armazenamento disponível' };
      }
    } catch (error) {
      console.error('Erro ao salvar interação:', error);
      return { success: false, error };
    }
  },

  // Função para pesquisar artigos acadêmicos usando Gemini
  async searchAcademicPapers(apiKey, query, options = {}) {
    const mergedOptions = { 
      ...{ 
        model: ModelUtils.getModelFromStorage(),
        interactionType: 'paper_search',
        metadata: { query }
      }, 
      ...options 
    };
    
    // Normalizar o nome do modelo
    mergedOptions.model = ModelUtils.normalizeModelName(mergedOptions.model);
    
    console.log('Search papers using model:', mergedOptions.model);
    
    const prompt = `
      Atue como um assistente de pesquisa acadêmica. Preciso de informações sobre artigos científicos relacionados ao seguinte tema:
      
      "${query}"
      
      Por favor, forneça uma lista de 5 artigos acadêmicos relevantes no seguinte formato JSON:
      
      [
        {
          "title": "Título completo do artigo",
          "authors": "Nomes dos autores",
          "year": "Ano de publicação",
          "journal": "Nome do jornal ou conferência",
          "link": "URL para o artigo (se disponível)",
          "abstract": "Resumo breve do artigo"
        },
        ...
      ]
      
      Certifique-se de que os artigos sejam reais, academicamente relevantes e recentes (últimos 5 anos, se possível).
      Forneça apenas o JSON válido, sem texto adicional.
    `;

    try {
      const jsonResponse = await this.generateContent(apiKey, prompt, {
        temperature: 0.2, // Menor temperatura para resultados mais precisos
        model: mergedOptions.model,
        interactionType: mergedOptions.interactionType,
        metadata: mergedOptions.metadata
      });

      // Extrair o JSON da resposta
      const jsonMatch = jsonResponse.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('Erro ao analisar JSON:', e);
          throw new Error('Não foi possível processar os resultados da pesquisa');
        }
      } else {
        throw new Error('Formato de resposta inválido da API');
      }
    } catch (error) {
      console.error('Erro na pesquisa de artigos:', error);
      throw error;
    }
  },

  // Função para analisar texto usando Gemini
  async analyzeText(apiKey, text, analysisType, options = {}) {
    const mergedOptions = { 
      ...{ 
        model: ModelUtils.getModelFromStorage(),
        interactionType: 'text_analysis',
        metadata: { analysisType, textLength: text.length }
      }, 
      ...options 
    };
    
    // Normalizar o nome do modelo
    mergedOptions.model = ModelUtils.normalizeModelName(mergedOptions.model);
    
    console.log('Analyze text using model:', mergedOptions.model);
    
    let prompt = '';
    
    switch (analysisType) {
      case 'summary':
        prompt = `
          Analise o seguinte texto acadêmico e forneça:
          1. Um resumo conciso (máximo 200 palavras)
          2. Uma lista de pontos-chave (máximo 5 pontos)
          3. Sugestões para melhorias (máximo 3 sugestões)
          
          Texto para análise:
          "${text}"
          
          Responda no formato JSON:
          {
            "summary": "resumo aqui",
            "keyPoints": ["ponto 1", "ponto 2", ...],
            "suggestions": ["sugestão 1", "sugestão 2", ...]
          }
        `;
        break;
        
      case 'keywords':
        prompt = `
          Extraia as palavras-chave mais relevantes do seguinte texto acadêmico.
          Para cada palavra-chave, forneça uma pontuação de relevância (0-1) e o número de ocorrências.
          
          Texto para análise:
          "${text}"
          
          Responda no formato JSON:
          {
            "keywords": [
              {"term": "palavra1", "relevance": 0.95, "count": 7},
              {"term": "palavra2", "relevance": 0.82, "count": 5},
              ...
            ]
          }
        `;
        break;
        
      case 'sentiment':
        prompt = `
          Analise o sentimento e o tom do seguinte texto acadêmico.
          Classifique o sentimento geral (positivo, negativo, neutro) e identifique o tom predominante.
          
          Texto para análise:
          "${text}"
          
          Responda no formato JSON:
          {
            "sentiment": "positivo|negativo|neutro",
            "score": 0.75, // valor entre -1 e 1
            "tones": [
              {"tone": "formal", "confidence": 0.8},
              {"tone": "analítico", "confidence": 0.7},
              ...
            ],
            "analysis": "breve análise do sentimento e tom"
          }
        `;
        break;
        
      case 'structure':
        prompt = `
          Analise a estrutura do seguinte texto acadêmico.
          Identifique as seções principais, avalie a coerência e a coesão, e sugira melhorias estruturais.
          
          Texto para análise:
          "${text}"
          
          Responda no formato JSON:
          {
            "sections": ["seção1", "seção2", ...],
            "coherenceScore": 0.85, // valor entre 0 e 1
            "cohesionScore": 0.75, // valor entre 0 e 1
            "structuralIssues": ["problema1", "problema2", ...],
            "suggestions": ["sugestão1", "sugestão2", ...]
          }
        `;
        break;
        
      default:
        throw new Error('Tipo de análise não suportado');
    }
    
    try {
      const jsonResponse = await this.generateContent(apiKey, prompt, {
        temperature: 0.3,
        maxOutputTokens: 1000,
        model: mergedOptions.model,
        interactionType: mergedOptions.interactionType,
        metadata: mergedOptions.metadata
      });
      
      // Extrair o JSON da resposta
      const jsonMatch = jsonResponse.match(/\{.*\}/s);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('Erro ao analisar JSON:', e);
          throw new Error('Não foi possível processar os resultados da análise');
        }
      } else {
        throw new Error('Formato de resposta inválido da API');
      }
    } catch (error) {
      console.error('Erro na análise de texto:', error);
      throw error;
    }
  },
  
  // Função para gerar conteúdo acadêmico
  async generateAcademicContent(apiKey, prompt, contentType, language = 'pt', options = {}) {
    const mergedOptions = { 
      ...{ 
        model: ModelUtils.getModelFromStorage(),
        interactionType: 'academic_content',
        metadata: { contentType, language }
      }, 
      ...options 
    };
    
    // Normalizar o nome do modelo
    mergedOptions.model = ModelUtils.normalizeModelName(mergedOptions.model);
    
    console.log('Generate academic content using model:', mergedOptions.model);
    
    const langPrefix = language === 'pt' ? 'português de Portugal' : 'English';
    
    let systemPrompt = '';
    
    switch (contentType) {
      case 'resumo':
        systemPrompt = `Crie um resumo acadêmico em ${langPrefix} sobre o seguinte tema. O resumo deve ser claro, conciso e seguir o formato acadêmico padrão.`;
        break;
        
      case 'revisao':
        systemPrompt = `Escreva uma revisão da literatura em ${langPrefix} sobre o seguinte tema. Inclua referências a trabalhos recentes (últimos 5 anos) e destaque as principais descobertas e tendências.`;
        break;
        
      case 'metodologia':
        systemPrompt = `Descreva uma metodologia de pesquisa em ${langPrefix} para investigar o seguinte tema. Inclua abordagem, métodos de coleta de dados, análise e considerações éticas.`;
        break;
        
      case 'conclusao':
        systemPrompt = `Escreva uma conclusão acadêmica em ${langPrefix} para um artigo sobre o seguinte tema. Resuma os principais pontos, destaque a contribuição para o campo e sugira direções para pesquisas futuras.`;
        break;
        
      default:
        systemPrompt = `Gere conteúdo acadêmico em ${langPrefix} sobre o seguinte tema.`;
    }
    
    const fullPrompt = `${systemPrompt}\n\nTema: ${prompt}`;
    
    try {
      return await this.generateContent(apiKey, fullPrompt, {
        temperature: 0.7,
        maxOutputTokens: 1500,
        model: mergedOptions.model,
        interactionType: mergedOptions.interactionType,
        metadata: mergedOptions.metadata
      });
    } catch (error) {
      console.error('Erro na geração de conteúdo:', error);
      throw error;
    }
  }
};

window.GeminiAPI = GeminiAPI;
