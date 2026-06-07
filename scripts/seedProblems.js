const prisma = require("../src/config/db");

const problems = [
  {
    title: "Add Two Numbers",
    slug: "add-two-numbers",
    difficulty: "Easy",
    tags: ["math", "basics"],
    description: [
      "Given two numbers, return their sum.",
      "",
      "Write a function named `solution` that accepts two numbers.",
      "",
      "```js",
      "function solution(a, b) {",
      "  return a + b;",
      "}",
      "```"
    ].join("\n"),
    sampleInput: "[2,3]",
    sampleOutput: "5",
    testCases: [
      { input: "[2,3]", output: "5", isHidden: false },
      { input: "[10,15]", output: "25", isHidden: true },
      { input: "[-4,9]", output: "5", isHidden: true }
    ]
  },
  {
    title: "Maximum of Three",
    slug: "maximum-of-three",
    difficulty: "Easy",
    tags: ["math", "conditionals"],
    description: [
      "Given three numbers, return the largest number.",
      "",
      "Write a function named `solution` that accepts three numbers."
    ].join("\n"),
    sampleInput: "[3,8,5]",
    sampleOutput: "8",
    testCases: [
      { input: "[3,8,5]", output: "8", isHidden: false },
      { input: "[-1,-7,-3]", output: "-1", isHidden: true },
      { input: "[42,42,7]", output: "42", isHidden: true }
    ]
  },
  {
    title: "Factorial",
    slug: "factorial",
    difficulty: "Easy",
    tags: ["math", "loops"],
    description: [
      "Given a non-negative integer `n`, return `n!`.",
      "",
      "Write a function named `solution` that accepts one number."
    ].join("\n"),
    sampleInput: "[5]",
    sampleOutput: "120",
    testCases: [
      { input: "[5]", output: "120", isHidden: false },
      { input: "[0]", output: "1", isHidden: true },
      { input: "[7]", output: "5040", isHidden: true }
    ]
  },
  {
    title: "Nth Fibonacci",
    slug: "nth-fibonacci",
    difficulty: "Easy",
    tags: ["math", "dynamic-programming"],
    description: [
      "Given `n`, return the nth Fibonacci number.",
      "",
      "Use `F(0) = 0` and `F(1) = 1`."
    ].join("\n"),
    sampleInput: "[6]",
    sampleOutput: "8",
    testCases: [
      { input: "[6]", output: "8", isHidden: false },
      { input: "[0]", output: "0", isHidden: true },
      { input: "[10]", output: "55", isHidden: true }
    ]
  },
  {
    title: "Palindrome Number",
    slug: "palindrome-number",
    difficulty: "Easy",
    tags: ["strings", "math"],
    description: [
      "Given an integer, return `true` if it reads the same forwards and backwards.",
      "",
      "Negative numbers are not palindromes."
    ].join("\n"),
    sampleInput: "[121]",
    sampleOutput: "true",
    testCases: [
      { input: "[121]", output: "true", isHidden: false },
      { input: "[-121]", output: "false", isHidden: true },
      { input: "[10]", output: "false", isHidden: true }
    ]
  },
  {
    title: "Count Vowels",
    slug: "count-vowels",
    difficulty: "Easy",
    tags: ["strings"],
    description: [
      "Given a string, return the number of vowels in it.",
      "",
      "Count both uppercase and lowercase vowels."
    ].join("\n"),
    sampleInput: "[\"CodeArena\"]",
    sampleOutput: "5",
    testCases: [
      { input: "[\"CodeArena\"]", output: "5", isHidden: false },
      { input: "[\"xyz\"]", output: "0", isHidden: true },
      { input: "[\"Education\"]", output: "5", isHidden: true }
    ]
  },
  {
    title: "Reverse Array",
    slug: "reverse-array",
    difficulty: "Easy",
    tags: ["arrays"],
    description: [
      "Given an array, return a new array with the elements in reverse order.",
      "",
      "Do not print the result; return it."
    ].join("\n"),
    sampleInput: "[[1,2,3]]",
    sampleOutput: "[3,2,1]",
    testCases: [
      { input: "[[1,2,3]]", output: "[3,2,1]", isHidden: false },
      { input: "[[\"a\",\"b\",\"c\"]]", output: "[\"c\",\"b\",\"a\"]", isHidden: true },
      { input: "[[]]", output: "[]", isHidden: true }
    ]
  },
  {
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Medium",
    tags: ["arrays", "hash-map"],
    description: [
      "Given an array of numbers and a target, return the indices of two numbers that add up to the target.",
      "",
      "Return the first valid pair you find."
    ].join("\n"),
    sampleInput: "[[2,7,11,15],9]",
    sampleOutput: "[0,1]",
    testCases: [
      { input: "[[2,7,11,15],9]", output: "[0,1]", isHidden: false },
      { input: "[[3,2,4],6]", output: "[1,2]", isHidden: true },
      { input: "[[3,3],6]", output: "[0,1]", isHidden: true }
    ]
  },
  {
    title: "Remove Duplicates",
    slug: "remove-duplicates",
    difficulty: "Medium",
    tags: ["arrays", "sets"],
    description: [
      "Given an array, return a new array with duplicate values removed.",
      "",
      "Keep the first occurrence order."
    ].join("\n"),
    sampleInput: "[[1,2,2,3,1]]",
    sampleOutput: "[1,2,3]",
    testCases: [
      { input: "[[1,2,2,3,1]]", output: "[1,2,3]", isHidden: false },
      { input: "[[\"a\",\"b\",\"a\"]]", output: "[\"a\",\"b\"]", isHidden: true },
      { input: "[[]]", output: "[]", isHidden: true }
    ]
  },
  {
    title: "Fizz Buzz List",
    slug: "fizz-buzz-list",
    difficulty: "Medium",
    tags: ["loops", "strings"],
    description: [
      "Given `n`, return an array from `1` to `n` using FizzBuzz rules.",
      "",
      "Use `Fizz` for multiples of 3, `Buzz` for multiples of 5, and `FizzBuzz` for both."
    ].join("\n"),
    sampleInput: "[5]",
    sampleOutput: "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]",
    testCases: [
      { input: "[5]", output: "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]", isHidden: false },
      { input: "[3]", output: "[\"1\",\"2\",\"Fizz\"]", isHidden: true },
      { input: "[15]", output: "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\",\"Fizz\",\"7\",\"8\",\"Fizz\",\"Buzz\",\"11\",\"Fizz\",\"13\",\"14\",\"FizzBuzz\"]", isHidden: true }
    ]
  }
];

const main = async () => {
  await prisma.$transaction([
    prisma.submission.deleteMany({}),
    prisma.contestProblem.deleteMany({}),
    prisma.problem.deleteMany({})
  ]);

  for (const problem of problems) {
    await prisma.problem.create({
      data: {
        ...problem,
        executionMode: "FUNCTION",
        functionName: "solution",
        constraints: null,
        inputFormat: "Function arguments are provided from the sample input JSON.",
        outputFormat: "Return the answer from the solution function.",
        timeLimitMs: 2000,
        memoryLimitMb: 128,
        isPublished: true
      }
    });
  }

  console.log(`Seeded ${problems.length} function-style problems.`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
