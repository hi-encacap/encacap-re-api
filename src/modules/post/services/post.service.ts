import { ESTATE_STATUS_ENUM, IREUser, slugify } from '@encacap-group/common/dist/re';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { omit } from 'lodash';
import { BaseService } from 'src/base/base.service';
import { CategoryEntity } from 'src/modules/category/entities/category.entity';
import { CategoryService } from 'src/modules/category/services/category.service';
import { CloudflareImageService } from 'src/modules/cloudflare/services/cloudflare-image.service';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PostCreateBodyDto } from '../dtos/post-create-body.dto';
import { PostListQueryDto } from '../dtos/post-list-query.dto';
import { PostUpdateBodyDto } from '../dtos/post-update-body.dto';
import { PostEntity } from '../entities/post.entity';

@Injectable()
export class PostService extends BaseService {
  constructor(
    @InjectRepository(PostEntity) private readonly postRepository: Repository<PostEntity>,
    private readonly cloudflareImageService: CloudflareImageService,
    private readonly categoryService: CategoryService,
  ) {
    super();
  }

  create(body: PostCreateBodyDto, user?: IREUser) {
    let { code } = body;

    if (!code) {
      code = slugify(body.title);
    }

    const post = this.postRepository.create({
      ...omit(body, 'status'),
      websiteId: user.websiteId,
      code,
    });

    return this.postRepository.save(post);
  }

  async get(query: FindOptionsWhere<PostEntity>) {
    const data = await this.queryBuilder.where(query).getOne();

    if (data) {
      await this.cloudflareImageService.mapVariantToImage(data, 'avatar');
    }

    return data;
  }

  async getAll(query: PostListQueryDto) {
    const queryBuilder = this.queryBuilder;

    if (query.websiteId) {
      this.setFilter(queryBuilder, query.websiteId, 'post.websiteId');
    }

    if (query.categoryId) {
      this.setFilter(queryBuilder, query.categoryId, 'post.categoryId');
    }

    if (query.categoryIds) {
      this.setInFilter(queryBuilder, query.categoryIds, 'post.categoryId');
    }

    if (query.status) {
      this.setFilter(queryBuilder, query.status, 'post.status');
    }

    if (query.statuses) {
      this.setInFilter(queryBuilder, query.statuses, 'post.status');
    }

    if (query.categoryCode) {
      this.setFilter(queryBuilder, query.categoryCode, 'category.code');
    }

    if (query.codes) {
      this.setInFilter(queryBuilder, query.codes, 'post.code');
    }

    if (query.rootCategoryCode) {
      const { items: subCategories } = await this.categoryService.getAll({
        parentCode: query.rootCategoryCode,
      });
      const subCategoryCodes = subCategories.map((subCategory) => subCategory.code);

      this.setInFilter(queryBuilder, subCategoryCodes, 'category.code');
    }

    this.setPagination(queryBuilder, query);

    const [posts, total] = await queryBuilder.getManyAndCount();

    await this.cloudflareImageService.mapVariantToImage(posts, 'avatar');

    return this.generateGetAllResponse(posts, total, query);
  }

  getRandom(query: PostListQueryDto) {
    return this.getAll({
      ...query,
      orderBy: 'RANDOM()',
    });
  }

  unPublish(query: FindOptionsWhere<PostEntity>) {
    return this.postRepository.update(query, { status: ESTATE_STATUS_ENUM.UNPUBLISHED });
  }

  publish(query: FindOptionsWhere<PostEntity>) {
    return this.postRepository.update(query, { status: ESTATE_STATUS_ENUM.PUBLISHED });
  }

  upTopById(id: number) {
    return this.postRepository.update(id, { updatedAt: new Date() });
  }

  updateById(id: number, body: PostUpdateBodyDto) {
    return this.postRepository.update(id, body);
  }

  delete(query: FindOptionsWhere<PostEntity>) {
    return this.postRepository.softDelete(query);
  }

  private get queryBuilder() {
    return this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.avatar', 'avatar')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndMapOne(
        'category.parent',
        CategoryEntity,
        'categoryParent',
        'category.parentId = categoryParent.id',
      )
      .orderBy('post.upvotedAt', 'DESC');
  }
}