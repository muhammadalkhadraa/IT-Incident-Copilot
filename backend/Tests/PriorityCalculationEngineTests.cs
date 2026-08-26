using System;
using System.Diagnostics;
using ITIncidentCopilot.Api.Application.Services;

namespace ITIncidentCopilot.Api.Tests
{
    public class PriorityCalculationEngineTests
    {
        private readonly PriorityCalculationEngine _engine = new();

        public void RunAllTests()
        {
            TestCalculatePriorityScore_HighImpactAndUsers_ReturnsCritical();
            TestCalculatePriorityScore_LowImpactAndSingleUser_ReturnsLow();
        }

        public void TestCalculatePriorityScore_HighImpactAndUsers_ReturnsCritical()
        {
            var result = _engine.CalculatePriorityScore(4, 600, 4, "CRITICAL");
            Debug.Assert(result.Score == 4.0, "Score should be 4.0");
            Debug.Assert(result.SeverityBadge == "CRITICAL", "Badge should be CRITICAL");
        }

        public void TestCalculatePriorityScore_LowImpactAndSingleUser_ReturnsLow()
        {
            var result = _engine.CalculatePriorityScore(1, 2, 1, "LOW");
            Debug.Assert(result.Score == 1.0, "Score should be 1.0");
            Debug.Assert(result.SeverityBadge == "LOW", "Badge should be LOW");
        }
    }
}
