using System;

namespace ITIncidentCopilot.Api.Application.Services
{
    public class PriorityScoreResult
    {
        public double Score { get; set; }
        public string SeverityBadge { get; set; } = "MEDIUM"; // CRITICAL, HIGH, MEDIUM, LOW
        public int BusinessImpactScore { get; set; }
        public int UsersAffectedScore { get; set; }
        public int ServiceCriticalityScore { get; set; }
        public int TechnicalSeverityScore { get; set; }
    }

    public interface IPriorityCalculationEngine
    {
        PriorityScoreResult CalculatePriorityScore(int businessImpact, int affectedUsersCount, int serviceCriticality, string severity);
    }

    public class PriorityCalculationEngine : IPriorityCalculationEngine
    {
        public PriorityScoreResult CalculatePriorityScore(int businessImpact, int affectedUsersCount, int serviceCriticality, string severity)
        {
            // 1. Business Impact Score (1 to 4)
            int impactScore = Math.Clamp(businessImpact, 1, 4);

            // 2. Affected Users Scale Score (1 to 4)
            int usersScore = affectedUsersCount switch
            {
                <= 5 => 1,
                <= 50 => 2,
                <= 500 => 3,
                _ => 4
            };

            // 3. Service Criticality Score (1 to 4)
            int criticalityScore = Math.Clamp(serviceCriticality, 1, 4);

            // 4. Technical Severity Score (1 to 4)
            int severityScore = severity.ToUpperInvariant() switch
            {
                "CRITICAL" => 4,
                "HIGH" => 3,
                "MEDIUM" => 2,
                _ => 1
            };

            // Composite Score Formula: Impact 30%, Users 25%, Criticality 25%, Severity 20%
            double compositeScore = (impactScore * 0.30) + (usersScore * 0.25) + (criticalityScore * 0.25) + (severityScore * 0.20);
            compositeScore = Math.Round(compositeScore, 2);

            string badge = compositeScore switch
            {
                >= 3.5 => "CRITICAL",
                >= 2.5 => "HIGH",
                >= 1.8 => "MEDIUM",
                _ => "LOW"
            };

            return new PriorityScoreResult
            {
                Score = compositeScore,
                SeverityBadge = badge,
                BusinessImpactScore = impactScore,
                UsersAffectedScore = usersScore,
                ServiceCriticalityScore = criticalityScore,
                TechnicalSeverityScore = severityScore
            };
        }
    }
}
