import { config } from '../config/index.js';
import { ExtractedPlan, VerificationType } from '../types/shared.js';

export class AIService {
  private apiKey = config.ai.apiKey;
  private baseUrl = config.ai.baseUrl;
  private model = config.ai.model;

  private isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Generic OpenAI-compatible chat completion caller
   */
  public async generateCompletion(systemPrompt: string, userPrompt: string, temperature = 0.3): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('AI API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API request failed (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as any;
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * Parse roadmap content into structured ExtractedPlan
   */
  public async parseRoadmap(rawContent: string): Promise<ExtractedPlan> {
    if (this.isConfigured()) {
      try {
        const systemPrompt = `You are an expert curriculum and accountability architect.
Extract study plan roadmaps into structured JSON matching this schema:
{
  "goal": string (e.g. "Become Data Analyst"),
  "duration": number (total days, e.g. 60),
  "milestones": [
    {
      "title": string (e.g. "Milestone 1: SQL Mastery"),
      "weekOrMonthNumber": number,
      "tasks": [
        {
          "title": string (e.g. "Learn SQL GROUP BY and HAVING"),
          "estimatedMinutes": number (e.g. 45),
          "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
          "verificationType": "LEARNING" | "CODING" | "READING" | "WORKOUT" | "GENERAL",
          "topic": string,
          "description": string,
          "dayNumber": number
        }
      ]
    }
  ]
}
Return ONLY valid raw JSON with no Markdown backticks or commentary.`;

        const userPrompt = `Here is the roadmap text:\n\n${rawContent.slice(0, 15000)}`;
        const result = await this.generateCompletion(systemPrompt, userPrompt, 0.2);
        const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.goal && Array.isArray(parsed.milestones)) {
          return parsed as ExtractedPlan;
        }
      } catch (err) {
        console.warn('AI plan parsing encountered error or is unconfigured, using robust heuristic extractor:', err);
      }
    }

    // Heuristic Fallback Parser
    return this.heuristicPlanExtractor(rawContent);
  }

  /**
   * Generates a context-specific verification challenge
   */
  public async generateVerificationQuestion(taskTitle: string, topic?: string, type: string = 'LEARNING', sourceContext?: string): Promise<string> {
    const taskTopic = topic || taskTitle;

    if (this.isConfigured()) {
      try {
        const systemPrompt = `You are MentorAI, a strict, authoritative accountability mentor.
The user claims they have completed their scheduled task. You NEVER accept completion without a rigorous, targeted question.
Generate ONE specific question or prompt that directly tests their understanding or asks for concrete proof.
- For LEARNING: Ask for an explanation of a core mechanism or contrast two concepts (e.g. "Explain why Star Schema is faster than Snowflake").
- For CODING: Ask to write a query, paste a specific function, or explain time complexity.
- For READING: Ask for 3 specific practical takeaways.
- For WORKOUT: Ask for sets, reps, and duration.
Return ONLY the question text directly.`;

        const userPrompt = `Task Title: "${taskTitle}"
Topic: "${taskTopic}"
Verification Type: "${type}"
Context: "${sourceContext || 'General curriculum content'}"`;

        const result = await this.generateCompletion(systemPrompt, userPrompt, 0.4);
        if (result && result.trim()) {
          return result.trim();
        }
      } catch (err) {
        console.warn('AI question generator fallback:', err);
      }
    }

    // Intelligent context-aware offline question generator
    return this.heuristicQuestionGenerator(taskTitle, taskTopic, type);
  }

  /**
   * Verify and grade user's answer
   */
  public async evaluateVerificationAnswer(
    question: string,
    answer: string,
    taskTitle: string,
    topic?: string,
    type: string = 'LEARNING'
  ): Promise<{ passed: boolean; feedback: string; score: number }> {
    const trimmed = (answer || '').trim();

    // Catch obvious non-answers immediately
    if (!trimmed || trimmed.length < 15 || /^(done|yes|completed|finished|ok|i did it|none|n\/a)$/i.test(trimmed)) {
      return {
        passed: false,
        score: 10,
        feedback: "Rejected. A one-word or trivial answer does not demonstrate competence. A strict mentor will not let you cheat your own future. Provide a thorough, substantive response.",
      };
    }

    if (this.isConfigured()) {
      try {
        const systemPrompt = `You are MentorAI, a strict personal accountability mentor.
Grade the user's response to your verification question for task "${taskTitle}" (${type}).
Be strict and demand genuine understanding.
Return JSON ONLY:
{
  "passed": boolean,
  "score": number (0 to 100),
  "feedback": string (strict, constructive mentor feedback explaining what was good and what was missing)
}`;
        const userPrompt = `Question: "${question}"\nUser Answer: "${trimmed}"`;
        const result = await this.generateCompletion(systemPrompt, userPrompt, 0.2);
        const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          passed: Boolean(parsed.passed),
          score: Number(parsed.score) || (parsed.passed ? 85 : 45),
          feedback: parsed.feedback || (parsed.passed ? 'Verified. Good work.' : 'Insufficient detail.'),
        };
      } catch (err) {
        console.warn('AI evaluator fallback:', err);
      }
    }

