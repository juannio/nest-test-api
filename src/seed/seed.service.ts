import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: 'https://pokeapi.co/api/v2',
      timeout: 5000,
    });
  }

  async executeSeed() {
    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    data.results.forEach((pokemon) => {
      const parts = pokemon.url.split('/').filter(Boolean);
      const lastNumber = Number(parts[parts.length - 1]);
      pokemon.no = lastNumber
    });

    return data.results;
  }
}
