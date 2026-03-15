import fs from 'fs';
import path from 'path';

export interface Article {
  number: string;
  title: string;
  content: string;
  fullText: string;
}

export class DocumentProcessor {
  private articles: Map<string, Article> = new Map();
  
  constructor(private filePath: string) {}
  
  async loadDocument(): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), 'public', this.filePath);
      const text = fs.readFileSync(fullPath, 'utf-8');
      this.parseArticles(text);
      console.log(`✅ Loaded ${this.articles.size} articles`);
    } catch (error) {
      console.error('Error loading document:', error);
    }
  }
  
  private parseArticles(text: string): void {
    const lines = text.split('\n');
    let currentArticle: Partial<Article> = {};
    let currentContent: string[] = [];
    
    for (const line of lines) {
      const articleMatch = line.match(/^(\d+)\.\s+(.+)$/);
      
      if (articleMatch) {
        if (currentArticle.number && currentContent.length > 0) {
          this.articles.set(currentArticle.number, {
            number: currentArticle.number,
            title: currentArticle.title || '',
            content: currentContent.join('\n').trim(),
            fullText: currentContent.join('\n').trim()
          });
        }
        currentArticle = {
          number: articleMatch[1],
          title: articleMatch[2]
        };
        currentContent = [line];
      } else if (currentArticle.number) {
        currentContent.push(line);
      }
    }
    
    if (currentArticle.number && currentContent.length > 0) {
      this.articles.set(currentArticle.number, {
        number: currentArticle.number,
        title: currentArticle.title || '',
        content: currentContent.join('\n').trim(),
        fullText: currentContent.join('\n').trim()
      });
    }
  }
  
  searchByQuery(query: string): Article[] {
    const queryLower = query.toLowerCase();
    const results: Article[] = [];
    
    // Priority for specific questions
    if (queryLower.includes('закон') || queryLower.includes('правов') || 
        queryLower.includes('федеральн') || queryLower.includes('конституц')) {
      const article2 = this.articles.get('2');
      if (article2) results.push(article2);
    }
    
    if (queryLower.includes('что такое') || queryLower.includes('определение') || 
        queryLower.includes('понятие')) {
      const article5 = this.articles.get('5');
      if (article5) results.push(article5);
    }
    
    if (results.length === 0) {
      // Keyword search
      const keywords = queryLower.split(' ').filter(w => w.length > 3);
      for (const article of this.articles.values()) {
        const contentLower = article.content.toLowerCase();
        const matches = keywords.filter(k => contentLower.includes(k)).length;
        if (matches > 1) results.push(article);
      }
    }
    
    return results.slice(0, 2);
  }
  
  extractRelevantPart(article: Article, query: string): string {
    const queryLower = query.toLowerCase();
    const sentences = article.content.split(/[.!?]+/);
    
    // Special handling for Article 5 (AI definition)
    if (article.number === '5' && queryLower.includes('искусственный интеллект')) {
      const match = article.content.match(/а\)\s+искусственный интеллект[^.]+\.[^.]+\.[^.]+\.[^.]*/i);
      if (match) return match[0];
    }
    
    // Find relevant sentences
    const relevantSentences = sentences
      .filter(s => queryLower.split(' ').some(word => 
        word.length > 3 && s.toLowerCase().includes(word)
      ))
      .slice(0, 3);
    
    if (relevantSentences.length > 0) {
      return relevantSentences.join('. ') + '.';
    }
    
    return article.content.slice(0, 300) + '...';
  }
  
  getAllArticles(): Article[] {
    return Array.from(this.articles.values());
  }
}
