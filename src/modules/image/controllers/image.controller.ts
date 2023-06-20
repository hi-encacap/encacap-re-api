import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ImageValidationPipe } from '../pipes/image-validation.pipe';
import { ImagesValidationPipe } from '../pipes/images-validation.pipe';
import { ImageService } from '../services/image.service';

@Controller('images')
@UseGuards(JwtAuthGuard)
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(ImageValidationPipe)
  uploadImage(@UploadedFile() file: Express.Multer.File, @Req() { user }) {
    return this.imageService.uploadSingle(file, user);
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  @UsePipes(ImagesValidationPipe)
  uploadMultipleImages(@UploadedFiles() files: Express.Multer.File[], @Req() { user }) {
    return this.imageService.uploadMultiple(files, user);
  }
}
