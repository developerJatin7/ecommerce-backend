import request from "supertest";
import mongoose from "mongoose";

import app from "../src/app.js";
import connectDB from "../src/db/index.js";
import { User } from "../src/models/user.model.js";


beforeAll(async () => {
    await connectDB();

    // Safety check
    if (!mongoose.connection.name.endsWith("_test")) {
        throw new Error(
            `Unsafe database detected: ${mongoose.connection.name}`
        );
    }
});


afterEach(async () => {
    await User.deleteMany({});
});


afterAll(async () => {
    await mongoose.connection.close();
});


describe("Auth API", () => {

    describe("POST /api/v1/users/register", () => {

        test("should register a new user", async () => {

            const userData = {
                name: "Test User",
                email: "testuser@example.com",
                password: "password123"
            };

            const response = await request(app)
                .post("/api/v1/users/register")
                .send(userData);


            // 1. Check HTTP status
            expect(response.statusCode).toBe(201);


            // 2. Check API success
            expect(response.body.success).toBe(true);


            // 3. Check returned user
            expect(response.body.data.user.email)
                .toBe(userData.email);

            expect(response.body.data.user.name)
                .toBe(userData.name);


            // 4. Password should NOT be returned
            expect(response.body.data.user.password)
                .toBeUndefined();


            // 5. Check user actually exists in MongoDB
            const savedUser = await User.findOne({
                email: userData.email
            });

            expect(savedUser).not.toBeNull();


            // 6. Password should be hashed in database
            expect(savedUser.password)
                .not.toBe(userData.password);

        });

        test("should reject registration with invalid email", async () => {

            const response = await request(app)
                .post("/api/v1/users/register")
                .send({
                    name: "Test User",
                    email: "not-an-email",
                    password: "password123"
                });


            expect(response.statusCode).toBe(400);

            expect(response.body.success).toBe(false);

        });

        test("should reject registration with short password", async () => {

            const response = await request(app)
                .post("/api/v1/users/register")
                .send({
                    name: "Test User",
                    email: "testuser@example.com",
                    password: "123"
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);

        });

        test("should reject registration with duplicate email", async () => {

            const userData = {
                name: "Test User",
                email: "testuser@example.com",
                password: "password123"
            };

            // First registration
            const firstResponse = await request(app)
                .post("/api/v1/users/register")
                .send(userData);

            expect(firstResponse.statusCode).toBe(201);


            // Second registration with same email
            const secondResponse = await request(app)
                .post("/api/v1/users/register")
                .send(userData);

            expect(secondResponse.statusCode).not.toBe(201);
            expect(secondResponse.body.success).toBe(false);

        });

    });

    describe("POST /api/v1/users/login", () => {

        const userData = {
            name: "Login Test User",
            email: "logintest@example.com",
            password: "password123"
        };


        beforeEach(async () => {

            await request(app)
                .post("/api/v1/users/register")
                .send(userData);

        });


        test("should login user with correct credentials", async () => {

            const response = await request(app)
                .post("/api/v1/users/login")
                .send({
                    email: userData.email,
                    password: userData.password
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.success).toBe(true);

            // Check returned user
            expect(response.body.data.user.email)
                .toBe(userData.email);

            // Password must never be returned
            expect(response.body.data.user.password)
                .toBeUndefined();

            // Tokens should exist
            expect(response.body.data.accessToken)
                .toBeDefined();

            expect(response.body.data.refreshToken)
                .toBeDefined();

        });

        test("should reject login with wrong password", async () => {

            const response = await request(app)
                .post("/api/v1/users/login")
                .send({
                    email: userData.email,
                    password: "wrongpassword"
                });

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);

        });

        test("should reject login when user does not exist", async () => {

            const response = await request(app)
                .post("/api/v1/users/login")
                .send({
                    email: "doesnotexist@example.com",
                    password: "password123"
                });

            expect(response.statusCode).toBe(404);
            expect(response.body.success).toBe(false);

        });

    });

    describe("GET /api/v1/users/me", () => {

    const userData = {
        name: "Protected Test User",
        email: "protected@example.com",
        password: "password123"
    };


    test("should return current user with valid access token", async () => {

        // 1. Register user
        await request(app)
            .post("/api/v1/users/register")
            .send(userData);


        // 2. Login user
        const loginResponse = await request(app)
            .post("/api/v1/users/login")
            .send({
                email: userData.email,
                password: userData.password
            });


        // 3. Get access token
        const accessToken =
            loginResponse.body.data.accessToken;


        expect(accessToken).toBeDefined();


        // 4. Access protected route
        const response = await request(app)
            .get("/api/v1/users/me")
            .set(
                "Authorization",
                `Bearer ${accessToken}`
            );


        // 5. Check response
        expect(response.statusCode).toBe(200);

        expect(response.body.success).toBe(true);

    });

    test("should reject request without access token", async () => {

    const response = await request(app)
        .get("/api/v1/users/me");


    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);

});

test("should reject request with invalid access token", async () => {

    const response = await request(app)
        .get("/api/v1/users/me")
        .set(
            "Authorization",
            "Bearer this-is-not-a-valid-jwt"
        );

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);

});

});

}); 