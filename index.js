const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const allBooks = await prisma.book.findMany()
  console.log(allBooks)
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
