const mongoose = require("mongoose");
const request = require("supertest");
const { app, server } = require("../index");
const jwt = require("jsonwebtoken");
const config = require("../config/db.config.js");
const database = process.env.DB_URL;

beforeAll(async () => {
  await mongoose.connect(database, { useNewUrlParser: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  server.close();
});

let token, token2,userID,adminID
describe("Registar utilizador", () => {
  it("deve registar um utilizador", async () => {
    const res = await request(app).post("/utilizadores/registo").send({
      nome: "Teste",
      email: "teste@gmail.com",
      password: "teste",
      confirmPassword: "teste",
    });
    expect(res.statusCode).toBe(201);
  });
  it("erro de confirmação de password", async () => {
    const res = await request(app).post("/utilizadores/registo").send({
      nome: "Teste",
      email: "teste@gmail.com",
      password: "teste",
      confirmPassword: "",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Indique uma confirmação da palavra-passe");
  });
  it("erro de passwords nao coincidem", async () => {
    const res = await request(app).post("/utilizadores/registo").send({
      nome: "Teste",
      email: "teste@gmail.com",
      password: "teste",
      confirmPassword: "teste1",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "A palavra-passe e a confirmação da palavra-passe não são iguais"
    );
  });
  it("erro de nome nao pode estar vazio", async () => {
    const res = await request(app).post("/utilizadores/registo").send({
      email: "teste@gmail.com",
      password: "teste",
      confirmPassword: "teste1",
    });
    expect(res.statusCode).toBe(400);
  });
  it("erro de password nao pode estar vazio", async () => {
    const res = await request(app).post("/utilizadores/registo").send({
      nome: "Teste",
      email: "teste@gmail.com",
      password: "teste",
      confirmPassword: "teste1",
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("Login utilizador", () => {
  it("deve fazer login", async () => {
    const data = await request(app).post("/utilizadores/registo").send({
      nome: "Teste",
      email: "teste@gmail.com",
      password: "teste",
      confirmPassword: "teste",
    });
    const res = await request(app).post("/utilizadores/login").send({
      nome: "Teste",
      password: "teste",
    });
    token = res.body.accessToken;
    let decode = jwt.verify(token, config.SECRET);
    userID = decode.id
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login efetuado com sucesso");
  });
  it("deve fazer login como admin", async () => {
    const res = await request(app).post("/utilizadores/login").send({
      nome: "Admin",
      password: "Esmad_2223",
    });
    token2 = res.body.accessToken;
    let decode = jwt.verify(token2,config.SECRET)
    adminID = decode.id
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login efetuado com sucesso");
  });
  it("erro de password incorreta", async () => {
    const data = await request(app).post("/utilizadores/registo").send({
      nome: "Teste",
      email: "teste@gmail.com",
      password: "teste",
      confirmPassword: "teste",
    });
    const res = await request(app).post("/utilizadores/login").send({
      nome: "Teste",
      password: "test",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Password inválida");
  });
  it("erro de nome incorreto", async () => {
    const data = await request(app).post("/utilizadores/registo").send({
      nome: "Teste",
      email: "teste@gmail.com",
      password: "teste",
      confirmPassword: "teste",
    });
    const res = await request(app).post("/utilizadores/login").send({
      nome: "Test",
      password: "test",
    });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Utilizador não encontrado");
  });
  it("erro de campos por preencher", async () => {
    const data = await request(app).post("/utilizadores/registo").send({
      nome: "Teste",
      email: "teste@gmail.com",
      password: "teste",
      confirmPassword: "teste",
    });
    const res = await request(app).post("/utilizadores/login").send({
      nome: "",
      password: "test",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Tens de fornecer o nome e a password");
  });
});

describe("obter todos os utilizadores", () => {
  it("deve obter todos os utilizadores", async () => {
    const res = await request(app)
      .get("/utilizadores")
      .set("Authorization", `Bearer ${token2}`);
    expect(res.statusCode).toBe(200);
  });
  it("deve dar erro de autorização", async () => {
    const res = await request(app)
      .get("/utilizadores")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });
});

describe('updateUserById', () => {
  it('deve atualizar um utilizador', async()=>{
    const res = await request(app)
      .patch(`/utilizadores/${userID}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        password: "teste2",
        confirmPassword: "teste2",
        biografia:"teste biografia"
      })
    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe("Utilizador atualizado com sucesso!")
  })
  it('deve dar erro de password', async()=>{
    const res = await request(app)
      .patch(`/utilizadores/${userID}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        password: "teste2",
        confirmPassword: "teste2",
      })
    expect(res.statusCode).toBe(400)
    expect(res.body.message).toBe("A nova password não pode ser igual à antiga!")
  })
})
  
describe('delete User', () => {
  it('deve dar erro de autorização', async()=>{
    const res = await request(app)
      .delete(`/utilizadores/${userID}`)
      .set("Authorization", `Bearer ${token}`)
    expect(res.statusCode).toBe(403)
  })
  it('deve eliminar um utilizador', async()=>{
    const res = await request(app)
      .delete(`/utilizadores/${userID}`)
      .set("Authorization", `Bearer ${token2}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.msg).toBe("Utilizador apagado com sucesso")
  })
  it('deve dar erro de utilizador não encontrado', async()=>{
    const res = await request(app)
      .delete(`/utilizadores/${userID}`)
      .set("Authorization", `Bearer ${token2}`)
    expect(res.statusCode).toBe(404)
    expect(res.body.msg).toBe("Este utilizador não existe")
  })
})