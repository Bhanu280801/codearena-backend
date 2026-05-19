const { executeCode, normalizeLanguage } = require("../utils/codeExecuter");

const DEFAULT_TIME_LIMIT_MS = 2000;
const DEFAULT_MEMORY_LIMIT_MB = 128;

const EXECUTION_MODES = {
  STDIN: "STDIN",
  FUNCTION: "FUNCTION"
};

const VERDICTS = {
  ACCEPTED: "accepted",
  WRONG_ANSWER: "wrong answer",
  RUNTIME_ERROR: "runtime error",
  TIME_LIMIT_EXCEEDED: "time limit exceeded",
  COMPILATION_ERROR: "compilation error"
};

const normalizeOutput = (value = "") => {
  return String(value)
    .replace(/\r\n/g, "\n")
    .trim();
};

const formatRuntime = (runtimeMs) => {
  return `${(runtimeMs / 1000).toFixed(3)}s`;
};

const parseFunctionArgs = (input) => {
  const parsed = typeof input === "string" ? JSON.parse(input) : input;
  return Array.isArray(parsed) ? parsed : [parsed];
};

const buildFunctionHarness = ({ sourceCode, language, functionName, input }) => {
  const normalizedLanguage = normalizeLanguage(language);
  const args = parseFunctionArgs(input);

  if (!functionName) {
    throw new Error("functionName is required for FUNCTION execution mode");
  }

  if (normalizedLanguage === "javascript") {
    return `
${sourceCode}

const __args = ${JSON.stringify(args)};
const __result = ${functionName}(...__args);
console.log(JSON.stringify(__result));
`;
  }

  if (normalizedLanguage === "python") {
    return `
import json

${sourceCode}

__args = json.loads(${JSON.stringify(JSON.stringify(args))})
__result = ${functionName}(*__args)
print(json.dumps(__result, separators=(",", ":")))
`;
  }

  throw new Error(`FUNCTION execution is not supported for '${language}' yet`);
};

const buildExecutableSource = ({ problem, sourceCode, language, testCase }) => {
  const executionMode = problem.executionMode || EXECUTION_MODES.STDIN;

  if (executionMode === EXECUTION_MODES.STDIN) {
    return {
      sourceCode,
      input: testCase.input || ""
    };
  }

  if (executionMode === EXECUTION_MODES.FUNCTION) {
    return {
      sourceCode: buildFunctionHarness({
        sourceCode,
        language,
        functionName: problem.functionName,
        input: testCase.input || "[]"
      }),
      input: ""
    };
  }

  throw new Error(`Unknown execution mode '${executionMode}'`);
};

const getVerdictFromExecutionError = (error) => {
  if (error.type === "time_limit_exceeded") {
    return VERDICTS.TIME_LIMIT_EXCEEDED;
  }

  if (/compile|syntax|javac|g\+\+/i.test(error.message || "")) {
    return VERDICTS.COMPILATION_ERROR;
  }

  return VERDICTS.RUNTIME_ERROR;
};

const judgeSubmission = async ({ submission, problem }) => {
  const testCases = problem.testCases;

  if (!Array.isArray(testCases) || testCases.length === 0) {
    throw new Error("Problem must contain at least one test case");
  }

  let maxRuntimeMs = 0;

  for (let index = 0; index < testCases.length; index += 1) {
    const testCase = testCases[index];

    try {
      const executable = buildExecutableSource({
        problem,
        sourceCode: submission.sourceCode,
        language: submission.language,
        testCase
      });

      const result = await executeCode({
        sourceCode: executable.sourceCode,
        language: submission.language,
        input: executable.input,
        timeoutMs: problem.timeLimitMs || DEFAULT_TIME_LIMIT_MS,
        memoryLimitMb: problem.memoryLimitMb || DEFAULT_MEMORY_LIMIT_MB
      });

      maxRuntimeMs = Math.max(maxRuntimeMs, result.runtimeMs);

      const actualOutput = normalizeOutput(result.stdout);
      const expectedOutput = normalizeOutput(testCase.output);

      if (actualOutput !== expectedOutput) {
        return {
          verdict: VERDICTS.WRONG_ANSWER,
          passedTestCases: index,
          totalTestCases: testCases.length,
          runtime: formatRuntime(maxRuntimeMs),
          failedTestCase: testCase.isHidden
            ? null
            : {
                input: testCase.input || "",
                expectedOutput,
                actualOutput
              }
        };
      }
    } catch (error) {
      maxRuntimeMs = Math.max(maxRuntimeMs, error.runtimeMs || 0);

      return {
        verdict: getVerdictFromExecutionError(error),
        passedTestCases: index,
        totalTestCases: testCases.length,
        runtime: formatRuntime(maxRuntimeMs),
        error: testCase.isHidden ? undefined : error.message
      };
    }
  }

  return {
    verdict: VERDICTS.ACCEPTED,
    passedTestCases: testCases.length,
    totalTestCases: testCases.length,
    runtime: formatRuntime(maxRuntimeMs)
  };
};

module.exports = {
  EXECUTION_MODES,
  VERDICTS,
  judgeSubmission
};
