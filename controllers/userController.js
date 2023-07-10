const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const db = require('../config/dbConnection');

const randomstring = require('randomstring');
const sendMail = require('../helpers/sendMail');

const { JsonWebTokenError } = require('jsonwebtoken');

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const register = (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    db.query(
        `SELECT * FROM userBalance WHERE email = ${db.escape(
            req.body.email
        )};`,
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    msg: 'Une erreur est survenue lors de la vérification de l\'utilisateur.' + err
                });
            }

            if (result.length > 0) {
                return res.status(409).send({
                    msg: 'Cet utilisateur est déjà utilisé!'
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
                    if (err) {
                        return res.status(500).send({
                            msg: 'Une erreur est survenue lors du hachage du mot de passe.'
                        });
                    } else {
                        db.query(
                            `INSERT INTO userBalance (firstName, lastName, email, password, user_phone, user_photo) 
                            VALUES (${db.escape(req.body.firstName)}, ${db.escape(req.body.lastName)}, ${db.escape(req.body.email)}, ${db.escape(hashedPassword)}, ${db.escape(req.body.user_phone)},  'images/${req.file.filename}');`,
                            (err, result) => {
                                if (err) {
                                    return res.status(500).send({
                                        msg: "Une erreur s'est produite lors de l'enregistrement de l'utilisateur." + err
                                    });
                                } else {
                                    return res.status(200).send({
                                        msg: "L'utilisateur a été enregistré avec succès !"
                                    });
                                }
                            }
                        );

                    }
                });
            }
        }
    );
};

const login = (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    db.query(
        `SELECT * FROM userBalance WHERE email = ${db.escape(req.body.email)};`,
        (err, result) => {

            if (err) {
                return res.status(400).send({
                    msg: err
                });
            }

            if (!result.length) {
                return res.status(401).send({
                    msg: 'Email ou mot de passe est incorrect!'
                });
            }

            bcrypt.compare(
                req.body.password,
                result[0]['password'],
                (bErr, bResult) => {
                    if (bErr) {
                        return res.status(400).send({
                            msg: bErr
                        })
                    }
                    if (bResult) {
                        console.log(JWT_SECRET)
                        const token = jwt.sign({ id: result[0]['id'], is_admin: result[0]['is_admin'] }, JWT_SECRET, { expiresIn: '2h' })
                        db.query(
                            `UPDATE userBalance SET last_login = now() WHERE id = '${result[0]['id']}'`
                        );

                        return res.status(200).send({
                            msg: 'connecté',
                            token,
                            user: result[0]
                        })

                    }

                    if (err) {
                        return res.status(400).send({
                            msg: err
                        })
                    }
                }
            );

        }
    )

}

const getUser = (req, res) => {

    const authToken = req.headers.authorization.split('')[1];
    const decode = jwt.verify(authToken, JWT_SECRET);

    db.query(`SELECT * FROM userBalance WHERE id=?`, decode.id, function name(error, result, fields) {
        if (error) throw error;

        return res.status(200).send({ success: true, data: result[0], message: 'récupérer avec succès' });
    })

}

const forgetpassword = (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    var email = req.body.email;
    db.query('SELECT * FROM userBalance WHERE email=? limit 1', email, function (error, result, fields) {

        if (error) {
            return res.status(400).json({ message: errors });
        }

        if (result.length > 0) {

            let mailSubject = 'Mot de passe Oublié';
            const randomString = randomstring.generate();
            let content = '<p>Salut, ' + result[0].name + ' \
                Veuillez <a href="http://127.0.0.1:3000/reset-password?token='+ randomString + '"> Cliquer Ici</a> pour réinitialiser votre mot de passe </p> \
            ';

            sendMail(email, mailSubject, content);

            db.query(
                `DELETE FROM password_resets where  email=${db.escape(result[0].email)}`
            );

            db.query(
                `INSERT INTO password_resets (email, token) VALUES(${db.escape(result[0].email)}, '${randomString}')`
            );
        }

        return res.status(200).send({
            message: "Adresse email envoyer avec sucess"
        })

    });

}

module.exports = { register, login, getUser, forgetpassword };
