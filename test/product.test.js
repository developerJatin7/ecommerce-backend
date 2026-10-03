import request from "supertest";
import mongoose from "mongoose";

import app from "../src/app.js";
import connectDB from "../src/db/index.js";
import { User } from "../src/models/user.model.js";
import { Product } from "../src/models/product.model.js";

beforeAll(async () => {

    await connectDB();

    if (!mongoose.connection.name.endsWith("_test")) {
        throw new Error(
            `Unsafe database detected: ${mongoose.connection.name}`
        );
    }

});


afterEach(async () => {

    await Product.deleteMany({});
    await User.deleteMany({});

});


afterAll(async () => {

    await mongoose.connection.close();

});

describe("Product API", () => {

    describe("POST /api/v1/products", () => {

        test("should allow admin to create a product", async () => {

            // ARRANGE
            await User.create({
                name: "Admin User",
                email: "admin@example.com",
                password: "password123",
                role: "admin"
            });


            const loginResponse = await request(app)
                .post("/api/v1/users/login")
                .send({
                    email: "admin@example.com",
                    password: "password123"
                });


            expect(loginResponse.statusCode).toBe(200);


            const accessToken =
                loginResponse.body.data.accessToken;


            expect(accessToken).toBeDefined();


            const productData = {
                name: "Test Laptop",
                description: "Laptop created during automated testing",
                price: 50000,
                category: "electronics",
                stock: 10,
                brand: "Test Brand"
            };


            // ACT
            const response = await request(app)
                .post("/api/v1/products")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .send(productData);


            // ASSERT
            expect(response.statusCode).toBe(201);

            expect(response.body.success).toBe(true);


            const savedProduct = await Product.findOne({
                name: productData.name
            });


            expect(savedProduct).not.toBeNull();

            expect(savedProduct.name)
                .toBe(productData.name);

            expect(savedProduct.price)
                .toBe(productData.price);

            expect(savedProduct.stock)
                .toBe(productData.stock);

        });

        test("should reject normal user from creating a product", async () => {

            // ARRANGE
            await User.create({
                name: "Normal User",
                email: "user@example.com",
                password: "password123",
                role: "user"
            });


            const loginResponse = await request(app)
                .post("/api/v1/users/login")
                .send({
                    email: "user@example.com",
                    password: "password123"
                });


            expect(loginResponse.statusCode).toBe(200);


            const accessToken =
                loginResponse.body.data.accessToken;


            expect(accessToken).toBeDefined();


            const productData = {
                name: "Unauthorized Laptop",
                description: "Normal user should not create this product",
                price: 40000,
                category: "electronics",
                stock: 5,
                brand: "Test Brand"
            };


            // ACT
            const response = await request(app)
                .post("/api/v1/products")
                .set(
                    "Authorization",
                    `Bearer ${accessToken}`
                )
                .send(productData);


            // ASSERT
            expect(response.statusCode).toBe(403);

            expect(response.body.success).toBe(false);


            // Make sure product was NOT created
            const savedProduct = await Product.findOne({
                name: productData.name
            });

            expect(savedProduct).toBeNull();

        });

        test("should reject product creation without authentication", async () => {

            const response = await request(app)
                .post("/api/v1/products")
                .send({
                    name: "Unauthorized Product",
                    description: "Should never be created",
                    price: 1000,
                    category: "electronics",
                    stock: 5,
                    brand: "Test Brand"
                });


            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);


            const savedProduct = await Product.findOne({
                name: "Unauthorized Product"
            });

            expect(savedProduct).toBeNull();

        });

    });

    describe("GET /api/v1/products", () => {

        test("should return all products", async () => {
            // ARRANGE
            await Product.create([
                {
                    name: "Laptop",
                    description: "Gaming laptop",
                    price: 60000,
                    category: "electronics",
                    stock: 10,
                    brand: "Brand A",
                    isActive: true
                },
                {
                    name: "Phone",
                    description: "Smartphone",
                    price: 30000,
                    category: "electronics",
                    stock: 20,
                    brand: "Brand B",
                    isActive: true
                }
            ])

            // ACT
            const response = await request(app)
                .get("/api/v1/products");
            console.log(JSON.stringify(response.body, null, 2));



            // ASSERT
            expect(response.statusCode).toBe(200);

            expect(response.body.success).toBe(true);

            //Check that exactly 2 products are returned
            expect(response.body.data.products)
                .toHaveLength(2);

            expect(response.body.data.pagination.totalProducts)
                .toBe(2);

            expect(response.body.data.pagination.currentPage)
                .toBe(1);

            expect(response.body.data.pagination.limit)
                .toBe(10);

        })

        test("should search products by name", async () => {

    // ARRANGE
    await Product.create([
        {
            name: "Gaming Laptop",
            description: "Powerful gaming computer",
            price: 80000,
            category: "electronics",
            stock: 10,
            brand: "Brand A",
            isActive: true
        },
        {
            name: "Smartphone",
            description: "Latest smartphone",
            price: 30000,
            category: "electronics",
            stock: 20,
            brand: "Brand B",
            isActive: true
        },
        {
            name: "Running Shoes",
            description: "Comfortable running shoes",
            price: 5000,
            category: "fashion",
            stock: 15,
            brand: "Brand C",
            isActive: true
        }
    ]);


    // ACT
    const response = await request(app)
        .get("/api/v1/products")
        .query({
            search: "laptop"
        });


    // ASSERT
    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.products)
        .toHaveLength(1);

    expect(response.body.data.products[0].name)
        .toBe("Gaming Laptop");

});
    })

});