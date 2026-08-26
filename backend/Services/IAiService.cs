using System.Collections.Generic;
using System.Threading.Tasks;
using ITIncidentCopilot.Api.Entities;

namespace ITIncidentCopilot.Api.Services
{
    public class AiDiagnosisResultDto
    {
        public string Summary { get; set; } = string.Empty;
        public string CopilotNotes { get; set; } = string.Empty;
        public string PrimaryHypothesisTitle { get; set; } = string.Empty;
        public int ConfidenceScore { get; set; }
        public string RootCauseCategory { get; set; } = string.Empty;
        public List<string> ReasoningChain { get; set; } = new();
        public List<string> EvidenceFound { get; set; } = new();
        public string RecommendedFix { get; set; } = string.Empty;
    }

    /// <summary>
    /// Abstract AI Service interface isolating application business logic from specific AI providers 
    /// (e.g. OpenAI, Azure OpenAI, Ollama, Gemini).
    /// </summary>
    public interface IAiService
    {
        Task<AiDiagnosisResultDto> ClassifyAndDiagnoseAsync(Incident incident);
        Task<string> AnswerTechnicianQuestionAsync(Incident incident, string question);
        Task<float[]> GenerateEmbeddingVectorAsync(string text);
        Task<List<KBArticle>> MatchSimilarKnowledgeVectorAsync(Incident incident, IEnumerable<KBArticle> articles);
    }
}
