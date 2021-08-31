import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";

interface UserType{
    email:string;
    password:string;
}

export class UserController {
    private userRepository = getRepository(User);

    async all(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.find();
    }

    async one(email:string) {
        return this.userRepository.findOne();
    }

    async save({email, password}:UserType) {
       return this.userRepository.save({email, password})
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        let userToRemove = await this.userRepository.findOne(request.params.id);
        await this.userRepository.remove(userToRemove);
    }

}