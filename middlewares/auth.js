const isAuthorize = async (req, res, next) => {
    try {
        if (!req.headers.authorization ||
            !req.headers.authorization.startsWith('Bearer') ||
            !req.headers.authorization.split('')[1]
        ) {
            return res.status(422).json({
                message: 'Veuillez fournir un token '
            })
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    isAuthorize
}