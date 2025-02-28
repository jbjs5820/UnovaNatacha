# Gestor de Trabalhos Académicos PhD

Uma aplicação web para ajudar investigadores de doutoramento a gerir os seus projetos de pesquisa, tarefas e recursos académicos, com foco nas áreas de Economia, Gestão, Ciência de Dados e Inteligência Artificial.

## Funcionalidades Principais

### Gestão de Tarefas
- Criação, edição e exclusão de tarefas
- Categorização e priorização
- Acompanhamento de progresso
- Filtragem e ordenação

### Gestão de Projetos
- Criação e gestão de projetos de pesquisa
- Atribuição de membros da equipa
- Acompanhamento de prazos e progresso
- Integração com propostas geradas por IA

### Gestão de Recursos Académicos
- Organização de artigos, livros e outros recursos
- Categorização por área de pesquisa
- Avaliação de relevância
- Pesquisa e filtragem

### Assistente de IA (Integração com Gemini API)
- **Pesquisa de Artigos**: Encontre artigos académicos relevantes para a sua pesquisa
- **Geração de Conteúdo**: Crie resumos, revisões de literatura, metodologias e conclusões
- **Análise de Texto**: Extraia insights, palavras-chave, sentimento e estrutura dos seus textos
- **Modelos Disponíveis**: Suporte para modelos Gemini 2.0 Pro e Gemini 2.0 Flash Thinking

## Tecnologias Utilizadas

- **Frontend**: React, Tailwind CSS
- **Armazenamento**: LocalStorage (persistência de dados no navegador)
- **APIs**: Gemini API para funcionalidades de IA
- **Exportação**: Suporte para formatos DOCX, PDF e CSV

## Instalação e Configuração

### Requisitos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Servidor HTTP local (Python ou outro)

### Passos para Instalação
1. Clone este repositório
2. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env.local`
   - Edite `.env.local` e adicione sua chave de API Gemini
   - O arquivo `.env.local` é ignorado pelo Git para proteger suas credenciais
3. Inicie um servidor HTTP local:
   ```
   python -m http.server 8083
   ```
4. Acesse a aplicação em: http://localhost:8083/index.html

### Variáveis de Ambiente
A aplicação utiliza as seguintes variáveis de ambiente:
- `GEMINI_API_KEY`: Sua chave de API do Google Gemini
- `DEFAULT_MODEL`: Modelo Gemini padrão (ex: gemini-2.0-pro-exp-02-05)
- `DEFAULT_LANGUAGE`: Idioma padrão (ex: pt-PT)
- `DEFAULT_THEME`: Tema padrão (ex: light)

## Configuração do Repositório GitHub

Para configurar este projeto em um novo repositório GitHub:

1. Crie um novo repositório no GitHub
2. Configure o repositório local e faça o primeiro commit:
   ```bash
   git init
   git add .
   git commit -m "Commit inicial"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/seu-repositorio.git
   git push -u origin main
   ```

3. Importante: O arquivo `.env.local` contendo suas credenciais não será enviado para o GitHub, pois está listado no `.gitignore`.
4. Novos colaboradores devem copiar o arquivo `.env.example` para `.env.local` e adicionar suas próprias credenciais.

## Configuração

Para utilizar todas as funcionalidades, configure:

1. **Chave API Gemini**: Para as funcionalidades de IA
   - Obtenha uma chave API em [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Configure na secção de Configurações da aplicação

2. **Modelo Gemini**: Escolha entre os modelos disponíveis
   - Gemini 2.0 Pro (gemini-2.0-pro-exp-02-05)
   - Gemini 2.0 Flash Thinking (gemini-2.0-flash-thinking-exp-01-21)

3. **Preferências de Idioma**: Português (Portugal) ou Inglês (EUA)

4. **Tema**: Claro ou Escuro

5. **Formato de Exportação**: DOCX, PDF ou CSV

## Arquitetura da Aplicação

### Estrutura de Ficheiros
```
/
├── index.html            # Ponto de entrada da aplicação
├── css/
│   └── styles.css        # Estilos personalizados
├── js/
│   ├── components/       # Componentes React
│   │   ├── TasksView.js
│   │   ├── ProjectsView.js
│   │   ├── ResourcesView.js
│   │   ├── ExportView.js
│   │   ├── SettingsView.js
│   │   ├── HelpView.js
│   │   └── ai/           # Componentes relacionados com IA
│   │       ├── AIAssistantView.js
│   │       ├── PaperSearchTab.js
│   │       ├── ContentGenerationTab.js
│   │       └── TextAnalysisTab.js
│   └── utils/            # Utilitários
│       ├── geminiApi.js  # Integração com a API Gemini
│       └── models.js     # Modelos de dados
```

### Fluxo de Dados
1. Os dados são armazenados localmente usando `localStorage`
2. Os componentes React gerem o estado da aplicação
3. As interações com a API Gemini são geridas pelo utilitário `geminiApi.js`
4. As configurações do utilizador são persistidas entre sessões

## Modelos Gemini

A aplicação utiliza a API Gemini para funcionalidades de IA. Os modelos suportados são:

### Modelos Estáveis
- `gemini-pro`: Modelo principal para geração de texto
- `gemini-pro-vision`: Modelo para análise de imagens e texto
- `gemini-1.5-pro`: Modelo Gemini 1.5 Pro
- `gemini-1.5-flash`: Modelo Gemini 1.5 Flash
- `gemini-2.0-flash`: Modelo Gemini 2.0 Flash

### Modelos Experimentais
A aplicação também suporta modelos experimentais da API Gemini:
- Modelos Preview do Gemini 1.5 (Flash e Pro)
- Versões experimentais com datas específicas (ex: gemini-1.5-flash-preview-0514)

**Nota**: Os modelos experimentais podem não estar disponíveis no futuro ou apresentar comportamentos inesperados.

### Utilitário ModelUtils
O utilitário `ModelUtils` gerencia automaticamente os nomes dos modelos, garantindo compatibilidade mesmo quando os nomes dos modelos mudam. Para usar um modelo em seu código:

```javascript
// Obter o modelo atual (normalizado)
const model = ModelUtils.getModelFromStorage();

