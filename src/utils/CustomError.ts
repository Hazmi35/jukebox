export function CustomError(name: string, message?: string | undefined): Error {
    const error = new Error(message);
    error.name = name;
    return error;
}
