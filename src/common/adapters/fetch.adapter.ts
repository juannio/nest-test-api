/* import axios, { AxiosInstance } from "axios";
import { HttpAdapter } from "../interfaces/http-adapter.interface";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FetchAdapter implements HttpAdapter {


    constructor() {
    }

    /async get<T>(url: string): Promise<T> {
        try {
            const response = await fetch(url);
            const data = await JSON.parse(response)
            return data;
        } catch (error) {
            throw new Error('Axios error, check logs');
        }
    } 
} 
*/