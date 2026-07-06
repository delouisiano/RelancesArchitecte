import { prisma } from "@/lib/prisma";
import { getSystemHealth } from "@/modules/system/health";

async function main() {
  const health = await getSystemHealth();
  console.log(JSON.stringify(health, null, 2));

  if (health.summary === "error") {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
