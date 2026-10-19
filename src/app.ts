import express from 'express'
import { createProductRouter } from './transport/routers/product.js'
import { createProductHandler } from './transport/handlers/product.js';
import { createProductRepository } from './repositories/product.js';
import { createProductService } from './services/product/product.js';
import { db } from './prisma/db.js';
import { createUserRepository } from "./repositories/user.js";
import { createAuthService } from "./services/auth/auth.js";
import { signAccessToken } from "./lib/jwt.js";
import { hashPassword, verifyPassword } from "./lib/password.js";
import { createAuthHandlers } from "./transport/handlers/auth.js";
import { createAuthRouter } from "./transport/routers/auth.js";
import cors from 'cors';
//const express = require('express');

const app = express();
const productRepository = createProductRepository(db)
const productService = createProductService(productRepository)
const productHandlers = createProductHandler(productService)
const productRouter = createProductRouter(productHandlers)

const userRepository = createUserRepository(db);
const authService = createAuthService(
  userRepository,
  { hash: hashPassword, verify: verifyPassword },
  { signAccessToken },
);
const authHandlers = createAuthHandlers(authService);
const authRouter = createAuthRouter(authHandlers);

app.use(cors({ origin: 'http://localhost:5173' }));

// app.use(express.json()) - встроенный middleware, который позволяет спарсить json обьект в js обьект
app.use(express.json())
app.use('/products', productRouter)
app.use("/auth", authRouter);

// products    ->  router.get('/', getProducts)
// products/1  ->  router.get('/:id', getProductById)

const PORT = 8000
const HOST = 'localhost'; 



app.listen(PORT, HOST, ()=>{
    console.log(`Сервер запущен на http://${HOST}:${PORT}`)
})

