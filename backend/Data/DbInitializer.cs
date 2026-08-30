using System;
using System.Linq;
using System.Threading.Tasks;
using ITIncidentCopilot.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ITIncidentCopilot.Api.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            try
            {
                await context.Database.ExecuteSqlRawAsync("ALTER TABLE \"Incidents\" ADD COLUMN IF NOT EXISTS \"MacAddress\" text DEFAULT '';");
                await context.Database.ExecuteSqlRawAsync("ALTER TABLE \"Incidents\" ADD COLUMN IF NOT EXISTS \"IpAddress\" text DEFAULT '';");
            }
            catch { }

            // Migrate any existing legacy unhashed passwords to valid BCrypt hashes
            var existingUsers = await context.Users.ToListAsync();
            foreach (var u in existingUsers)
            {
                if (string.IsNullOrEmpty(u.PasswordHash) || !u.PasswordHash.StartsWith("$2"))
                {
                    u.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");
                }
            }
            if (context.ChangeTracker.HasChanges())
            {
                await context.SaveChangesAsync();
            }

            if (await context.Incidents.AnyAsync())
            {
                return; // DB has already been seeded
            }

            // 1. Seed Roles & Departments
            var deptIT = new Department { Id = Guid.NewGuid(), Name = "IT Infrastructure & Ops", Code = "IT-OPS" };
            var deptExec = new Department { Id = Guid.NewGuid(), Name = "Executive Suite", Code = "EXEC" };
            context.Departments.AddRange(deptIT, deptExec);

            var roleAdmin = new Role { Id = Guid.NewGuid(), RoleName = "ADMINISTRATOR", PermissionsJson = "[\"*\"]" };
            var roleTech = new Role { Id = Guid.NewGuid(), RoleName = "TECHNICIAN", PermissionsJson = "[\"read\", \"write\", \"execute\"]" };
            var roleEmp = new Role { Id = Guid.NewGuid(), RoleName = "EMPLOYEE", PermissionsJson = "[\"read\"]" };
            context.Roles.AddRange(roleAdmin, roleTech, roleEmp);

            // 2. Seed Demo Users
            var user1 = new User { Id = Guid.NewGuid(), Name = "Alex Thorne", Email = "alex.thorne@corp.internal", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), Role = "TECHNICIAN", Department = "IT Infrastructure & Ops", Title = "Senior Systems Engineer", Avatar = "AT" };
            var user2 = new User { Id = Guid.NewGuid(), Name = "Marcus Vance", Email = "marcus.vance@corp.internal", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), Role = "EMPLOYEE", Department = "Executive Suite", Title = "Chief Technology Officer", Avatar = "MV" };
            context.Users.AddRange(user1, user2);

            // 3. Seed Devices
            var dev1 = new Device
            {
                Id = Guid.NewGuid(),
                Hostname = "HOST-EXEC-PRT04.corp.internal",
                IpAddress = "10.140.12.88",
                OS = "Windows Server 2022 Enterprise",
                AgentVersion = "v4.8.2-enterprise",
                CpuUsagePct = 98.4,
                RamUsagePct = 97.2,
                DiskUsagePct = 67.0,
                Status = "CRITICAL"
            };
            var dev2 = new Device
            {
                Id = Guid.NewGuid(),
                Hostname = "DC01-AD-AUTH.corp.internal",
                IpAddress = "10.140.0.10",
                OS = "Windows Server 2022 Enterprise",
                AgentVersion = "v4.8.2-enterprise",
                CpuUsagePct = 22.1,
                RamUsagePct = 48.5,
                DiskUsagePct = 42.0,
                Status = "HEALTHY"
            };
            context.Devices.AddRange(dev1, dev2);

            // 4. Seed Incidents
            var inc1 = new Incident
            {
                Id = Guid.NewGuid(),
                TicketNumber = "INC-2026-8812",
                Title = "Executive Print Spooler Service Crashing & Memory Leak",
                Description = "HOST-EXEC-PRT04 spoolsv.exe process heap memory usage growing rapidly to 2.8 GB.",
                Severity = "CRITICAL",
                Status = "INVESTIGATING",
                Category = "Infrastructure / EndUser Services",
                Hostname = "HOST-EXEC-PRT04.corp.internal",
                Reporter = "Marcus Vance",
                AssignedTechnician = "Alex Thorne",
                CreatedAt = DateTime.UtcNow.AddHours(-2),
                UpdatedAt = DateTime.UtcNow,
                AiSummary = "High-confidence print spooler heap exhaustion hypothesis.",
                AiConfidenceScore = 94,
                PrimaryHypothesisTitle = "Print Spooler Heap Exhaustion & Buffer Leak"
            };
            var inc2 = new Incident
            {
                Id = Guid.NewGuid(),
                TicketNumber = "INC-2026-4410",
                Title = "Domain Controller Active Directory Kerberos Auth Timeout",
                Description = "DC01-AD-AUTH failing Kerberos ticket issuance for remote VPN users.",
                Severity = "HIGH",
                Status = "OPEN",
                Category = "Identity & Access / Active Directory",
                Hostname = "DC01-AD-AUTH.corp.internal",
                Reporter = "Elena Rostova",
                AssignedTechnician = "Alex Thorne",
                CreatedAt = DateTime.UtcNow.AddHours(-5),
                UpdatedAt = DateTime.UtcNow,
                AiSummary = "Kerberos ticket expiration or NTP clock drift.",
                AiConfidenceScore = 88,
                PrimaryHypothesisTitle = "Kerberos Ticket Invalidation"
            };
            context.Incidents.AddRange(inc1, inc2);

            // 5. Seed Knowledge Documents
            var kb1 = new KnowledgeDocument
            {
                Id = Guid.NewGuid(),
                DocumentCode = "KB-88392",
                Title = "Print Spooler Memory Leak SOP & Service Recycling Protocol",
                Category = "Infrastructure / Printing",
                Author = "Alex Thorne",
                LastUpdated = DateTime.UtcNow.AddDays(-30)
            };
            context.KnowledgeDocuments.Add(kb1);

            // 6. Seed Automation Rules
            var rule1 = new AutomationRule
            {
                Id = Guid.NewGuid(),
                Name = "Critical P1 PagerDuty & SMS Alert",
                TriggerEvent = "CRITICAL_P1_ALERT",
                ActionType = "N8N_WEBHOOK",
                IsEnabled = true,
                ConfigJson = "{\"webhookUrl\":\"http://localhost:5678/webhook/p1-critical-alert\"}"
            };
            context.AutomationRules.Add(rule1);

            await context.SaveChangesAsync();
        }
    }
}
