const { check } = require('express-validator');

exports.signUpValidation = [
    check('firstName', 'le champs nom est obligatoire').not().isEmpty(),
    check('lastName', 'le champs nom est obligatoire').not().isEmpty(),
    check('email', 'le champs email est obligatoire').isEmail().normalizeEmail({ gmail_remove_dots: true }),
    check('password', 'le champs Mot de passe est obligatoire').isLength({ min: 6 }),
    check('user_phone', 'le champs telephone est obligatoire').isLength({ min: 10, max: 10 }),
    check('user_photo').custom((value, { req }) => {

        if (req.file.mimetype == 'image/jpeg' || req.file.mimetype == 'image/png') {
            return true;
        } else {
            return false;
        }

    }).withMessage('Veuillez télécharger une image de type PNG, JPG')
]

exports.loginValidation = [
    check('email', 'le champs email est obligatoire').isEmail().normalizeEmail({ gmail_remove_dots: true }),
    check('password', 'le champs Mot de passe est obligatoire').isLength({ min: 6 }),
]

exports.forgetValidation = [
    check('email', 'le champs email est obligatoire').isEmail().normalizeEmail({ gmail_remove_dots: true }),
]