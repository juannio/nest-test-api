import { Test, TestingModule } from '@nestjs/testing';
import { PokemonService } from '../../src/pokemon/pokemon.service';
import { getModelToken } from '@nestjs/mongoose';
import { Pokemon } from '../../src/pokemon/entities/pokemon.entity';

describe('PokemonService', () => {
    let service: PokemonService;
    let model: any;

    const mockPokemonModel = {
        find: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue([{ name: 'pikachu', no: 1 }]),
        create: jest.fn().mockImplementation((dto) => Promise.resolve({ _id: 'abc123', ...dto })),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PokemonService,
                {
                    provide: getModelToken(Pokemon.name),
                    useValue: mockPokemonModel,
                },
            ],
        }).compile();

        service = module.get<PokemonService>(PokemonService);
        model = module.get(getModelToken(Pokemon.name));
    });

    it('IT Should be defined ok', () => {
        expect(service).toBeDefined();
    });

    it('should return all pokemons (paginated)', async () => {
        const result = await service.findAll({ limit: 10, offset: 0 });
        expect(model.find).toHaveBeenCalled();
        expect(model.limit).toHaveBeenCalledWith(10);
        expect(model.skip).toHaveBeenCalledWith(0);
        expect(result).toEqual([{ name: 'pikachu', no: 1 }]);
    });

    it('should create a new pokemon', async () => {
        const newPokemon = { name: 'Bulbasaur', no: 2 };
        const result = await service.create({ name: 'Bulbasaur', no: 2 });
        expect(model.create).toHaveBeenCalledWith({ name: 'bulbasaur', no: 2 });
        expect(result).toEqual({ _id: 'abc123', name: 'bulbasaur', no: 2 });
    });
});
