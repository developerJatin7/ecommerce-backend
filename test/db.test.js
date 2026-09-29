import mongoose from "mongoose";
import connectDB from "../src/db/index.js";


beforeAll(async () => {
    await connectDB();
});


afterAll(async () => {
    await mongoose.connection.close();
});


describe("Database Connection", () => {

    test("should connect to the test database", () => {

        const databaseName = mongoose.connection.name;

        console.log("Connected database:", databaseName);

        expect(databaseName).toMatch(/_test$/);

    });

});