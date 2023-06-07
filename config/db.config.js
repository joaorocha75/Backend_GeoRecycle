const config = {
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    DB: process.env.DB_NAME,
    SECRET : process.env.SECRET,

    C_CLOUD_NAME: process.env.C_CLOUD_NAME,
    C_API_KEY: process.env.C_API_KEY,
    C_API_SECRET: process.env.C_API_SECRET
}

config.URL = `mongodb+srv://${config.USER}:${config.PASSWORD}@cluster0.smvglxb.mongodb.net/${config.DB}?retryWrites=true&w=majority`;


module.exports = config;