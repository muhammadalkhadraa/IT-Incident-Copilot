using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ITIncidentCopilot.Api.Entities;
using Pgvector;

namespace ITIncidentCopilot.Api.Application.Services
{
    public class IngestedChunkDto
    {
        public Guid ChunkId { get; set; }
        public string SourceDocument { get; set; } = string.Empty;
        public int PageNumber { get; set; }
        public string ChunkText { get; set; } = string.Empty;
        public double SimilarityScore { get; set; }
        public string FormattedCitation => $"Source: {SourceDocument} (Page {PageNumber})";
    }

    public interface IRagKnowledgeService
    {
        Task<List<KnowledgeChunk>> ProcessAndChunkDocumentAsync(string filename, string fileType, string fullText, string category, string author);
        List<IngestedChunkDto> VectorSearchRelevantChunks(string query, int topK = 3);
    }

    public class RagKnowledgeService : IRagKnowledgeService
    {
        public Task<List<KnowledgeChunk>> ProcessAndChunkDocumentAsync(string filename, string fileType, string fullText, string category, string author)
        {
            var chunks = new List<KnowledgeChunk>();
            const fontChunkSize = 500;
            int pageCounter = 1;

            for (int i = 0; i < fullText.Length; i += fontChunkSize)
            {
                int length = Math.Min(fontChunkSize, fullText.Length - i);
                string textSegment = fullText.Substring(i, length);

                // Generate 1536-dimensional mock float embedding array
                float[] dummyEmbedding = new float[1536];
                Array.Fill(dummyEmbedding, 0.025f);

                chunks.Add(new KnowledgeChunk
                {
                    Id = Guid.NewGuid(),
                    ChunkText = textSegment,
                    Embedding = new Vector(dummyEmbedding)
                });

                if (i % 2000 == 0 && i > 0) pageCounter++;
            }

            return Task.FromResult(chunks);
        }

        public List<IngestedChunkDto> VectorSearchRelevantChunks(string query, int topK = 3)
        {
            // Simulate pgvector cosine distance retrieval with verified source attribution
            return new List<IngestedChunkDto>
            {
                new IngestedChunkDto
                {
                    ChunkId = Guid.NewGuid(),
                    SourceDocument = "KB-88392 Print Spooler Memory Leak SOP",
                    PageNumber = 12,
                    ChunkText = "Symptom: spoolsv.exe consumes increasing RAM until system responsiveness degrades. Resolution: Restart Spooler service & purge C:\\Windows\\System32\\spool\\PRINTERS queue.",
                    SimilarityScore = 0.94
                },
                new IngestedChunkDto
                {
                    ChunkId = Guid.NewGuid(),
                    SourceDocument = "VPN & Network Firewall Operations Guide",
                    PageNumber = 4,
                    ChunkText = "Verify IPsec tunnel status using Get-VpnConnection. If status is Disconnected, re-authenticate Kerberos ticket.",
                    SimilarityScore = 0.88
                }
            };
        }
    }
}
