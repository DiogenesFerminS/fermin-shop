import { v4 as Uuid } from 'uuid';

export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, name: string) => void,
) => {
  if (!file) return callback(new Error('File is empty'), '');

  const fileExtension = file.mimetype.split('/')[1];

  const newName = `${Uuid()}.${fileExtension}`;

  callback(null, newName);
};
