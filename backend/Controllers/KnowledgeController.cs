using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ITIncidentCopilot.Api.Data;
using ITIncidentCopilot.Api.Entities;
using ITIncidentCopilot.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pgvector.EntityFrameworkCore;

namespace ITIncidentCopilot.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class KnowledgeController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IAiService _aiService;

        public KnowledgeController(AppDbContext db, IAiService aiService)
        {
            _db = db;
            _aiService = aiService;
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<KBArticle>>> Search([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Ok(await _db.KBArticles.ToListAsync());
            }

            // Generate 1536d embedding vector via IAiService abstraction
            var queryEmbedding = await _aiService.GenerateEmbeddingVectorAsync(query);
            var vector = new Pgvector.Vector(queryEmbedding);

            // Execute PostgreSQL pgvector Cosine Distance similarity query via EF Core L2Distance / CosineDistance
            var results = await _db.KBArticles
                .OrderBy(a => a.Embedding!.CosineDistance(vector))
                .Take(5)
                .ToListAsync();

            return Ok(results);
        }
    }
}
