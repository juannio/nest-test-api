import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { FindByNameDto } from './dto/find-by-name.dto';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    // Inject mongoDB service, we use the entity to define the data structure in DB
    private readonly pokemonModel: Model<Pokemon>
  ) { }

  async create(createPokemonDto: CreatePokemonDto) {

    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll() {
    return this.pokemonModel.find();
  }

  async findOne(id: string) {

    let pokemon;

    const params = !isNaN(+id) ? {
      no: id,
    } : {
      name: id.toLowerCase(),
    }

    pokemon = await this.pokemonModel.find(params);
    if (!pokemon.length) this.handleException(id);

    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {

    let pokemon: Pokemon;
    const property = !isNaN(+id) ? 'no' : 'name';

    pokemon = await this.pokemonModel.findOneAndUpdate({ [property]: id }, { $set: updatePokemonDto }, { new: true }) as Pokemon;
    if (!pokemon) this.handleException(id);
    return pokemon

  }

  async remove(id: string) {

    let response;

    // If is Mongo id
    if (isValidObjectId(id)) {
      response = await this.pokemonModel.findByIdAndDelete(id);
    } else {
      const property = !isNaN(+id) ? 'no' : 'name';
      response = await this.pokemonModel.findOneAndDelete({ [property]: id })
    }

    if (!response) this.handleException(id);
    return;
  }

  private handleException(error: any, id?: string) {
    // Not found
    if (id) throw new NotFoundException(`Pokemon ${id} does not exist!`);

    // Duplicate
    if (error.code === 11000) {
      const property = Object.keys(error.errorResponse.keyValue);
      const value = Object.values(error.errorResponse.keyValue);
      throw new BadRequestException(`Pokemon with ${property} '${value}' already exist!`)
    }

    // Some other error
    throw new HttpErrorByCode[error.status](error.response.message);
  }
}
