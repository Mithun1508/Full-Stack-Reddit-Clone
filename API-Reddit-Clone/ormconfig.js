const { NODE_ENV, DATABASE_URL } = process.env;

const rootDir = NODE_ENV === "development" ? "src" : "build";

module.exports = {
  type: "postgres",
  url: DATABASE_URL,
  synchronize: false,
  logging: NODE_ENV === "development",
  entities: [`${rootDir}/entities/**/*{.ts,.js}`],
  migrations: [`${rootDir}/migrations/**/*{.ts,.js}`],
  subscribers: [`${rootDir}/subscribers/**/*{.ts,.js}`],
  seeds: [`${rootDir}/seeds/**/*{.ts,.js}`],
  cli: {
    entitiesDir: `${rootDir}/entities`,
    migrationsDir: `${rootDir}/migrations`,
    subscribersDir: `${rootDir}/subscribers`,
  },
};
