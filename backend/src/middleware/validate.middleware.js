export const validate = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.body);

            req.validatedData = validatedData;

            next();

        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.errors,
            });
        }
    };
};