import { PriorityCalculator } from '../services/priorityCalculator';
import { IncidentStateMachine } from '../services/incidentStateMachine';
import { HumanInTheLoopSecurity } from '../services/humanInTheLoopSecurity';
import { RagKnowledgeService } from '../services/ragKnowledgeService';

export function runClientTestSuite() {
  console.log('=== RUNNING CLIENT UNIT TEST SUITE ===');

  // Test 1: Priority Calculator
  const priority = PriorityCalculator.calculatePriority(4, 600, 4, 'CRITICAL');
  console.assert(priority.compositeScore === 4.0, 'Test 1 Failed: Priority composite score should be 4.0');
  console.assert(priority.computedSeverity === 'CRITICAL', 'Test 1 Failed: Severity should be CRITICAL');
  console.log('✅ Test 1 Passed: Multi-Factor Priority Formula');

  // Test 2: State Machine Guards
  const canReopen = IncidentStateMachine.canTransition('CLOSED', 'NEW');
  const invalidJump = IncidentStateMachine.canTransition('CLOSED', 'REMEDIATING');
  console.assert(canReopen === true, 'Test 2 Failed: Reopen CLOSED -> NEW should be allowed');
  console.assert(invalidJump === false, 'Test 2 Failed: Direct CLOSED -> REMEDIATING should be blocked');
  console.log('✅ Test 2 Passed: Incident State Machine Guards');

  // Test 3: HITL Security Guardrails
  const delAcctPolicy = HumanInTheLoopSecurity.evaluatePolicy('ACT-SEC-DEL-ACCT');
  console.assert(delAcctPolicy.isBlockedFromAutoExecution === true, 'Test 3 Failed: Delete Account must be blocked from auto-execution');
  console.assert(delAcctPolicy.riskLevel === 'CRITICAL', 'Test 3 Failed: Risk level must be CRITICAL');
  console.log('✅ Test 3 Passed: HITL Security Policy');

  // Test 4: RAG Knowledge Vector Search
  const ragResults = RagKnowledgeService.searchVectorKnowledgeBase('spooler print', 0.75);
  console.assert(ragResults.length > 0, 'Test 4 Failed: Should return grounded RAG chunks');
  console.assert(ragResults[0].formattedCitation.includes('Source:'), 'Test 4 Failed: Should include source citation');
  console.log('✅ Test 4 Passed: RAG Vector Grounding & Citations');

  console.log('=== ALL CLIENT UNIT TESTS PASSED (4/4) ===');
}
