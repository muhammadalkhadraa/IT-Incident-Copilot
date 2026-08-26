# 🗄️ IT Incident Copilot — Database Schema, ERD & Indexing Strategy

## 1. Database Architecture & Vector Extension

- **Database Engine**: PostgreSQL 16
- **ORM**: Entity Framework Core 9
- **Vector Search Plugin**: `pgvector` (1536-dimensional vector embedding column type)

```
modelBuilder.HasPostgresExtension("vector");
modelBuilder.Entity<KnowledgeChunk>().Property(e => e.Embedding).HasColumnType("vector(1536)");
```

---

## 2. Complete 17-Table Entity Breakdown

1. **`Departments`**: `Id`, `Name`, `Code`
2. **`Roles`**: `Id`, `RoleName`, `PermissionsJson`
3. **`Users`**: `Id`, `DepartmentId`, `RoleId`, `Name`, `Email`, `PasswordHash`, `RefreshToken`
4. **`Devices`**: `Id`, `Hostname`, `IpAddress`, `OS`, `AgentVersion`, `CpuUsagePct`, `RamUsagePct`, `DiskUsagePct`, `Status`
5. **`Incidents`**: `Id`, `TicketNumber`, `Title`, `Description`, `Severity`, `Status`, `Category`, `ReporterId`, `AssignedTechnicianId`, `DeviceId`, `CreatedAt`, `SlaDueDate`
6. **`IncidentEvents`**: `Id`, `IncidentId`, `Timestamp`, `EventType`, `Details`
7. **`Comments`**: `Id`, `IncidentId`, `AuthorId`, `Content`, `IsInternalNote`, `Timestamp`
8. **`Attachments`**: `Id`, `IncidentId`, `Filename`, `Filesize`, `Url`, `UploadedBy`
9. **`DiagnosticRuns`**: `Id`, `IncidentId`, `ExecutedAt`, `TriggerType`, `OverallStatus`
10. **`DiagnosticResults`**: `Id`, `DiagnosticRunId`, `RuleCode`, `RuleName`, `Status`, `Evidence`, `LatencyMs`
11. **`Diagnoses`**: `Id`, `IncidentId`, `PrimaryHypothesis`, `ConfidenceScore`, `Summary`
12. **`Recommendations`**: `Id`, `DiagnosisId`, `ActionTitle`, `ActionCode`, `RiskLevel`, `RequiresApproval`
13. **`KnowledgeDocuments`**: `Id`, `DocumentCode`, `Title`, `Category`, `Author`
14. **`KnowledgeChunks`**: `Id`, `DocumentId`, `ChunkText`, `Embedding` [vector 1536d]
15. **`SimilarIncidents`**: `Id`, `SourceIncidentId`, `MatchedIncidentId`, `SimilarityScore`, `ResolutionSummary`
16. **`AutomationRules`**: `Id`, `Name`, `TriggerEvent`, `ActionType`, `IsEnabled`, `ConfigJson`
17. **`AuditLogs`**: `Id`, `IncidentId`, `Actor`, `ActorType`, `ActionType`, `Details`, `Timestamp`

---

## 3. High-Performance Indexing Strategy

To eliminate table scans and prevent N+1 queries, explicit composite indexes are applied on high-frequency query fields:

```csharp
// AppDbContext.cs Fluent Indexing
modelBuilder.Entity<User>().HasIndex(e => e.Email).IsUnique();

modelBuilder.Entity<Incident>(entity =>
{
    entity.HasIndex(e => e.TicketNumber).IsUnique();
    entity.HasIndex(e => e.Severity);
    entity.HasIndex(e => e.Status);
    entity.HasIndex(e => e.CreatedAt);
    entity.HasIndex(e => e.AssignedTechnicianId);
    entity.HasIndex(e => e.Category);
});
```
