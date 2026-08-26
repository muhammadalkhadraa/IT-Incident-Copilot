import type { KBArticle, Incident } from '../types';
import { KNOWLEDGE_BASE_ARTICLES } from '../data/mockData';

export class RAGService {
  /**
   * Performs vector-like similarity search across Knowledge Base articles given a query string or incident context.
   */
  public static searchKnowledgeBase(query: string, articles: KBArticle[] = KNOWLEDGE_BASE_ARTICLES): KBArticle[] {
    if (!query.trim()) {
      return articles.map(a => ({ ...a, matchScore: 100 }));
    }

    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    return articles.map(article => {
      let score = 0;
      const textToSearch = `${article.title} ${article.category} ${article.tags.join(' ')} ${article.content}`.toLowerCase();

      queryTerms.forEach(term => {
        if (article.title.toLowerCase().includes(term)) score += 35;
        if (article.tags.some(t => t.toLowerCase().includes(term))) score += 25;
        if (textToSearch.includes(term)) score += 15;
      });

      // Normalize score between 10 and 99
      const matchScore = Math.min(99, Math.max(12, Math.round((score / (queryTerms.length * 35)) * 100)));

      return {
        ...article,
        matchScore,
      };
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  /**
   * Finds relevant KB articles specifically matched to an incident's telemetry, logs, and title.
   */
  public static getMatchedKBArticlesForIncident(incident: Incident): KBArticle[] {
    const combinedContext = `${incident.title} ${incident.description} ${incident.category} ${incident.deviceTelemetry.logs.map(l => l.message).join(' ')}`;
    return this.searchKnowledgeBase(combinedContext).filter(a => (a.matchScore || 0) > 40);
  }
}
