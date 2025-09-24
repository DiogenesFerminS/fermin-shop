import {
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';

@Injectable()
export class ParseFileCustomPipe implements PipeTransform {
  transform(value: Express.Multer.File) {
    const validExtensions = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!validExtensions.includes(value.mimetype))
      throw new UnprocessableEntityException(
        `Invalid type, the allowed formats are the following (jpg, jpeg, png, webp)`,
      );

    return value;
  }
}
