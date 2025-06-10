import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {


  constructor(
    private readonly pokemonService: PokemonService,
    private http: AxiosAdapter
  ) { }

  async executeSeed() {
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=100');
    data.results.forEach(async (pokemon) => {
      const parts = pokemon.url.split('/').filter(Boolean);
      const no: number = Number(parts[parts.length - 1]);
      pokemon.no = no
    });

    const result = await this.pokemonService.createMany(data.results);
    return result;
  }
}