// Normalizar um nome de modelo específico
const normalizedModel = ModelUtils.normalizeModelName('algum-modelo');

// Salvar um modelo no localStorage (com normalização)
ModelUtils.saveModelToStorage('gemini-pro');

// Verificar se um modelo é experimental
const isExperimental = ModelUtils.isExperimentalModel('gemini-1.5-flash-preview-0514');
```

Este utilitário facilita a manutenção do código quando a Google atualiza os nomes dos modelos Gemini.

## Integração com Gemini API

A aplicação utiliza a API Gemini para várias funcionalidades de IA:

1. **Pesquisa de Artigos Académicos**
   - Utiliza o modelo Gemini para encontrar artigos relevantes
   - Retorna informações estruturadas sobre cada artigo

2. **Geração de Conteúdo Académico**
   - Cria resumos, revisões de literatura, metodologias e conclusões
   - Suporta geração em português e inglês

3. **Análise de Texto**
   - Fornece resumos e pontos-chave
   - Extrai palavras-chave com relevância
   - Analisa sentimento e tom do texto
   - Avalia a estrutura e coerência do documento

## Prompt para Criar esta Aplicação com IA

Se quiser criar uma aplicação semelhante utilizando uma ferramenta de IA, pode utilizar o seguinte prompt:

```
Crie uma aplicação web para gestão de trabalhos académicos de doutoramento, focada nas áreas de Economia, Gestão, Ciência de Dados e Inteligência Artificial. A aplicação deve ser desenvolvida em português de Portugal e incluir as seguintes funcionalidades:

1. GESTÃO DE TAREFAS:
   - Interface para criar, editar e excluir tarefas académicas
   - Sistema de categorização (Pesquisa, Escrita, Revisão, Administrativa)
   - Priorização e acompanhamento de progresso
   - Filtragem e ordenação de tarefas

2. GESTÃO DE PROJETOS:
   - Criação e gestão de projetos de pesquisa
   - Atribuição de membros da equipa
   - Acompanhamento de prazos e progresso
   - Integração com propostas geradas por IA

3. GESTÃO DE RECURSOS ACADÉMICOS:
   - Organização de artigos, livros e outros recursos
   - Categorização por área de pesquisa
   - Avaliação de relevância
   - Pesquisa e filtragem de recursos

4. ASSISTENTE DE IA (usando a API Gemini):
   - Pesquisa de artigos académicos relevantes
   - Geração de conteúdo académico (resumos, revisões de literatura, metodologias, conclusões)
   - Análise de texto (resumo, palavras-chave, sentimento, estrutura)
   - Suporte para diferentes modelos Gemini

5. REQUISITOS TÉCNICOS:
   - Frontend: React com Tailwind CSS
   - Armazenamento: LocalStorage para persistência de dados
   - API: Integração com Gemini API para funcionalidades de IA
   - Exportação: Suporte para formatos DOCX, PDF e CSV
   - Configurações: Chave API Gemini, seleção de modelo, idioma, tema

6. CARACTERÍSTICAS DA INTERFACE:
   - Design responsivo
   - Navegação por abas
   - Tema claro/escuro
   - Interface em português de Portugal
   - Formulários intuitivos para todas as funcionalidades

Implemente a aplicação como uma SPA (Single Page Application) que possa ser executada localmente através de um servidor HTTP simples. Utilize CDNs para as dependências externas (React, Tailwind, etc.) para facilitar a execução sem necessidade de ferramentas de build.
```

Este prompt fornece diretrizes detalhadas para criar uma aplicação semelhante, incluindo todas as funcionalidades principais, requisitos técnicos e características da interface.

## Contribuições

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do repositório
2. Crie uma branch para a sua funcionalidade (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - consulte o ficheiro LICENSE para obter detalhes.

## Contacto

Para questões ou suporte, contacte [seu-email@exemplo.com].
