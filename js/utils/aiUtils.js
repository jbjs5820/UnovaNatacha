// AI Utilities for the application
const AIUtils = {
  // Store an AI interaction using the AIInteractionsService or fallback to SupabaseClient
  async storeInteraction(prompt, response, model, type, metadata = {}) {
    // Try to use AIInteractionsService first
    if (window.AIInteractionsService) {
      return AIInteractionsService.storeInteraction(prompt, response, model, type, metadata);
    }
    
    // Fallback to SupabaseClient if available
    if (window.SupabaseClient && SupabaseClient.isInitialized()) {
      const interaction = {
        prompt,
        response,
        model,
        type,
        metadata
      };
      
      return SupabaseClient.storeAIInteraction(interaction);
    }
    
    // Last resort: store in localStorage
    try {
      const storedInteractions = localStorage.getItem('ai-interactions');
      const interactions = storedInteractions ? JSON.parse(storedInteractions) : [];
      
      const newInteraction = {
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        created_at: new Date().toISOString(),
        prompt,
        response,
        model,
        interaction_type: type,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          stored_locally: true
        }
      };
      
      interactions.push(newInteraction);
      localStorage.setItem('ai-interactions', JSON.stringify(interactions));
      
      console.log('AI interaction stored locally:', newInteraction);
      return { success: true, data: [newInteraction], source: 'local' };
    } catch (error) {
      console.error('Error storing AI interaction locally:', error);
      return { success: false, error, source: 'local' };
    }
  },
  
  // Process and format AI response text
  formatAIResponse(text) {
    if (!text) return '';
    
    // Convert markdown to HTML (basic implementation)
    // For a full implementation, consider using a markdown library
    let formatted = text
      // Convert headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Convert bold and italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      
      // Convert code blocks
      .replace(/```(.*?)\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      
      // Convert lists
      .replace(/^\s*\n\* (.*)/gim, '<ul>\n<li>$1</li>\n</ul>')
      .replace(/^\s*\n\d+\. (.*)/gim, '<ol>\n<li>$1</li>\n</ol>')
      
      // Fix lists (this is a simplistic approach)
      .replace(/<\/ul>\s*<ul>/gim, '')
      .replace(/<\/ol>\s*<ol>/gim, '')
      
      // Convert line breaks
      .replace(/\n/gim, '<br>');
    
    return formatted;
  },
  
  // Extract key points from AI response
  extractKeyPoints(text) {
    if (!text) return [];
    
    // Look for bullet points, numbered lists, or sections with headers
    const bulletPoints = text.match(/• (.*?)(?=\n•|\n\n|$)/gs) || [];
    const numberedPoints = text.match(/\d+\. (.*?)(?=\n\d+\.|\n\n|$)/gs) || [];
    const headers = text.match(/#+\s+(.*?)(?=\n)/gs) || [];
    
    // Combine and clean up
    const points = [...bulletPoints, ...numberedPoints, ...headers]
      .map(point => point.replace(/^[•\d+\.#\s]+/, '').trim())
      .filter(point => point.length > 0);
    
    // Limit to reasonable number of points
    return points.slice(0, 5);
  },
  
  // Detect the language of the text
  detectLanguage(text) {
    if (!text || typeof text !== 'string') return 'en';
    
    // Simple detection based on common Portuguese words
    const ptWords = ['de', 'da', 'do', 'em', 'para', 'com', 'por', 'uma', 'um', 'não', 'é', 'são', 'na', 'no', 'as', 'os', 'que'];
    const words = text.toLowerCase().split(/\s+/);
    
    // Count Portuguese words
    const ptWordCount = words.filter(word => ptWords.includes(word)).length;
    
    // If more than 10% of words are Portuguese, assume it's Portuguese
    return (ptWordCount / words.length > 0.1) ? 'pt' : 'en';
  },
  
  // Generate a summary of an AI interaction
  generateSummary(prompt, response, maxLength = 100) {
    // Start with the prompt
    let summary = prompt.trim();
    
    // Truncate if too long
    if (summary.length > maxLength) {
      summary = summary.substring(0, maxLength - 3) + '...';
    }
    
    return summary;
  },
  
  // Get available AI models
  getAvailableModels() {
    return [
      { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', provider: 'Google' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
      { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' }
    ];
  },
  
  // Check if a model is available (has API key configured)
  isModelAvailable(modelId) {
    // Check for Google API key for Gemini models
    if (modelId.startsWith('gemini')) {
      return !!localStorage.getItem('googleApiKey');
    }
    
    // Check for OpenAI API key for GPT models
    if (modelId.startsWith('gpt')) {
      return !!localStorage.getItem('openaiApiKey');
    }
    
    return false;
  },
  
  // Get interaction types for filtering
  getInteractionTypes() {
    return [
      { id: 'chat', name: 'Chat' },
      { id: 'analysis', name: 'Analysis' },
      { id: 'research', name: 'Research' },
      { id: 'writing', name: 'Writing' },
      { id: 'coding', name: 'Coding' }
    ];
  }
};

// Export to window
window.AIUtils = AIUtils;
