import { PrismaClient } from "@prisma/__generated__";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const PrismaService = new PrismaClient({ adapter });

export {PrismaService}