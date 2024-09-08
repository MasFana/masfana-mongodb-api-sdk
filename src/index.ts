/**
 * Configuration for MongoDB Data API
 */
type MongoDBEnv = {
  MONGO_API_URL: string;
  MONGO_API_KEY: string;
  DATABASE: string;
  COLLECTION: string;
  DATA_SOURCE: string;
};

/**
 * MongoDB query filter structure with IntelliSense support for common MongoDB query operators.
 *
 * @example
 * ```typescript
 * const filter: MongoDBFilter<Task> = {
 *   status: { $eq: "complete" },
 *   completedAt: { $gt: new Date("2023-01-01") },
 * };
 * ```
 */
type MongoDBFilter<T> = {
  [P in keyof T]?: T[P] | MongoDBOperators<T[P]>;
};

/**
 * MongoDB query operators with IntelliSense explanations.
 */
interface MongoDBOperators<T> {
  /**
   * Matches values that are equal to a specified value.
   * @example
   * ```typescript
   * { $eq: "some value" }
   * ```
   */
  $eq?: T;

  /**
   * Matches all values that are not equal to a specified value.
   * @example
   * ```typescript
   * { $ne: "some value" }
   * ```
   */
  $ne?: T;

  /**
   * Matches values that are greater than a specified value.
   * @example
   * ```typescript
   * { $gt: 5 }
   * ```
   */
  $gt?: T;

  /**
   * Matches values that are greater than or equal to a specified value.
   * @example
   * ```typescript
   * { $gte: 10 }
   * ```
   */
  $gte?: T;

  /**
   * Matches values that are less than a specified value.
   * @example
   * ```typescript
   * { $lt: 10 }
   * ```
   */
  $lt?: T;

  /**
   * Matches values that are less than or equal to a specified value.
   * @example
   * ```typescript
   * { $lte: 5 }
   * ```
   */
  $lte?: T;

  /**
   * Matches any of the values specified in an array.
   * @example
   * ```typescript
   * { $in: ["value1", "value2"] }
   * ```
   */
  $in?: T[];

  /**
   * Matches none of the values specified in an array.
   * @example
   * ```typescript
   * { $nin: ["value1", "value2"] }
   * ```
   */
  $nin?: T[];

  /**
   * Matches documents where the field exists.
   * @example
   * ```typescript
   * { $exists: true }
   * ```
   */
  $exists?: boolean;
}

/**
 * MongoDB projection structure to include/exclude fields.
 * @example
 * ```typescript
 * const projection: MongoDBProjection<Task> = {
 *   text: 1,
 *   status: 1,
 * };
 * ```
 */
type MongoDBProjection<T> = {
  [P in keyof T]?: 1 | 0;
};

/**
 * MongoDB sort structure to define sort order (ascending: 1, descending: -1).
 * @example
 * ```typescript
 * const sort: MongoDBSort<Task> = {
 *   completedAt: -1
 * };
 * ```
 */
type MongoDBSort<T> = {
  [P in keyof T]?: 1 | -1;
};

/**
 * MongoDB aggregation pipeline stages.
 */
type MongoDBPipeline<T> = Array<Record<string, any>>;

// Response types
type FindOneResponse<T> = { document: T | null };
type FindManyResponse<T> = { documents: T[] };
type InsertOneResponse = { insertedId: string };
type InsertManyResponse = { insertedIds: string[] };
type UpdateResponse = {
  matchedCount: number;
  modifiedCount: number;
  upsertedId?: string;
};
type DeleteResponse = { deletedCount: number };
type AggregateResponse<T> = { documents: T[] };

/**
 * Class to interact with MongoDB Data API.
 * Provides methods to perform CRUD operations and aggregation on MongoDB collections.
 */
export class MongoDBAPI<T> {
  private env: MongoDBEnv;

  /**
   * Initializes the MongoDBAPI with environment configuration.
   * @param env - The MongoDB environment configuration.
   */
  constructor(env: MongoDBEnv) {
    this.env = env;
  }

