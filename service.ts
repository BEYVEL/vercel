import { DocumentProcessor } from './document-processor';

export interface RAGResponse {
  context: string;
  sources: string[];
  articles: Array<{
    number: string;
    title: string;
    relevantPart: string;
  }>;
}

export class RAGService {
  private processor: DocumentProcessor;
  private initialized = false;
  
  constructor(filePath: string) {
    this.processor = new DocumentProcessor(filePath);
  }
  
  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.processor.loadDocument();
      this.initialized = true;
    }
  }
  
  async query(question: string): Promise<RAGResponse> {
    await this.initialize();
    
    const relevantArticles = this.processor.searchByQuery(question);
    
    if (relevantArticles.length === 0) {
      return {
        context: '',
        sources: [],
        articles: []
      };
    }
    
    const articles = relevantArticles.map(article => ({
      number: article.number,
      title: article.title,
      relevantPart: this.processor.extractRelevantPart(article, question)
    }));
    
    const context = articles.map(a => 
      `Статья ${a.number}: ${a.title}\n${a.relevantPart}`
    ).join('\n\n');
    
    return {
      context,
      sources: articles.map(a => `Статья ${a.number}`),
      articles
    };
  }
}

export const ragService = new RAGService('filerag.txt');
