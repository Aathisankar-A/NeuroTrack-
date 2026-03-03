class ApiResponse {
    constructor(statusCode, data, message = 'Success') {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
    }

    static success(data, message = 'Success', code = 200) {
        return new ApiResponse(code, data, message);
    }

    static error(error, code = 500) {
        return {
            success: false,
            statusCode: code,
            error: error,
        };
    }
}

export default ApiResponse;
