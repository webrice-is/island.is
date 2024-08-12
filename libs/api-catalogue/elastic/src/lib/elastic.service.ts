import { Injectable } from '@nestjs/common'
import { Client, ApiResponse } from '@elastic/elasticsearch'
import { environment } from '../environments/environments'
import { Service } from '@island.is/api-catalogue/types'
import { SearchResponse } from '@island.is/shared/types'
import { searchQuery } from './queries/search.model'
import { logger } from '@island.is/logging'
import {
  createAWSConnection,
  awsGetCredentials,
} from '@acuris/aws-es-connection'

const { elastic } = environment

type RequestBodyType<T = Record<string, unknown>> = T | string | Buffer

@Injectable()
export class ElasticService {
  private client?: Client
  private indexName = 'apicatalogue'

  /**
   * Tries to delete the index.
   * If the index does not exists it does nothing.
   */
  async deleteIndex(): Promise<void> {
    logger.info('Deleting index', this.indexName)
    const client = await this.getClient()

    const { body } = await client.indices.exists({
      index: this.indexName,
    })
    if (body) {
      await client.indices.delete({ index: this.indexName })
      logger.info(`Index ${this.indexName} deleted`)
    } else {
      logger.info('No index to delete', this.indexName)
    }
  }

  /**
   * Accepts array of Services to bulk insert into elastic search.
   */
  async bulk(services: Array<Service>): Promise<void> {
    logger.info('Bulk insert', services)

    if (services.length) {
      const bulk: (Service | { index: { _index: string; _id: string } })[] =
        services.flatMap((service) => [
          {
            index: {
              _index: this.indexName,
              _id: service.id,
            },
          },
          service,
        ])

      const client = await this.getClient()
      await client.bulk({
        body: bulk,
        index: this.indexName,
      })
    }

    logger.debug('nothing to bulk insert')
  }

  async fetchAll(
    //Set the default limit to fetch 25 services
    limit = 25,
    searchAfter?: string[],
    query?: string,
    pricing?: string[],
    data?: string[],
    type?: string[],
    access?: string[],
  ): Promise<ApiResponse<SearchResponse<Service>>> {
    logger.debug('Fetch paginated results')

    const requestBody = searchQuery({
      limit,
      searchAfter,
      query,
      pricing,
      data,
      type,
      access,
    })

    return this.search<SearchResponse<Service>, typeof requestBody>(requestBody)
  }

  async fetchById(id: string): Promise<ApiResponse<SearchResponse<Service>>> {
    logger.info('Fetch by id')
    const requestBody = {
      query: { bool: { must: { term: { _id: id } } } },
    }
    return this.search<SearchResponse<Service>, typeof requestBody>(requestBody)
  }

  async search<ResponseBody, RequestBody extends RequestBodyType>(
    query: RequestBody,
  ) {
    logger.debug('Searching for', query)
    const client = await this.getClient()
    return await client.search<ResponseBody, RequestBody>({
      body: query,
      index: this.indexName,
    })
  }

  async deleteByIds(ids: Array<string>) {
    if (!ids.length) {
      return
    }

    logger.info('Deleting based on indexes', { ids })
    const client = await this.getClient()
    return await client.delete_by_query({
      index: this.indexName,
      body: {
        query: {
          bool: {
            must: ids.map((id) => ({ match: { _id: id } })),
          },
        },
      },
    })
  }

  async deleteAllExcept(excludeIds: Array<string>) {
    logger.info('Deleting everything except', { excludeIds })
    const client = await this.getClient()
    return await client.delete_by_query({
      index: this.indexName,
      body: {
        query: {
          bool: {
            must_not: excludeIds.map((id) => ({ match: { _id: id } })),
          },
        },
      },
    })
  }

  async ping() {
    const client = await this.getClient()
    const result = await client.ping().catch((error) => {
      logger.error('Error in ping', error)
    })
    logger.info('Got elasticsearch ping response')
    return result
  }

  private async getClient(): Promise<Client> {
    if (this.client) {
      return this.client
    }
    this.client = await this.createEsClient()
    return this.client
  }

  private async createEsClient(): Promise<Client> {
    const hasAWS =
      'AWS_WEB_IDENTITY_TOKEN_FILE' in process.env ||
      'AWS_SECRET_ACCESS_KEY' in process.env

    if (!hasAWS) {
      return new Client({
        node: elastic.node,
      })
    }

    return new Client({
      ...createAWSConnection(await awsGetCredentials()),
      node: elastic.node,
    })
  }
}
