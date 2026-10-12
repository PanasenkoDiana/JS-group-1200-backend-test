import { db } from "./db.js";

await db.orm.public.Category.create({
    name: "Electronics",
});

await db.orm.public.Category.create({
    name: "Accessories",
});

console.log("Categories created");
