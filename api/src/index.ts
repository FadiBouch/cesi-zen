import "dotenv/config";
import express, { json } from "express";
import prisma from "./utils/database";
import users from "./routes/users";
import auth from "./routes/auth";
import contentCategories from "./routes/contentCategories";
import contents from "./routes/contents";
import breathingConfigurations from "./routes/breathingConfigurations";
import breathingTypes from "./routes/breathingTypes";
import helmet from "helmet";
import cors from "cors";

process.env.TZ = "Europe/Paris";
async function main() {
  const app = express();
  const port = 3000;
  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(helmet());
  app.use(express.urlencoded({ extended: false }));

  // ROUTES
  app.use("/users", users);
  app.use("/auth", auth);
  app.use("/content-categories", contentCategories);
  app.use("/contents", contents);
  app.use("/breathing-configs", breathingConfigurations);
  app.use("/breathing-types", breathingTypes);
  // FIN ROUTES

  app.listen(port, "0.0.0.0", () => {
    console.log(`App running and listening on http://localhost:${port}`);
  });
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
