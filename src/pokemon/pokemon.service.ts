import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private defaultLimit: any;

  constructor(
    @InjectModel(Pokemon.name)
    // Inject mongoDB service, we use the entity to define the data structure in DB
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = this.configService.get<number | string>('defaultLimit');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleException(error);
    }
  }

  async createMany(createPokemonDto: CreatePokemonDto[]) {
    try {
      const pokemon = await this.pokemonModel.insertMany(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 0, offset = 0 } = paginationDto;

    return this.pokemonModel.find().limit(limit).skip(offset);
  }

  async findOne(id: string) {
    let pokemon;

    const params = !isNaN(+id)
      ? {
          no: id,
        }
      : {
          name: id.toLowerCase(),
        };

    pokemon = await this.pokemonModel.find(params);
    if (!pokemon.length) this.handleException(null, id);

    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    let pokemon: Pokemon;
    const property = !isNaN(+id) ? 'no' : 'name';

    try {
      pokemon = (await this.pokemonModel.findOneAndUpdate(
        { [property]: id },
        { $set: updatePokemonDto },
        { new: true },
      )) as Pokemon;
      if (!pokemon) this.handleException(null, id);
      return pokemon;
    } catch (error) {
      this.handleException(error);
    }
  }

  async remove(id: string) {
    let response;

    // If is Mongo id
    if (isValidObjectId(id)) {
      response = await this.pokemonModel.findByIdAndDelete(id);
    } else {
      const property = !isNaN(+id) ? 'no' : 'name';
      response = await this.pokemonModel.findOneAndDelete({ [property]: id });
    }

    if (!response) this.handleException(id);
    return;
  }

  private handleException(error: any, id?: string) {
    // Not found
    if (id) throw new NotFoundException(`Pokemon ${id} does not exist!`);

    // Duplicate
    if (error.code === 11000) {
      const isBulkAddError = error.name === 'MongoBulkWriteError';

      throw new BadRequestException(
        isBulkAddError
          ? 'Looks like some of the pokemons already exist!'
          : `Pokemon with ${Object.keys(error.errorResponse.keyValue)} '${Object.values(error.errorResponse.keyValue)}' already exist!`,
      );
    }

    // Some other error
    console.log(error);
    throw new BadRequestException('Something went wrong! check logs');
  }
}
