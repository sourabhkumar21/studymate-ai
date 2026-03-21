import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Fake Users
  const user1 = await prisma.user.upsert({
    where: { id: "fake_user_1" },
    update: {},
    create: { id: "fake_user_1", email: "alex@example.com", name: "Alex J.", image: "none" }
  });

  const user2 = await prisma.user.upsert({
    where: { id: "fake_user_2" },
    update: {},
    create: { id: "fake_user_2", email: "priya@example.com", name: "Priya Sharma", image: "none" }
  });

  // 2. Create High-Quality Public Roadmaps
  await prisma.roadmap.create({
    data: {
      userId: user1.id,
      title: "Data Structures & Algorithms (C++)",
      examDate: new Date("2026-05-15"),
      syllabusText: "Arrays, LinkedLists, Trees, Graphs, DP",
      isPublic: true,
      likeCount: 342,
      tasks: {
        create: [
          { topic: "Arrays, Strings, & Two Pointers", dayNumber: 1 },
          { topic: "Linked Lists & Fast/Slow Pointers", dayNumber: 2 },
          { topic: "Binary Trees & BSTs", dayNumber: 3 },
          { topic: "Graph Traversals (BFS/DFS)", dayNumber: 4 }
        ]
      }
    }
  });

  await prisma.roadmap.create({
    data: {
      userId: user2.id,
      title: "Operating Systems Final",
      examDate: new Date("2026-04-20"),
      syllabusText: "Processes, Threads, Memory Management",
      isPublic: true,
      likeCount: 342,
      tasks: {
        create: [
          { topic: "Process Management & Scheduling", dayNumber: 1 },
          { topic: "Threads & Concurrency", dayNumber: 2 },
          { topic: "Deadlocks (Banker's Algorithm)", dayNumber: 3 }
        ]
      }
    }
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });