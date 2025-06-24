import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Pokemon } from '../../src/pokemon/entities/pokemon.entity';
import { PokemonService } from '../../src/pokemon/pokemon.service';

const mockPokemonModel = () => ({
    create: jest.fn(),
    insertMany: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOneAndDelete: jest.fn(),
});

const mockConfigService = () => ({
    get: jest.fn().mockReturnValue(10),
});

describe('PokemonService', () => {
    let service: PokemonService;
    let model: ReturnType<typeof mockPokemonModel>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PokemonService,
                { provide: getModelToken(Pokemon.name), useFactory: mockPokemonModel },
                { provide: ConfigService, useFactory: mockConfigService },
            ],
        }).compile();

        service = module.get<PokemonService>(PokemonService);
        model = module.get(getModelToken(Pokemon.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a pokemon and return it', async () => {
            const dto = { name: 'Pikachu', no: 25 };
            const created = { ...dto, name: 'pikachu' };
            model.create.mockResolvedValue(created);

            const result = await service.create(dto as any);

            expect(model.create).toHaveBeenCalledWith({ name: 'pikachu', no: 25 });
            expect(result).toEqual(created);
        });

        it('should throw error if duplicate', async () => {
            const dto = { name: 'Pikachu', no: 25 };
            model.create.mockRejectedValue({
                code: 11000,
                name: 'MongoServerError',
                errorResponse: { keyValue: { name: 'pikachu' } },
            });

            await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
        });
    });

    describe('findOne', () => {
        it('should return a pokemon by name', async () => {
            const expected = [{ name: 'pikachu', no: 25 }];
            model.find.mockResolvedValue(expected);

            const result = await service.findOne('pikachu');

            expect(model.find).toHaveBeenCalledWith({ name: 'pikachu' });
            expect(result).toEqual(expected);
        });

        it('should throw NotFoundException if no result', async () => {
            model.find.mockResolvedValue([]);

            await expect(service.findOne('notfound')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update and return the pokemon', async () => {
            const updated = { name: 'bulbasaur', no: 1 };
            model.findOneAndUpdate.mockResolvedValue(updated);

            const result = await service.update('bulbasaur', { name: 'bulbasaur' });

            expect(model.findOneAndUpdate).toHaveBeenCalledWith(
                { name: 'bulbasaur' },
                { $set: { name: 'bulbasaur' } },
                { new: true },
            );
            expect(result).toEqual(updated);
        });

        it('should throw BadRequestException if not found', async () => {
            model.findOneAndUpdate.mockResolvedValue(null);

            await expect(service.update('missing', { name: 'test' })).rejects.toThrow(BadRequestException);
        });
    });

    describe('remove', () => {
        it('should delete by MongoID', async () => {
            const id = '507f191e810c19729de860ea';
            model.findByIdAndDelete.mockResolvedValue({ name: 'pikachu' });

            const result = await service.remove(id);

            expect(model.findByIdAndDelete).toHaveBeenCalledWith(id);
            expect(result).toBeUndefined();
        });

        it('should delete by name', async () => {
            model.findOneAndDelete.mockResolvedValue({ name: 'pikachu' });

            const result = await service.remove('pikachu');

            expect(model.findOneAndDelete).toHaveBeenCalledWith({ name: 'pikachu' });
            expect(result).toBeUndefined();
        });

        it('should throw if not found', async () => {
            model.findOneAndDelete.mockResolvedValue(null);

            await expect(service.remove('notfound')).rejects.toThrow(BadRequestException);
        });
    });
});
