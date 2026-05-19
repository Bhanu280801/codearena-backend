const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { randomUUID } = require("crypto");

const TEMP_DIR = path.join(__dirname, "../../temp");
const DEFAULT_TIMEOUT_MS = 2000;
const DEFAULT_MEMORY_MB = 128;

const LANGUAGE_CONFIG = {
  javascript: {
    fileName: "main.js",
    localCommand: (filePath) => ({ command: "node", args: [filePath] }),
    dockerImage: process.env.JS_DOCKER_IMAGE || "node:22-alpine",
    dockerCommand: "node /workspace/main.js"
  },
  python: {
    fileName: "main.py",
    localCommand: (filePath) => ({ command: "python", args: [filePath] }),
    dockerImage: process.env.PYTHON_DOCKER_IMAGE || "python:3.12-alpine",
    dockerCommand: "python /workspace/main.py"
  },
  cpp: {
    fileName: "main.cpp",
    localCommand: () => ({
      command: process.platform === "win32" ? "cmd" : "sh",
      args:
        process.platform === "win32"
          ? ["/d", "/s", "/c", "g++ main.cpp -O2 -std=c++17 -o main.exe && main.exe"]
          : ["-lc", "g++ main.cpp -O2 -std=c++17 -o main && ./main"]
    }),
    dockerImage: process.env.CPP_DOCKER_IMAGE || "gcc:14",
    dockerCommand: "g++ /workspace/main.cpp -O2 -std=c++17 -o /workspace/main && /workspace/main"
  },
  java: {
    fileName: "Main.java",
    localCommand: () => ({
      command: process.platform === "win32" ? "cmd" : "sh",
      args:
        process.platform === "win32"
          ? ["/d", "/s", "/c", "javac Main.java && java Main"]
          : ["-lc", "javac Main.java && java Main"]
    }),
    dockerImage: process.env.JAVA_DOCKER_IMAGE || "eclipse-temurin:21",
    dockerCommand: "javac /workspace/Main.java && java -cp /workspace Main"
  }
};

const normalizeLanguage = (language) => {
  const value = String(language || "").toLowerCase();

  if (["js", "node", "nodejs"].includes(value)) return "javascript";
  if (["py", "python3"].includes(value)) return "python";
  if (["c++", "cpp17", "g++"].includes(value)) return "cpp";

  return value;
};

const ensureTempDir = () => {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
};

const removeDir = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

const runProcess = ({ command, args, input, timeoutMs, workDir }) => {
  return new Promise((resolve, reject) => {
    const startedAt = process.hrtime.bigint();
    let stdout = "";
    let stderr = "";
    let isTimedOut = false;

    const child = spawn(command, args, {
      cwd: workDir,
      stdio: ["pipe", "pipe", "pipe"]
    });

    const timer = setTimeout(() => {
      isTimedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      reject({
        type: "runtime_error",
        message: error.message
      });
    });

    child.on("close", (exitCode) => {
      clearTimeout(timer);

      const endedAt = process.hrtime.bigint();
      const runtimeMs = Number(endedAt - startedAt) / 1_000_000;

      if (isTimedOut) {
        return reject({
          type: "time_limit_exceeded",
          message: "Execution timed out",
          runtimeMs
        });
      }

      if (exitCode !== 0) {
        return reject({
          type: "runtime_error",
          message: stderr.trim() || `Process exited with code ${exitCode}`,
          runtimeMs
        });
      }

      resolve({
        stdout,
        stderr,
        runtimeMs
      });
    });

    child.stdin.write(input || "");
    child.stdin.end();
  });
};

const buildDockerCommand = ({ config, workDir, timeoutMs, memoryLimitMb }) => {
  return {
    command: "docker",
    args: [
      "run",
      "--rm",
      "--network",
      "none",
      "--cpus",
      "1",
      "--memory",
      `${memoryLimitMb}m`,
      "--pids-limit",
      "128",
      "-v",
      `${workDir}:/workspace`,
      "-w",
      "/workspace",
      config.dockerImage,
      "sh",
      "-lc",
      config.dockerCommand
    ],
    timeoutMs
  };
};

const executeCode = async ({
  sourceCode,
  language,
  input = "",
  timeoutMs = DEFAULT_TIMEOUT_MS,
  memoryLimitMb = DEFAULT_MEMORY_MB,
  useDocker = process.env.USE_DOCKER_SANDBOX === "true"
}) => {
  ensureTempDir();

  const normalizedLanguage = normalizeLanguage(language);
  const config = LANGUAGE_CONFIG[normalizedLanguage];

  if (!config) {
    throw new Error(`Language '${language}' is not supported`);
  }

  const workDir = path.join(TEMP_DIR, `run_${Date.now()}_${randomUUID()}`);
  fs.mkdirSync(workDir, { recursive: true });

  try {
    const filePath = path.join(workDir, config.fileName);
    fs.writeFileSync(filePath, sourceCode);

    const commandConfig = useDocker
      ? buildDockerCommand({ config, workDir, timeoutMs, memoryLimitMb })
      : config.localCommand(filePath, workDir);

    return await runProcess({
      command: commandConfig.command,
      args: commandConfig.args,
      input,
      timeoutMs: commandConfig.timeoutMs || timeoutMs,
      workDir
    });
  } finally {
    removeDir(workDir);
  }
};

const executeJavaScript = ({ sourceCode, input = "", timeoutMs = DEFAULT_TIMEOUT_MS }) => {
  return executeCode({
    sourceCode,
    language: "javascript",
    input,
    timeoutMs
  });
};

module.exports = {
  executeCode,
  executeJavaScript,
  normalizeLanguage
};
