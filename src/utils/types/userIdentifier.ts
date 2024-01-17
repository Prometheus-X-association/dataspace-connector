export type UserIdentifier = {
    /**
     * The email of the user in the Service that registered this user
     */
    email: string;

    /**
     * The ID of the user in the Service that registered this user
     */
    userServiceId: string;
};
