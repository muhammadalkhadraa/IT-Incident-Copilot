using System;
using Pgvector;

namespace ITIncidentCopilot.Api.Entities
{
    public class KBArticle
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string ArticleCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string TagsJson { get; set; } = "[]";
        public string Content { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        // PostgreSQL pgvector 1536-dimensional embedding property
        public Vector? Embedding { get; set; }
    }
}