    // Offline heuristic evaluation
    return this.heuristicEvaluateAnswer(question, trimmed, taskTitle, topic, type);
  }

  /**
   * Interactive Mentor Chat generation
   */
  public async chatWithMentor(messages: Array<{ sender: string; text: string }>, currentTaskContext?: string): Promise<string> {
    const lastMessage = messages[messages.length - 1]?.text || '';
    const lower = lastMessage.toLowerCase();

    // 1. Check if user is asking a question or technical topic
    const isQuestion =
      /\?|what\s+is|what\s+are|explain|how\s+to|how\s+does|why\s+is|difference\s+between|tell\s+me\s+about|help\s+me\s+understand|example\s+of|guide\s+me|teach\s+me|syntax\s+for|dax|sql|join|cte|window\s+function|star\s+schema|snowflake|pandas|power\s+bi/i.test(lower);

    if (this.isConfigured()) {
      try {
        const systemPrompt = isQuestion
          ? `You are MentorAI: a senior technical mentor and curriculum expert.
The user is asking a technical question or seeking explanation on their study material.
- Answer their question DIRECTLY with concrete syntax, clear architectural explanations, and practical examples.
- Do NOT lecture or preach about discipline when they are asking an honest question about the material.
- Keep the explanation clear, high-density, and encouraging (2-3 paragraphs with code where appropriate).
Current Curriculum Context: ${currentTaskContext || 'Data Analytics & Engineering Roadmap'}.`
          : `You are MentorAI: a strict, relentless, yet deeply supportive accountability mentor.
Hold the user to the highest standard. Demand execution, call out excuses constructively, and keep responses punchy and focused on action.
Current user context: ${currentTaskContext || 'User is following an intensive study plan'}.`;

        const formattedMessages = messages.map(m => ({
          role: m.sender === 'mentor' ? 'assistant' : 'user',
          content: m.text,
        }));

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [{ role: 'system', content: systemPrompt }, ...formattedMessages],
            temperature: 0.3,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const reply = data.choices?.[0]?.message?.content;
          if (reply) return reply;
        }
      } catch (err) {
        console.warn('AI chat fallback:', err);
      }
    }

    // 2. Procrastination / Fatigue / Delay excuses (Discipline responses reserved for when they are slacking)
    if (/(^|\b)(tired|tomorrow|postpone|snooze|skip|lazy|exhausted|give up|can't do it)(\b|$)/i.test(lower)) {
      return "Fatigue is real, but regret lasts longer. If you delay today, tomorrow has double the weight. Take a 5-minute breather, drink water, and commit to just 15 minutes of focused effort. Momentum is everything.";
    }

    // 3. User claims completion
    if (/(^|\b)(done|finished|complete|i solved it|all set)(\b|$)/i.test(lower) && !lower.includes('how') && !lower.includes('what')) {
      return "You claim you're done. A true professional proves their work before celebrating. Click 'Verify & Complete' on today's mission card or paste your solution right here so I can evaluate your comprehension.";
    }

    // 4. Intelligent Offline Technical Knowledge Engine for Curriculum Queries
    if (lower.includes('dax')) {
      return `**DAX (Data Analysis Expressions)** is the formula expression language used across Power BI, Analysis Services, and Excel Power Pivot.

Here are the key principles you need to know:
1. **Measures**: Dynamically calculated expressions evaluated on the fly based on the current visual filter context (slicers, rows, columns). They consume minimal memory and recalculate as users interact with charts. Example:
\`\`\`dax
Total Revenue = SUMX(Sales, Sales[Quantity] * Sales[UnitPrice])
\`\`\`
2. **Calculated Columns**: Computed once row-by-row during data model refresh and stored permanently in memory (Row Context). Use sparingly because they increase RAM usage.
3. **Context Transition**: The function \`CALCULATE()\` transforms an existing row context into an equivalent filter context, which is the cornerstone of advanced DAX modeling.`;
    }

    if (lower.includes('join') || lower.includes('inner join') || lower.includes('left join')) {
      return `In SQL, **JOINs** combine data from multiple tables based on matching keys:
- **INNER JOIN**: Returns only rows that match in *both* tables.
- **LEFT JOIN**: Returns *all* records from the left table, plus matched records from the right table. Non-matching right columns are filled with \`NULL\`.
- **RIGHT JOIN**: Returns all records from the right table, and matched rows from the left table.
- **FULL OUTER JOIN**: Returns all rows whenever there is a match in either table, filling \`NULL\` for missing values on either side.

Example:
\`\`\`sql
SELECT e.employee_name, d.dept_name
FROM Employees e
LEFT JOIN Departments d ON e.dept_id = d.id;
\`\`\``;
    }

    if (lower.includes('cte') || lower.includes('window function') || lower.includes('common table expression')) {
      return `A **CTE (Common Table Expression)** creates a temporary named result set defined using a \`WITH\` clause:
\`\`\`sql
WITH RankedSales AS (
  SELECT rep_id, amount,
         ROW_NUMBER() OVER (PARTITION BY rep_id ORDER BY amount DESC) as rank
  FROM Sales
)
SELECT * FROM RankedSales WHERE rank <= 3;
\`\`\`
Window functions (\`ROW_NUMBER()\`, \`RANK()\`, \`DENSE_RANK()\`, \`LEAD()\`, \`LAG()\`) compute aggregations over partitions without collapsing multiple rows into one like \`GROUP BY\` does.`;
    }

    if (lower.includes('star schema') || lower.includes('snowflake') || lower.includes('dimensional')) {
      return `In dimensional data modeling:
- **Star Schema**: Center **Fact table** (containing metrics/events) surrounded directly by flat, denormalized **Dimension tables**. Queries require fewer joins and perform significantly faster for analytical reporting.
- **Snowflake Schema**: Dimension tables are **normalized** into sub-tables (e.g. Product -> Category). This reduces storage redundancy, but requires complex multi-table joins that degrade query speed.

In modern analytics (Power BI, BigQuery, Snowflake), **Star Schema is the industry gold standard**.`;
    }

    if (lower.includes('pandas') || lower.includes('.loc') || lower.includes('.iloc')) {
      return `In **Python Pandas**:
- \`.loc[]\` is **label-based**: you select rows and columns by their explicit index labels or boolean arrays.
- \`.iloc[]\` is **integer position-based**: you select rows and columns strictly by 0-based numeric indexes.

Example:
\`\`\`python
# Label indexing:
df.loc[df['sales'] > 500, ['customer_id', 'total']]

# Position indexing (first 5 rows, first 2 columns):
df.iloc[0:5, 0:2]
\`\`\``;
    }

    if (lower.includes('having') || lower.includes('group by')) {
      return `The distinction between \`WHERE\` and \`HAVING\` in SQL:
- \`WHERE\` filters individual records **before** grouping and aggregations occur.
- \`HAVING\` filters aggregated summary rows **after** \`GROUP BY\` has calculated the aggregates.

Example:
\`\`\`sql
SELECT department, AVG(salary) as avg_sal
FROM Employees
WHERE status = 'ACTIVE'
GROUP BY department
HAVING AVG(salary) > 75000;
\`\`\``;
    }

    if (isQuestion) {
      return `Here is how to approach this topic in your curriculum:
1. **Core Concept**: Understand the primary mechanism and why the tool or technique was built.
2. **Standard Implementation**: Write a minimal, working query or code snippet to verify the behavior.
3. **Edge Cases**: Check for NULL handling, boundary conditions, or performance implications.

Would you like to walk through a concrete code example or test your understanding with a quick exercise?`;
    }

    return "Discipline is doing what needs to be done, even when you don't feel like it. Focus on today's mission. What specific blocker is standing between you and completing your task right now?";
  }

  // --- Offline Heuristic Implementations ---

  private heuristicPlanExtractor(raw: string): ExtractedPlan {
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let goal = 'Custom Learning Mastery Plan';
    let duration = 30;

    // Detect goal from header or top lines
    for (const line of lines.slice(0, 5)) {
      if (/(goal|roadmap|plan|curriculum|mastery|guide)/i.test(line)) {
        goal = line.replace(/^[#*>\-\d.\s]+/, '').trim();
        break;
      }
    }

    // Detect duration
    const durationMatch = raw.match(/(\d+)[\s-]*(day|week|month)s?/i);
    if (durationMatch) {
      const num = parseInt(durationMatch[1], 10);
      const unit = durationMatch[2].toLowerCase();
      if (unit.startsWith('day')) duration = num;
      else if (unit.startsWith('week')) duration = num * 7;
      else if (unit.startsWith('month')) duration = num * 30;
    }

    const milestones: ExtractedPlan['milestones'] = [];
    let currentMilestone: ExtractedPlan['milestones'][0] | null = null;
    let dayCount = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect Milestone / Week / Module header
      if (/^(#+|\*+)?\s*(week|month|milestone|module|phase)\s*(\d+|[ivx]+)?:?/i.test(line)) {
        if (currentMilestone && currentMilestone.tasks.length > 0) {
          milestones.push(currentMilestone);
        }
        currentMilestone = {
          title: line.replace(/^[#*>\-\s]+/, '').trim(),
          tasks: [],
        };
        continue;
      }

      // Detect Task / Day / Item
      const isDayPattern = /^(day\s*\d+|step\s*\d+|task\s*\d+|[-*•]|\d+\.)/i.test(line);
      if (isDayPattern || (line.length > 5 && line.length < 120 && !line.startsWith('#'))) {
        if (!currentMilestone) {
          currentMilestone = {
            title: `Phase 1: Foundations & Core Concepts`,
            tasks: [],
          };
        }

        const taskClean = line.replace(/^(day\s*\d+[:.\s-]*|[-*•\d.]+\s*)/i, '').trim();
        if (taskClean.length > 3) {
          const isCoding = /(sql|python|code|query|join|table|script|function|react|api|docker|git)/i.test(taskClean);
          const isReading = /(read|chapter|book|article|overview|theory|paper)/i.test(taskClean);
          const isWorkout = /(workout|pushup|gym|cardio|run|sets|reps|squat)/i.test(taskClean);

          let verificationType: VerificationType = 'LEARNING';
          if (isCoding) verificationType = 'CODING';
          else if (isReading) verificationType = 'READING';
          else if (isWorkout) verificationType = 'WORKOUT';

          const isCritical = /(project|capstone|exam|deadline|submission|milestone)/i.test(taskClean);

          currentMilestone.tasks.push({
            title: taskClean,
            estimatedMinutes: isCoding ? 50 : 35,
            priority: isCritical ? 'CRITICAL' : 'MEDIUM',
            verificationType,
            topic: taskClean.slice(0, 40),
            description: `Scheduled curriculum objective for Day ${dayCount}: ${taskClean}`,
            dayNumber: dayCount++,
          });
        }
      }
    }

    if (currentMilestone && currentMilestone.tasks.length > 0) {
      milestones.push(currentMilestone);
    }

    if (milestones.length === 0) {
      milestones.push({
        title: 'Phase 1: Core Fundamentals',
        tasks: [
          {
            title: 'Foundational Concepts & Setup',
            estimatedMinutes: 45,
            priority: 'HIGH',
            verificationType: 'LEARNING',
            topic: 'Foundations',
            dayNumber: 1,
          },
          {
            title: 'Hands-on Implementation Practice',
            estimatedMinutes: 60,
            priority: 'CRITICAL',
            verificationType: 'CODING',
            topic: 'Core Practice',
            dayNumber: 2,
          },
        ],
      });
    }

    return {
      goal,
      duration: Math.max(duration, dayCount),
      milestones,
      rawSummary: `Parsed ${milestones.length} milestones and ${milestones.reduce((acc, m) => acc + m.tasks.length, 0)} structured tasks.`,
    };
  }

  private heuristicQuestionGenerator(title: string, topic: string, type: string): string {
    const lower = `${title} ${topic}`.toLowerCase();

    if (lower.includes('join')) {
      return "Explain the exact difference between an INNER JOIN and a LEFT JOIN. Under what scenario would you use a FULL OUTER JOIN over a LEFT JOIN?";
    }
    if (lower.includes('group by') || lower.includes('having') || lower.includes('aggregation')) {
      return "Explain why the HAVING clause exists when SQL already has WHERE. Provide an example query that groups by department and filters for average salary > 75000.";
    }
    if (lower.includes('star schema') || lower.includes('snowflake') || lower.includes('dimensional')) {
      return "Explain the difference between a Fact table and a Dimension table. Why does Star Schema typically provide faster analytical query performance than Snowflake Schema?";
    }
    if (lower.includes('power bi') || lower.includes('dax')) {
      return "Explain the difference between a Calculated Column and a Measure in Power BI/DAX. When is evaluation context applied for each?";
    }
    if (lower.includes('python') || lower.includes('pandas')) {
      return "How does pandas DataFrame `.loc` differ from `.iloc`? Write a snippet to filter rows where 'sales' > 500 and select only 'customer_id'.";
    }

    switch (type) {
      case 'CODING':
        return `Write or paste the code solution for "${title}". Explain your implementation and state the time/space complexity.`;
      case 'READING':
        return `Summarize 3 concrete takeaways from "${title}". How will you apply these concepts in your next practical session?`;
      case 'WORKOUT':
        return `Report your actual execution: list each exercise, completed sets, reps per set, and total duration.`;
      case 'LEARNING':
      default:
        return `Explain the core concept of "${topic}". If you had to explain this to a beginner in 3 sentences, what would you say?`;
    }
  }

  private heuristicEvaluateAnswer(
    question: string,
    answer: string,
    taskTitle: string,
    topic?: string,
    type: string = 'LEARNING'
  ): { passed: boolean; feedback: string; score: number } {
    const trimmed = answer.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);

    // 1. Gibberish / Repetition / Keyboard mash detection
    if (words.length < 4 || trimmed.length < 15) {
      return {
        passed: false,
        score: 10,
        feedback: "Rejected: Your response is too brief. A strict mentor requires a substantive explanation of the core concept.",
      };
    }

    // Repetitive character sequences (e.g. "aaaaaa", "zzzzzz", "asdfasdfasdf")
    if (/(.)\1{4,}/.test(trimmed)) {
      return {
        passed: false,
        score: 10,
        feedback: "Rejected: Incoherent character repetition detected. Please provide a clear, reasoned answer.",
      };
    }

    // Vowel ratio check for English text keyboard mash (e.g. "qwrtyp lkjhgf dszxcv")
    const alphabeticOnly = trimmed.replace(/[^a-zA-Z]/g, '');
    if (alphabeticOnly.length >= 12) {
      const vowels = (alphabeticOnly.match(/[aeiouyAEIOUY]/g) || []).length;
      const vowelRatio = vowels / alphabeticOnly.length;
      if (vowelRatio < 0.15 || vowelRatio > 0.75) {
        return {
          passed: false,
          score: 15,
          feedback: "Rejected: Unstructured text or keyboard mash detected. Please answer the prompt in coherent English sentences.",
        };
      }
    }

    // High word repetition check (e.g. repeating the same word 10 times)
    if (words.length >= 6) {
      const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, '')));
      if (uniqueWords.size / words.length < 0.35) {
        return {
          passed: false,
          score: 15,
          feedback: "Rejected: Repetitive word patterns detected. Explain the actual mechanism rather than repeating terms.",
        };
      }
    }

    const context = `${question} ${taskTitle} ${topic || ''}`.toLowerCase();
    const lower = trimmed.toLowerCase();

    // 2. Specific Domain Knowledge Concept Verification
    // A. SQL Joins
    if (context.includes('join') || context.includes('left join') || context.includes('inner join')) {
      const mentionsLeft = lower.includes('left') || lower.includes('first table') || lower.includes('all rows') || lower.includes('every row') || lower.includes('unmatched');
      const mentionsHandling = lower.includes('null') || lower.includes('match') || lower.includes('retain') || lower.includes('keep') || lower.includes('preserve') || lower.includes('drops');

      if (!mentionsLeft || !mentionsHandling) {
        return {
          passed: false,
          score: 35,
          feedback: "Rejected: Incomplete understanding of SQL joins. A LEFT JOIN preserves ALL rows from the left table regardless of whether a match exists in the right table (filling missing right columns with NULL), whereas an INNER JOIN drops unmatched rows entirely. Explain how unmatched rows are preserved.",
        };
      }
    }

    // B. Dimensional Modeling (Star vs Snowflake)
    else if (context.includes('star schema') || context.includes('snowflake') || context.includes('dimensional')) {
      const mentionsDimOrFact = lower.includes('fact') || lower.includes('dimension') || lower.includes('table');
      const mentionsStructure = lower.includes('denormaliz') || lower.includes('normaliz') || lower.includes('join') || lower.includes('redundanc') || lower.includes('hierarchy') || lower.includes('speed') || lower.includes('performance');

      if (!mentionsDimOrFact || !mentionsStructure) {
        return {
          passed: false,
          score: 35,
          feedback: "Rejected: Missing core dimensional architecture concepts. In a Star Schema, dimension tables are denormalized to avoid slow multi-table joins during OLAP reporting, whereas Snowflake normalizes dimensions into hierarchies to reduce storage redundancy. Incorporate Fact vs Dimension and normalization trade-offs.",
        };
      }
    }

    // C. GROUP BY vs HAVING
    else if (context.includes('having') || context.includes('group by')) {
      const mentionsAgg = lower.includes('agg') || lower.includes('filter') || lower.includes('where') || lower.includes('sum') || lower.includes('avg') || lower.includes('count');
      const mentionsTiming = lower.includes('before') || lower.includes('after') || lower.includes('group') || lower.includes('row');

      if (!mentionsAgg || !mentionsTiming) {
        return {
          passed: false,
          score: 35,
          feedback: "Rejected: Missing core aggregation distinction. WHERE filters individual rows before aggregation occurs, while HAVING filters aggregated summary rows (e.g. AVG(salary) > 75000) after the GROUP BY is computed.",
        };
      }
    }

    // D. Power BI & DAX
    else if (context.includes('dax') || context.includes('power bi') || context.includes('calculated column') || context.includes('measure')) {
      const mentionsMeasureOrCol = lower.includes('measure') || lower.includes('calculated column') || lower.includes('column');
      const mentionsContext = lower.includes('filter context') || lower.includes('row context') || lower.includes('dynamic') || lower.includes('refresh') || lower.includes('memory') || lower.includes('visual');

      if (!mentionsMeasureOrCol || !mentionsContext) {
        return {
          passed: false,
          score: 35,
          feedback: "Rejected: Incomplete DAX evaluation explanation. Calculated columns are evaluated row-by-row during data refresh and stored in memory, while Measures are calculated dynamically on the fly based on the visual filter context.",
        };
      }
    }

    // E. Python / Pandas (.loc vs .iloc)
    else if (context.includes('pandas') || context.includes('.loc') || context.includes('.iloc') || context.includes('dataframe')) {
      const mentionsLabelOrPos = lower.includes('label') || lower.includes('position') || lower.includes('integer') || lower.includes('index') || lower.includes('0-based') || lower.includes('numeric');

      if (!mentionsLabelOrPos) {
        return {
          passed: false,
          score: 35,
          feedback: "Rejected: Missing indexing distinction. In pandas, .loc selects data by label or boolean condition, while .iloc selects data strictly by 0-based integer position.",
        };
      }
    }

    // F. Coding Type Tasks
    if (type === 'CODING') {
      const hasSyntax = /[{};=()<>|&[\]]|def\s|SELECT\s|FROM\s|function\s|const\s|let\s|var\s|import\s|return\s/i.test(trimmed);
      if (!hasSyntax && words.length < 15) {
        return {
          passed: false,
          score: 40,
          feedback: "Rejected: For a coding objective, you must provide actual code syntax, a query, or a formal programmatic explanation of your implementation.",
        };
      }
    }

    // G. Minimum Substance Check
    if (words.length < 8) {
      return {
        passed: false,
        score: 35,
        feedback: `Rejected: Your response lacks depth. MentorAI demands a detailed explanation demonstrating your synthesis of "${taskTitle}".`,
      };
    }

    // Passed!
    return {
      passed: true,
      score: Math.min(98, 75 + Math.min(20, words.length)),
      feedback: "Verification approved. Your explanation demonstrates active synthesis and genuine grasp of the core mechanisms. Task marked completed!",
    };
  }
}

export const aiService = new AIService();
