// import prisma from "./utils/database";

// async function main() {
//   await prisma.category.create({
//     data: {
//       name: "Divers",
//       description: "Contient des ressources diverses.",
//     },
//   });

//   await prisma.breathingExerciseType.createMany({
//     data: [{ name: "Public" }, { name: "Privé" }, { name: "Partagé" }],
//   });
// }
// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
