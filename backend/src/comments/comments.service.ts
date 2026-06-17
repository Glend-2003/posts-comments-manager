import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../posts/schemas/post.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const postExists = await this.postModel
      .exists({ _id: createCommentDto.postId })
      .exec();
    if (!postExists) {
      throw new NotFoundException(
        `El post con id ${createCommentDto.postId} no existe`,
      );
    }

    const createdComment = new this.commentModel(createCommentDto);
    return createdComment.save();
  }

  async findByPost(postId: string): Promise<Comment[]> {
    return this.commentModel.find({ postId }).exec();
  }

  async remove(id: string): Promise<Comment> {
    const deletedComment = await this.commentModel.findByIdAndDelete(id).exec();
    if (!deletedComment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }
    return deletedComment;
  }
}
