import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {


    // Remember:
    // We use PIPES to validate OR transform (like sanitizing) request data.
    if (!isValidObjectId(value))
      throw new BadRequestException(`Param should be a valid Mongo ID`);
    return value;
  }
}