  /**
   * Helper method to make a request to MongoDB Data API.
   * @param endpoint - The API endpoint (e.g., `findOne`, `find`).
   * @param body - The request body to be sent in the API call.
   * @returns The response from the API.
   */
  private async makeRequest<R>(endpoint: string, body: object): Promise<R> {
    const transformedBody = this.transformFilter(body);
    const response = await fetch(`${this.env.MONGO_API_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.env.MONGO_API_KEY,
      },
      body: JSON.stringify(transformedBody),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  }
  /**
   * Transforms a filter to ensure the `_id` field uses the `$oid` format if it's present.
   * @param body - The request body containing the filter.
   * @returns The transformed request body with the `_id` field in the correct format.
   */
  private transformFilter(body: any): any {
    if (body?.filter?._id && typeof body.filter._id === "string") {
      return {
        ...body,
        filter: {
          ...body.filter,
          _id: { $oid: body.filter._id },
        },
      };
    }
    return body;
  }

  /**
   * Finds a single document that matches the filter criteria.
   * @param filter - The filter criteria to match the document.
   * @param projection - Optional projection to specify which fields to include/exclude.
   * @returns A promise that resolves to the found document or null if no match is found.
   * @example
   * ```typescript
   * const task = await mongoAPI.findOne({ status: { $eq: "complete" } });
   * ```
   */
  async findOne(
    filter: MongoDBFilter<T>,
    projection?: MongoDBProjection<T>
  ): Promise<FindOneResponse<T>> {
    const body = {
      dataSource: this.env.DATA_SOURCE,
      database: this.env.DATABASE,
      collection: this.env.COLLECTION,
      filter: filter,
      projection: projection,
    };

    return this.makeRequest<FindOneResponse<T>>("action/findOne", body);
  }

  /**
   * Finds multiple documents that match the filter criteria.
   * @param filter - The filter criteria to match documents.
   * @param projection - Optional projection to specify which fields to include/exclude.
   * @param sort - Optional sorting criteria.
   * @param limit - Optional limit on the number of documents to return.
   * @param skip - Optional number of documents to skip.
   * @returns A promise that resolves to the list of matching documents.
   * @example
   * ```typescript
   * const tasks = await mongoAPI.find(
   *   { status: { $eq: "complete" } },
   *   { text: 1, status: 1 },
   *   { completedAt: -1 },
   *   10
   * );
   * ```
   */
  async find(
    filter: MongoDBFilter<T> = {},
    projection?: MongoDBProjection<T>,
    sort?: MongoDBSort<T>,
    limit?: number,
    skip?: number
  ): Promise<FindManyResponse<T>> {
    const body = {
      dataSource: this.env.DATA_SOURCE,
      database: this.env.DATABASE,
      collection: this.env.COLLECTION,
      filter,
      projection,
      sort,
      limit,
      skip,
    };

    return this.makeRequest<FindManyResponse<T>>("action/find", body);
  }

  /**
   * Inserts a single document into the collection.
   * @param document - The document to be inserted.
   * @returns A promise that resolves to the ID of the inserted document.
   * @example
   * ```typescript
   * const result = await mongoAPI.insertOne({ text: "Clean the room", status: "open" });
   * console.log(result.insertedId);
   * ```
   */
  async insertOne(document: T): Promise<InsertOneResponse> {
    const body = {
      dataSource: this.env.DATA_SOURCE,
      database: this.env.DATABASE,
      collection: this.env.COLLECTION,
      document,
    };

    return this.makeRequest<InsertOneResponse>("action/insertOne", body);
  }

  /**
   * Inserts multiple documents into the collection.
   * @param documents - The list of documents to be inserted.
   * @returns A promise that resolves to the list of IDs of the inserted documents.
   * @example
   * ```typescript
   * const result = await mongoAPI.insertMany([{ text: "Task 1", status: "open" }, { text: "Task 2", status: "open" }]);
   * console.log(result.insertedIds);
   * ```
   */
  async insertMany(documents: T[]): Promise<InsertManyResponse> {
    const body = {
      dataSource: this.env.DATA_SOURCE,
      database: this.env.DATABASE,
      collection: this.env.COLLECTION,
      documents,
    };

    return this.makeRequest<InsertManyResponse>("action/insertMany", body);
  }

  /**
   * Updates a single document that matches the filter criteria.
   * @param filter - The filter criteria to match the document.
   * @param update - The update operations to be applied to the matching document.
   * @param upsert - Optional flag to insert a new document if no match is found.
   * @returns A promise that resolves to the update result.
   * @example
   * ```typescript
   * const result = await mongoAPI.updateOne({ text: "Do laundry" }, { status: "complete" });
   * console.log(result.modifiedCount);
   * ```
   */
  async updateOne(
    filter: MongoDBFilter<T>,
    update: Partial<T>,
    upsert: boolean = false
  ): Promise<UpdateResponse> {
    const body = {
      dataSource: this.env.DATA_SOURCE,
      database: this.env.DATABASE,
      collection: this.env.COLLECTION,
      filter,
      update,
      upsert,
    };

    return this.makeRequest<UpdateResponse>("action/updateOne", body);
  }

  /**
   * Deletes a single document that matches the filter criteria.
   * @param filter - The filter criteria to match the document.
   * @returns A promise that resolves to the deletion result.
   * @example
   * ```typescript
   * const result = await mongoAPI.deleteOne({ text: "Do laundry" });
   * console.log(result.deletedCount);
   * ```
   */
  async deleteOne(filter: MongoDBFilter<T>): Promise<DeleteResponse> {
    const body = {
      dataSource: this.env.DATA_SOURCE,
      database: this.env.DATABASE,
      collection: this.env.COLLECTION,
      filter,
    };

    return this.makeRequest<DeleteResponse>("action/deleteOne", body);
  }

  /**
   * Runs an aggregation pipeline on the collection.
   * @param pipeline - The aggregation pipeline stages.
   * @returns A promise that resolves to the aggregated result.
   * @example
   * ```typescript
   * const result = await mongoAPI.aggregate([
   *   { $match: { status: "complete" } },
   *   { $group: { _id: "$status", count: { $sum: 1 } } }
   * ]);
   * console.log(result.documents);
   * ```
   */
  async aggregate(pipeline: MongoDBPipeline<T>): Promise<AggregateResponse<T>> {
    const body = {
      dataSource: this.env.DATA_SOURCE,
      database: this.env.DATABASE,
      collection: this.env.COLLECTION,
      pipeline,
    };

    return this.makeRequest<AggregateResponse<T>>("action/aggregate", body);
  }
}
