const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");
const { app, server } = require("../index");
const jwt = require("jsonwebtoken");
const config = require("../config/db.config.js");

let mongoServer;

beforeAll(async () => {
  await mongoose.disconnect();
  mongoServer = new MongoMemoryServer();
  await mongoServer.start();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, { useNewUrlParser: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  server.close();
});

let token, token2;
describe("Registar utilizador", () => {
    it('deve registar um utilizador', async () => {
        const res = await request(app).post('/utilizadores/registo').send({
            nome: "Teste",
            email: "teste@gmail.com",
            password: "teste",
            confirmPassword: "teste",
        });
        expect(res.statusCode).toBe(201);
    })
    it('erro de confirmação de password', async () => {
        const res = await request(app).post('/utilizadores/registo').send({
            nome: "Teste",
            email: "teste@gmail.com",
            password: "teste",
            confirmPassword: "",
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Indique uma confirmação da palavra-passe");
    })
    it('erro de passwords nao coincidem', async () => {
        const res = await request(app).post('/utilizadores/registo').send({
            nome: "Teste",
            email: "teste@gmail.com",
            password: "teste",
            confirmPassword: "teste1",
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("A palavra-passe e a confirmação da palavra-passe não são iguais");
    })
    it('erro de nome nao pode estar vazio', async () => {
        const res = await request(app).post('/utilizadores/registo').send({
            email: "teste@gmail.com",
            password: "teste",
            confirmPassword: "teste1",
        });
        expect(res.statusCode).toBe(400);
    });
    it('erro de password nao pode estar vazio', async () => {
        const res = await request(app).post('/utilizadores/registo').send({
            nome: "Teste",
            email: "teste@gmail.com",
            password: "teste",
            confirmPassword: "teste1",
        });
        expect(res.statusCode).toBe(400);
    });
}); 

describe("Login utilizador", () => {
    it('deve fazer login', async () => {
        const data = await request(app).post('/utilizadores/registo').send({
            nome: "Teste",
            email: "teste@gmail.com",
            password: "teste",
            confirmPassword: "teste",
        });
        const res = await request(app).post('/utilizadores/login').send({
            nome: "Teste",
            password: "teste",
        });
        token = res.body.acessToken;
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Login efetuado com sucesso");
    })
    it('deve fazer login como admin', async () => {
        const res = await request(app).post('/utilizadores/login').send({
            nome: "Admin",
            password: "Esmad_2223",
        });
        token2 = res.body.acessToken;
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Login efetuado com sucesso");
    })
    it('erro de password incorreta', async () => {
        const data = await request(app).post('/utilizadores/registo').send({
            nome: "Teste",
            email: "teste@gmail.com",
            password: "teste",
            confirmPassword: "teste",
        });
        const res = await request(app).post('/utilizadores/login').send({
            nome: "Teste",
            password: "test",
        });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Password inválida");
    })
    it('erro de nome incorreto', async () => {
        const data = await request(app).post('/utilizadores/registo').send({
            nome: "Teste",
            email: "teste@gmail.com",
            password: "teste",
            confirmPassword: "teste",
        });
        const res = await request(app).post('/utilizadores/login').send({
            nome: "Test",
            password: "test",
        });
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Utilizador não encontrado");
    })
    it('erro de campos por preencher', async () => {
        const data = await request(app).post('/utilizadores/registo').send({
            nome: "Teste",
            email: "teste@gmail.com",
            password: "teste",
            confirmPassword: "teste",
        });
        const res = await request(app).post('/utilizadores/login').send({
            nome: "",
            password: "test",
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Tens de fornecer o nome e a password");
    })
});

