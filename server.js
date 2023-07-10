require("dotenv").config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('./config/dbConnection');

const userRouter = require('./routes/userRoute')

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use('/api', userRouter);

app.use((err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.message = err.message || "erreur de serveur internex";
    res.status(err.statusCode).json({
        message: err.message,
    });

})

app.listen(3000, () => console.log("Serveur est demarrer sur le port 3000"));