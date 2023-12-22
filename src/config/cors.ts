export const publicCorsOptions = {
    origin: "*",
    methods: ["GET", "POST"],
};

export const privateCorsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
};
