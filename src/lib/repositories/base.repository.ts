import { PrismaClient, Prisma } from '@prisma/client'

export interface QueryOptions {
  skip?: number
  take?: number
  orderBy?: Record<string, 'asc' | 'desc'>
  select?: object
  include?: object
}

export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>
  findMany(filter: object, options?: QueryOptions): Promise<T[]>
  create(data: Prisma.Args<any, 'create'>['data']): Promise<T>
  update(id: string, data: Prisma.Args<any, 'update'>['data']): Promise<T>
  delete(id: string): Promise<boolean>
  count(filter: object): Promise<number>
}

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected model: any

  constructor(protected prisma: PrismaClient, modelName: Prisma.ModelName) {
    this.model = prisma[modelName.toLowerCase() as keyof PrismaClient]
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } })
  }

  async findMany(filter: object, options?: QueryOptions): Promise<T[]> {
    return this.model.findMany({
      where: filter,
      ...options,
    })
  }

  async create(data: Prisma.Args<any, 'create'>['data']): Promise<T> {
    return this.model.create({ data })
  }

  async update(id: string, data: Prisma.Args<any, 'update'>['data']): Promise<T> {
    return this.model.update({ where: { id }, data })
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.model.delete({ where: { id } })
      return true
    } catch (error) {
      return false
    }
  }

  async count(filter: object): Promise<number> {
    return this.model.count({ where: filter })
  }
}
