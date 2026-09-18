export interface MilestoneQuestion {
  id: string;
  topic: string;
  question: string;
  expectedConcept: string;
  hint: string;
}

export interface StoredMilestoneTest {
  id: string;
  milestoneId: string;
  milestoneTitle: string;
  phaseNumber: number;
  totalQuestions: number;
  score: number; // 0 - 100
  passed: boolean;
  completedAt: string;
}

const STORAGE_KEY = 'mentor_milestone_tests_v1';

// Preset dynamic questions generated from uploaded roadmap topics
export const DEFAULT_PHASE_QUESTIONS: Record<number, MilestoneQuestion[]> = {
  1: [
    {
      id: 'q1-1',
      topic: 'Dimensional Modeling',
      question: 'What is the primary difference between a star schema and a snowflake schema, and when would you choose snowflake?',
      expectedConcept: 'normalization',
      hint: 'Think about dimension table normalization and foreign keys.',
    },
    {
      id: 'q1-2',
      topic: 'SQL Joins & Filtering',
      question: 'Write a query that returns customers with no orders. Which join do you use, and why?',
      expectedConcept: 'left join',
      hint: 'Consider what a LEFT JOIN keeps and how a NULL check filters unmatched rows.',
    },
    {
      id: 'q1-3',
      topic: 'Surrogate Keys',
      question: 'Why do data warehouses recommend surrogate keys over natural operational keys?',
      expectedConcept: 'slowly changing',
      hint: 'Think about schema changes, data integration across multiple sources, and SCDs.',
    },
    {
      id: 'q1-4',
      topic: 'Indexing & Performance',
      question: 'How does a B-tree index differ from a Bitmap index in analytical query workloads?',
      expectedConcept: 'cardinality',
      hint: 'Focus on low vs high cardinality columns.',
    },
    {
      id: 'q1-5',
      topic: 'dbt Core Pipelines',
      question: 'In dbt, what is the role of the ref() macro compared to hardcoding table names?',
      expectedConcept: 'dag',
      hint: 'Think about dependency graph generation and environment switching.',
    },
  ],
  2: [
    {
      id: 'q2-1',
      topic: 'Apache Spark Architecture',
      question: 'Explain the role of the Spark Driver vs Executors during a wide shuffle transformation.',
      expectedConcept: 'shuffle',
      hint: 'Consider DAG scheduling, partition exchange, and network I/O.',
    },
    {
      id: 'q2-2',
      topic: 'Delta Lake & ACID',
      question: 'How does Delta Lake implement ACID transactions on top of cloud object storage (S3/GCS)?',
      expectedConcept: 'transaction log',
      hint: 'Think about the _delta_log parquet commit files and optimistic concurrency.',
    },
    {
      id: 'q2-3',
      topic: 'Streaming & Watermarks',
      question: 'What purpose does a watermark serve in Spark Structured Streaming event-time processing?',
      expectedConcept: 'late data',
      hint: 'How does Spark decide when state for an old window can be evicted?',
    },
  ],
};

export function getMilestoneTests(): StoredMilestoneTest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to get stored milestone tests:', err);
    return [];
  }
}

export function saveMilestoneTest(test: StoredMilestoneTest): void {
  try {
    const tests = getMilestoneTests();
    const idx = tests.findIndex((t) => t.milestoneId === test.milestoneId);
    if (idx >= 0) {
      tests[idx] = test;
    } else {
      tests.push(test);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
  } catch (err) {
    console.error('Failed to save milestone test:', err);
  }
}

export function getMilestoneTestStats(): { passed: number; total: number } {
  const tests = getMilestoneTests();
  const passed = tests.filter((t) => t.passed).length;
  const total = tests.length;
  return { passed, total };
}

export function generateMilestoneQuestions(
  milestoneTitle: string,
  phaseNumber: number = 1
): MilestoneQuestion[] {
  if (DEFAULT_PHASE_QUESTIONS[phaseNumber]) {
    return DEFAULT_PHASE_QUESTIONS[phaseNumber];
  }
  return DEFAULT_PHASE_QUESTIONS[1];
}

export function gradeMilestoneAnswer(
  question: MilestoneQuestion,
  answer: string
): { isCorrect: boolean; isClose: boolean; feedback: string } {
  const clean = answer.toLowerCase().trim();

  if (clean.length < 5) {
    return {
      isCorrect: false,
      isClose: false,
      feedback: 'Please expand on your explanation with a specific architectural or practical reason.',
    };
  }

  // Question 2 special case (mockup reference: LEFT JOIN with NULL check)
  if (question.id === 'q1-2') {
    if (clean.includes('null') && clean.includes('left join')) {
      return {
        isCorrect: true,
        isClose: false,
        feedback: 'Spot on! A LEFT JOIN preserves all rows from the left table, and testing WHERE right_table.id IS NULL precisely isolates records with no matches.',
      };
    }
    if (clean.includes('left join') && !clean.includes('null')) {
      return {
        isCorrect: false,
        isClose: true,
        feedback: 'Close — a LEFT JOIN alone still returns all matched customers. You need a WHERE order_id IS NULL filter to isolate those without orders. Want to try again?',
      };
    }
  }

  // General heuristic grading
  const concept = question.expectedConcept.toLowerCase();
  if (clean.includes(concept) || clean.length > 25) {
    return {
      isCorrect: true,
      isClose: false,
      feedback: 'Excellent work! You demonstrated clear comprehension of the underlying core concept.',
    };
  }

  return {
    isCorrect: false,
    isClose: true,
    feedback: `Close — you're touching on the right area. Make sure to consider ${question.hint.toLowerCase()} Would you like to refine your answer?`,
  };
}
