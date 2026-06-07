const assert = require("assert");
const { judgeSubmission, VERDICTS } = require("../src/services/judgeService");

const baseProblem = {
  title: "Add Two Numbers",
  executionMode: "FUNCTION",
  functionName: "solution",
  timeLimitMs: 2000,
  memoryLimitMb: 128,
  testCases: [
    { input: "[2,3]", output: "5", isHidden: false },
    { input: "[10,20]", output: "30", isHidden: true }
  ]
};

const run = async () => {
  const accepted = await judgeSubmission({
    problem: baseProblem,
    submission: {
      sourceCode: "function solution(a, b) { return a + b; }",
      language: "javascript"
    }
  });

  assert.strictEqual(accepted.verdict, VERDICTS.ACCEPTED);
  assert.strictEqual(accepted.passedTestCases, 2);
  assert.strictEqual(accepted.totalTestCases, 2);

  const wrongAnswer = await judgeSubmission({
    problem: baseProblem,
    submission: {
      sourceCode: "function solution(a, b) { return a - b; }",
      language: "javascript"
    }
  });

  assert.strictEqual(wrongAnswer.verdict, VERDICTS.WRONG_ANSWER);
  assert.strictEqual(wrongAnswer.passedTestCases, 0);
  assert.deepStrictEqual(wrongAnswer.failedTestCase, {
    input: "[2,3]",
    expectedOutput: "5",
    actualOutput: "-1"
  });

  console.log("All tests passed.");
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
