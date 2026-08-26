using ITIncidentCopilot.Api.Application.Services;
using Xunit;

namespace ITIncidentCopilot.Api.Tests
{
    public class PriorityCalculationEngineTests
    {
        private readonly PriorityCalculationEngine _engine = new();

        [Fact]
        public void CalculatePriorityScore_HighImpactAndUsers_ReturnsCritical()
        {
            // Act: Business Impact = 4 (Exec SLA), Users = 600 (>500), Criticality = 4, Severity = CRITICAL
            var result = _engine.CalculatePriorityScore(4, 600, 4, "CRITICAL");

            // Assert
            Assert.Equal(4.0, result.Score);
            Assert.Equal("CRITICAL", result.SeverityBadge);
        }

        [Fact]
        public void CalculatePriorityScore_LowImpactAndSingleUser_ReturnsLow()
        {
            // Act: Business Impact = 1, Users = 2, Criticality = 1, Severity = LOW
            var result = _engine.CalculatePriorityScore(1, 2, 1, "LOW");

            // Assert
            Assert.Equal(1.0, result.Score);
            Assert.Equal("LOW", result.SeverityBadge);
        }
    }
}
