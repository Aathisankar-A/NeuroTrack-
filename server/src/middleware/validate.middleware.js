/**
 * Middleware for validating request body against a Zod schema.
 */
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        return res.status(422).json({
            success: false,
            statusCode: 422,
            error: 'Validation failed',
            issues: errors,
        });
    }

    req.body = result.data; // Replace body with parsed/coerced data
    next();
};

export default validate;
