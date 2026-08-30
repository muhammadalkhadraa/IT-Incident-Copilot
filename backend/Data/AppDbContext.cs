using Microsoft.EntityFrameworkCore;
using ITIncidentCopilot.Api.Entities;

namespace ITIncidentCopilot.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Department> Departments => Set<Department>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Device> Devices => Set<Device>();
        public DbSet<Incident> Incidents => Set<Incident>();
        public DbSet<IncidentEvent> IncidentEvents => Set<IncidentEvent>();
        public DbSet<IncidentCommentRecord> Comments => Set<IncidentCommentRecord>();
        public DbSet<IncidentAttachment> Attachments => Set<IncidentAttachment>();
        public DbSet<DiagnosticRun> DiagnosticRuns => Set<DiagnosticRun>();
        public DbSet<DiagnosticResult> DiagnosticResults => Set<DiagnosticResult>();
        public DbSet<Diagnosis> Diagnoses => Set<Diagnosis>();
        public DbSet<Recommendation> Recommendations => Set<Recommendation>();
        public DbSet<KnowledgeDocument> KnowledgeDocuments => Set<KnowledgeDocument>();
        public DbSet<KnowledgeChunk> KnowledgeChunks => Set<KnowledgeChunk>();
        public DbSet<SimilarIncidentRecord> SimilarIncidents => Set<SimilarIncidentRecord>();
        public DbSet<AutomationRule> AutomationRules => Set<AutomationRule>();
        public DbSet<AutomationExecution> AutomationExecutions => Set<AutomationExecution>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<AuditLogRecord> AuditLogs => Set<AuditLogRecord>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // KnowledgeChunk Vector Embedding configuration (1536 dimensions)
            modelBuilder.Entity<KnowledgeChunk>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Ignore(e => e.Embedding);
                entity.HasOne(e => e.Document)
                      .WithMany(d => d.Chunks)
                      .HasForeignKey(e => e.DocumentId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // User & RBAC Relationships
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Incident Mappings & Indexes
            modelBuilder.Entity<Incident>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TicketNumber).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.TicketNumber).IsUnique();
                entity.HasIndex(e => e.Severity);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Diagnostic Run & Results 1:N Relationship
            modelBuilder.Entity<DiagnosticResult>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(r => r.DiagnosticRun)
                      .WithMany(run => run.Results)
                      .HasForeignKey(r => r.DiagnosticRunId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Diagnosis & Recommendation 1:N Relationship
            modelBuilder.Entity<Recommendation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(r => r.Diagnosis)
                      .WithMany(d => d.Recommendations)
                      .HasForeignKey(r => r.DiagnosisId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Similar Incidents Foreign Keys
            modelBuilder.Entity<SimilarIncidentRecord>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(s => s.SourceIncident)
                      .WithMany()
                      .HasForeignKey(s => s.SourceIncidentId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.MatchedIncident)
                      .WithMany()
                      .HasForeignKey(s => s.MatchedIncidentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
