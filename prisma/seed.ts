import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MentorAI database...');

  // Clean existing data
  await prisma.verification.deleteMany({});
  await prisma.reminder.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.behavior.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create User
  const user = await prisma.user.create({
    data: {
      id: 'usr_default_01',
      name: 'Alex Rivera',
      timezone: 'America/New_York',
    },
  });

  // 2. Create Behavior profile with realistic insights
  const now = new Date();
  const insights = [
    {
      type: 'TIMING',
      title: 'Habitual 8:00 PM Study Window',
      detail: 'You consistently engage most effectively after 8:00 PM. High-focus tasks have been prioritized for this slot.',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      type: 'ADAPTATION',
      title: 'Power BI Milestone Pacing',
      detail: 'Detected 2 postponements on Power BI modeling. Next session will automatically break DAX functions into 20-minute chunks.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      type: 'RECOMMENDATION',
      title: 'Early SQL Completion Reward',
      detail: 'Window Functions completed 30 minutes early yesterday. Advanced CTE challenges are unlocked for extra credit.',
      timestamp: now.toISOString(),
    },
  ];

  await prisma.behavior.create({
    data: {
      userId: user.id,
      preferredStudyTime: '20:00',
      skippedCount: 1,
      streak: 5,
      bestStreak: 12,
      completionRate: 0.88,
      lastActiveDate: new Date(),
      insightsJson: JSON.stringify(insights),
    },
  });

  // 3. Create Primary Goal: "60-Day Data Analyst Mastery"
  const startDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // 14 days ago
  const endDate = new Date(startDate.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days total

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Become a Senior Data Analyst',
      description: 'Comprehensive 60-day roadmap mastering SQL, Power BI, Python for Data Science, and Real-world Portfolio Projects.',
      startDate,
      endDate,
      deadline: endDate,
      durationDays: 60,
      progress: 23.5, // 23%
    },
  });

  // 4. Create Milestones
  // Milestone 1: SQL Mastery (Completed)
  const milestone1 = await prisma.milestone.create({
    data: {
      goalId: goal.id,
      title: 'Milestone 1: Relational Database & Advanced SQL',
      order: 1,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      completed: false,
    },
  });

  // Milestone 2: Business Intelligence & Power BI
  const milestone2 = await prisma.milestone.create({
    data: {
      goalId: goal.id,
      title: 'Milestone 2: Power BI Dashboards & DAX Modeling',
      order: 2,
      dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      completed: false,
    },
  });

  // Milestone 3: Python Data Analytics & Pandas
  const milestone3 = await prisma.milestone.create({
    data: {
      goalId: goal.id,
      title: 'Milestone 3: Python, Pandas & Statistical Analysis',
      order: 3,
      dueDate: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
      completed: false,
    },
  });

  // 5. Create Tasks
  // Completed tasks from earlier days
  await prisma.task.create({
    data: {
      milestoneId: milestone1.id,
      title: 'SQL SELECT & Filtering Fundamentals',
      description: 'Master WHERE, LIKE, IN, and ORDER BY clauses across transactional datasets.',
      scheduledTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      estimatedMinutes: 45,
      priority: 'MEDIUM',
      reminderInterval: 15,
      completed: true,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 40 * 60000),
      verificationType: 'LEARNING',
      topic: 'SQL SELECT & Filtering',
      order: 1,
    },
  });

  await prisma.task.create({
    data: {
      milestoneId: milestone1.id,
      title: 'Multi-table Relational JOINs',
      description: 'Practice INNER, LEFT, RIGHT, and FULL OUTER joins on e-commerce schema.',
      scheduledTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      estimatedMinutes: 50,
      priority: 'HIGH',
      reminderInterval: 15,
      completed: true,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 48 * 60000),
      verificationType: 'CODING',
      topic: 'SQL JOIN Operations',
      order: 2,
    },
  });

  // Today's Primary Mission Task (Pending, Escalating!)
  // Scheduled for today at 8:00 PM (or 15 mins ago to demonstrate escalation engine)
  const scheduledMissionTime = new Date(Date.now() - 25 * 60 * 1000); // 25 mins ago -> Level 2 Firm!
  const todayMission = await prisma.task.create({
    data: {
      milestoneId: milestone1.id,
      title: 'Learn SQL GROUP BY, HAVING & Aggregations',
      description: 'Master analytical aggregations (SUM, AVG, COUNT, HAVING filter) on multi-million row sales datasets.',
      scheduledTime: scheduledMissionTime,
      estimatedMinutes: 45,
      priority: 'HIGH',
      reminderInterval: 15,
      completed: false,
      verificationType: 'CODING',
      topic: 'SQL Aggregations & GROUP BY',
      sourceContext: 'Day 14 of 60-Day Data Analyst Roadmap: GROUP BY groups rows that have the same values into summary rows. HAVING clause was added to SQL because the WHERE keyword cannot be used with aggregate functions.',
      order: 3,
      activeEscalationLevel: 2,
    },
  });

  // Create active Reminder for today's mission
  await prisma.reminder.create({
    data: {
      taskId: todayMission.id,
      sentAt: new Date(Date.now() - 10 * 60 * 1000),
      escalationLevel: 2,
      message: "Still pending! You're 25 minutes past scheduled time for SQL GROUP BY. You are losing today's momentum. Focus now!",
      channel: 'BROWSER',
      acknowledged: false,
    },
  });

  // Critical Deadline Card Task (Due tomorrow!)
  const criticalTask = await prisma.task.create({
    data: {
      milestoneId: milestone2.id,
      title: 'Power BI Executive Dashboard Capstone',
      description: 'Design and build the interactive executive KPI dashboard with automated refresh and drill-through analysis.',
      scheduledTime: new Date(Date.now() + 20 * 60 * 60 * 1000), // Due in 20 hours (Tomorrow)
      estimatedMinutes: 90,
      priority: 'CRITICAL',
      reminderInterval: 30,
      completed: false,
      verificationType: 'CODING',
      topic: 'Power BI DAX & Visual Design',
      sourceContext: 'End of Module Capstone Project: Requires calculating Year-Over-Year growth using CALCULATE and SAMEPERIODLASTYEAR.',
      order: 4,
      activeEscalationLevel: 1,
    },
  });

  // Another pending task for today
  await prisma.task.create({
    data: {
      milestoneId: milestone1.id,
      title: 'Star Schema vs Snowflake Data Warehousing Reading',
      description: 'Read Chapter 4 on Dimensional Modeling. Focus on dimension tables, fact tables, surrogate keys, and normalization trade-offs.',
      scheduledTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      estimatedMinutes: 30,
      priority: 'MEDIUM',
      reminderInterval: 20,
      completed: false,
      verificationType: 'LEARNING',
      topic: 'Star Schema vs Snowflake Architecture',
      sourceContext: 'Star schema is denormalized with dimension tables connected directly to fact table. Snowflake normalizes dimension tables into hierarchies, saving storage but increasing join overhead.',
      order: 5,
    },
  });

  // Sample Chat Messages in history
  await prisma.chatMessage.createMany({
    data: [
      {
        userId: user.id,
        sender: 'mentor',
        text: "Welcome back, Alex. We're on Day 14 of 60. Yesterday you nailed SQL JOINs with an 88% verification score.",
        createdAt: new Date(Date.now() - 120 * 60 * 1000),
      },
      {
        userId: user.id,
        sender: 'mentor',
        text: 'Time for today’s SQL Practice: "Learn SQL GROUP BY, HAVING & Aggregations". Remember, consistency is the difference between a student and a hired professional.',
        taskId: todayMission.id,
        createdAt: new Date(Date.now() - 25 * 60 * 1000),
      },
      {
        userId: user.id,
        sender: 'mentor',
        text: "⚠️ FIRM WARNING (Escalation Level 2): You are 25 minutes past your scheduled time. Do not lose your 5-day streak. Click 'Done' once you have solved the queries so I can verify your mastery.",
        taskId: todayMission.id,
        actionRequired: 'VERIFY',
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Database seeded successfully with User, 60-Day Goal, Milestones, Tasks, and Insights!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
