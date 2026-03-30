export enum Role{
    MANAGER = "MANAGER",
    ADMIN = "ADMIN",
    GUEST = "GUEST",
    USER="USER"
}
export interface Team{
    id: string,
    name:string
    description?: string|null,
    memebers: User[]//user arrays,
    code: string,
    createdAt: Date,
    updatedAt:Date,
}
export interface User {
    id: string;
    name: string;
    age: number;
    email: string,
    teamId?: string
    team?: Team
    role: Role,
    createdAt: Date,
    updatedAt:Date,
}

export const roleHeirarchy =  {
          [Role.GUEST]: 0,
        [Role.USER]: 1,
        [Role.MANAGER]: 2,
          [Role.ADMIN]: 3,
    }