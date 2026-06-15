import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.postsService.findOne(id);
  }

  // Ruta estática declarada antes de las rutas con parámetros dinámicos.
  @Post('bulk')
  createBulk(
    @Body(new ParseArrayPipe({ items: CreatePostDto }))
    createPostDtos: CreatePostDto[],
  ) {
    return this.postsService.createBulk(createPostDtos);
  }

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.postsService.remove(id);
  }
}
