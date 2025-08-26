# Package Utilities Quick Reference

## @system/core

### ArrayUtils
- `chunk<T>(array: T[], size: number): T[][]` - Split array into chunks: `ArrayUtils.chunk([1,2,3,4], 2) → [[1,2], [3,4]]`
- `unique<T>(array: T[]): T[]` - Remove duplicates: `ArrayUtils.unique([1,2,2,3]) → [1,2,3]`
- `uniqueBy<T>(array: T[], key: keyof T): T[]` - Remove duplicates by key: `ArrayUtils.uniqueBy(users, 'id') → unique users`
- `groupBy<T>(array: T[], key: keyof T): Record<string, T[]>` - Group by key: `ArrayUtils.groupBy(users, 'role') → {admin: [...], user: [...]}`
- `sortBy<T>(array: T[], key: keyof T, direction?: 'asc'|'desc'): T[]` - Sort by key: `ArrayUtils.sortBy(users, 'name', 'asc') → sorted users`
- `flatten<T>(array: Array<T | T[]>): T[]` - Flatten nested arrays: `ArrayUtils.flatten([1, [2, 3]]) → [1,2,3]`
- `intersection<T>(array1: T[], array2: T[]): T[]` - Common elements: `ArrayUtils.intersection([1,2], [2,3]) → [2]`
- `difference<T>(array1: T[], array2: T[]): T[]` - Elements in first not in second: `ArrayUtils.difference([1,2], [2,3]) → [1]`
- `shuffle<T>(array: T[]): T[]` - Randomize order: `ArrayUtils.shuffle([1,2,3]) → [3,1,2]`
- `sample<T>(array: T[], count?: number): T[]` - Random sample: `ArrayUtils.sample([1,2,3,4], 2) → [2,4]`
- `partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]]` - Split by condition: `ArrayUtils.partition(nums, x => x > 5) → [[6,7], [1,2]]`

### StringUtils
- `isEmpty(str: string | null | undefined): boolean` - Check if empty: `StringUtils.isEmpty('  ') → true`
- `isNotEmpty(str: string | null | undefined): boolean` - Check if not empty: `StringUtils.isNotEmpty('text') → true`
- `toCamelCase(str: string): string` - Convert to camelCase: `StringUtils.toCamelCase('hello-world') → 'helloWorld'`
- `toPascalCase(str: string): string` - Convert to PascalCase: `StringUtils.toPascalCase('hello-world') → 'HelloWorld'`
- `toKebabCase(str: string): string` - Convert to kebab-case: `StringUtils.toKebabCase('HelloWorld') → 'hello-world'`
- `toSnakeCase(str: string): string` - Convert to snake_case: `StringUtils.toSnakeCase('HelloWorld') → 'hello_world'`
- `capitalize(str: string): string` - Capitalize first letter: `StringUtils.capitalize('hello') → 'Hello'`
- `truncate(str: string, length: number, suffix?: string): string` - Truncate with suffix: `StringUtils.truncate('hello world', 5) → 'he...'`
- `slugify(str: string): string` - Create URL slug: `StringUtils.slugify('Hello World!') → 'hello-world'`
- `mask(str: string, visibleChars?: number, maskChar?: string): string` - Mask string: `StringUtils.mask('1234567890', 4) → '******7890'`
- `generateRandomString(length: number, charset?: string): string` - Random string: `StringUtils.generateRandomString(8) → 'aB3xY9mK'`
- `isEmail(email: string): boolean` - Validate email: `StringUtils.isEmail('test@example.com') → true`
- `isUrl(url: string): boolean` - Validate URL: `StringUtils.isUrl('https://example.com') → true`
- `extractNumbers(str: string): number[]` - Extract numbers: `StringUtils.extractNumbers('abc123def456') → [123, 456]`
- `removeHtml(str: string): string` - Strip HTML tags: `StringUtils.removeHtml('<p>Hello</p>') → 'Hello'`
- `escapeHtml(str: string): string` - Escape HTML: `StringUtils.escapeHtml('<script>') → '&lt;script&gt;'`

### ObjectUtils
- `deepClone<T>(obj: T): T` - Deep copy object: `ObjectUtils.deepClone(user) → cloned user`
- `deepMerge<T>(target: T, ...sources: Partial<T>[]): T` - Deep merge objects: `ObjectUtils.deepMerge(obj1, obj2) → merged object`
- `pick<T, K>(obj: T, keys: K[]): Pick<T, K>` - Select properties: `ObjectUtils.pick(user, ['id', 'name']) → {id: 1, name: 'John'}`
- `omit<T, K>(obj: T, keys: K[]): Omit<T, K>` - Exclude properties: `ObjectUtils.omit(user, ['password']) → user without password`
- `isEmpty(obj: any): boolean` - Check if empty: `ObjectUtils.isEmpty({}) → true`
- `isObject(item: any): boolean` - Check if object: `ObjectUtils.isObject({}) → true`
- `flatten(obj: Record<string, any>, prefix?: string): Record<string, any>` - Flatten nested object: `ObjectUtils.flatten({a: {b: 1}}) → {'a.b': 1}`
- `unflatten(obj: Record<string, any>): Record<string, any>` - Unflatten object: `ObjectUtils.unflatten({'a.b': 1}) → {a: {b: 1}}`
- `getNestedValue(obj: any, path: string): any` - Get nested value: `ObjectUtils.getNestedValue(obj, 'user.profile.name') → 'John'`
- `setNestedValue(obj: any, path: string, value: any): void` - Set nested value: `ObjectUtils.setNestedValue(obj, 'user.name', 'Jane')`
- `removeUndefined<T>(obj: T): T` - Remove undefined props: `ObjectUtils.removeUndefined({a: 1, b: undefined}) → {a: 1}`
- `compareObjects(obj1: any, obj2: any): boolean` - Compare objects: `ObjectUtils.compareObjects(obj1, obj2) → true`

### DateUtils
- `format(date: Date, format: string): string` - Format date: `DateUtils.format(new Date(), 'yyyy-MM-dd') → '2024-01-15'`
- `addDays(date: Date, days: number): Date` - Add days: `DateUtils.addDays(new Date(), 7) → date + 7 days`
- `addHours(date: Date, hours: number): Date` - Add hours: `DateUtils.addHours(new Date(), 2) → date + 2 hours`
- `addMinutes(date: Date, minutes: number): Date` - Add minutes: `DateUtils.addMinutes(new Date(), 30) → date + 30 minutes`
- `subtractDays(date: Date, days: number): Date` - Subtract days: `DateUtils.subtractDays(new Date(), 3) → date - 3 days`
- `isExpired(date: Date): boolean` - Check if past: `DateUtils.isExpired(pastDate) → true`
- `isFuture(date: Date): boolean` - Check if future: `DateUtils.isFuture(futureDate) → true`
- `getAge(birthDate: Date): number` - Calculate age: `DateUtils.getAge(birthDate) → 25`
- `daysBetween(date1: Date, date2: Date): number` - Days difference: `DateUtils.daysBetween(date1, date2) → 5`
- `isWeekend(date: Date): boolean` - Check weekend: `DateUtils.isWeekend(new Date()) → false`
- `isWeekday(date: Date): boolean` - Check weekday: `DateUtils.isWeekday(new Date()) → true`
- `startOfDay(date: Date): Date` - Start of day: `DateUtils.startOfDay(date) → date at 00:00:00`
- `endOfDay(date: Date): Date` - End of day: `DateUtils.endOfDay(date) → date at 23:59:59`
- `toISOString(date: Date): string` - ISO string: `DateUtils.toISOString(date) → '2024-01-15T10:30:00.000Z'`
- `fromISOString(isoString: string): Date` - Parse ISO: `DateUtils.fromISOString('2024-01-15T10:30:00.000Z') → Date`
- `isValidDate(date: any): boolean` - Validate date: `DateUtils.isValidDate(new Date()) → true`

### CryptoUtils
- `hash(data: string, algorithm?: string): string` - Hash data: `CryptoUtils.hash('password') → 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'`
- `hmac(data: string, secret: string, algorithm?: string): string` - HMAC: `CryptoUtils.hmac('data', 'secret') → 'hmac_hash'`
- `randomBytes(size: number): Buffer` - Random bytes: `CryptoUtils.randomBytes(16) → Buffer`
- `randomString(length: number): string` - Random string: `CryptoUtils.randomString(10) → 'a1b2c3d4e5'`
- `encrypt(text: string, key: string): {encrypted: string, iv: string}` - Encrypt: `CryptoUtils.encrypt('secret', key) → {encrypted: '...', iv: '...'}`
- `decrypt(encryptedData: {encrypted: string, iv: string}, key: string): string` - Decrypt: `CryptoUtils.decrypt(encrypted, key) → 'secret'`
- `generateKeyPair(): {publicKey: string, privateKey: string}` - Key pair: `CryptoUtils.generateKeyPair() → {publicKey: '...', privateKey: '...'}`
- `sign(data: string, privateKey: string): string` - Sign data: `CryptoUtils.sign('data', privateKey) → 'signature'`
- `verify(data: string, signature: string, publicKey: string): boolean` - Verify signature: `CryptoUtils.verify('data', sig, publicKey) → true`

### Guard
- `againstNullOrUndefined(value: any, argumentName: string): void` - Null check: `Guard.againstNullOrUndefined(value, 'userId')`
- `againstNullOrUndefinedBulk(args: Array<{argument: any, argumentName: string}>): void` - Bulk null check: `Guard.againstNullOrUndefinedBulk([{argument: id, argumentName: 'id'}])`
- `isOneOf(value: any, validValues: any[], argumentName: string): void` - Value in list: `Guard.isOneOf(status, ['active', 'inactive'], 'status')`
- `againstAtLeast(numChars: number, text: string, argumentName: string): void` - Min length: `Guard.againstAtLeast(3, name, 'name')`
- `againstAtMost(numChars: number, text: string, argumentName: string): void` - Max length: `Guard.againstAtMost(50, name, 'name')`
- `againstEmpty(text: string, argumentName: string): void` - Not empty: `Guard.againstEmpty(email, 'email')`

### Result<T>
- `Result.ok<T>(value: T): Result<T>` - Success result: `Result.ok(user) → {isSuccess: true, value: user}`
- `Result.fail<T>(error: string): Result<T>` - Failure result: `Result.fail('Error message') → {isFailure: true, error: 'Error message'}`
- `result.isSuccess: boolean` - Check success: `result.isSuccess → true`
- `result.isFailure: boolean` - Check failure: `result.isFailure → false`
- `result.value: T` - Get value: `result.value → user data`
- `result.error: string` - Get error: `result.error → 'Error message'`

### Services
- `CacheService.get<T>(key: string): Promise<Result<T | null>>` - Get cached value: `await cacheService.get('user:123') → Result<User>`
- `CacheService.set<T>(key: string, value: T, options?: CacheOptions): Promise<Result<void>>` - Cache value: `await cacheService.set('user:123', user, {ttl: 3600})`
- `CacheService.delete(key: string): Promise<Result<boolean>>` - Delete cached: `await cacheService.delete('user:123') → Result<boolean>`
- `CacheService.invalidateByTag(tag: string): Promise<Result<number>>` - Clear by tag: `await cacheService.invalidateByTag('users') → Result<number>`
- `EventBusService.publish(event: DomainEvent): void` - Publish event: `eventBus.publish({type: 'UserCreated', data: user})`
- `CryptoService.encrypt(data: string): Promise<Result<string>>` - Encrypt data: `await cryptoService.encrypt('sensitive') → Result<string>`
- `CryptoService.decrypt(encryptedData: string): Promise<Result<string>>` - Decrypt data: `await cryptoService.decrypt(encrypted) → Result<string>`

### Decorators
- `@Retry(options?: RetryOptions)` - Retry on failure: `@Retry({maxAttempts: 3, backoff: 'exponential'})`

### Swagger Decorators
- `@ApiStandardOperation(summary: string, description?: string)` - Standard API doc: `@ApiStandardOperation('Get user', 'Retrieve user by ID')`
- `@ApiCreateOperation<T>(model: T, summary: string)` - Create API doc: `@ApiCreateOperation(UserDto, 'Create user')`
- `@ApiUpdateOperation<T>(model: T, summary: string)` - Update API doc: `@ApiUpdateOperation(UserDto, 'Update user')`
- `@ApiDeleteOperation(summary: string)` - Delete API doc: `@ApiDeleteOperation('Delete user')`
- `@ApiPaginatedOperation<T>(model: T, summary: string)` - Paginated API doc: `@ApiPaginatedOperation(UserDto, 'List users')`
- `@ApiFileUpload(summary: string)` - File upload API doc: `@ApiFileUpload('Upload avatar')`
- `@ApiPaginationQuery()` - Pagination query params: `@ApiPaginationQuery()`
- `@ApiSearchQuery()` - Search query params: `@ApiSearchQuery()`

## @system/security

### EncryptionService
- `hashPassword(password: string): Promise<Result<HashResult>>` - Hash password: `await encryptionService.hashPassword('password123') → Result<{hash, salt}>`
- `verifyPassword(password: string, hash: string): Promise<Result<boolean>>` - Verify password: `await encryptionService.verifyPassword('password123', hash) → Result<boolean>`
- `encrypt(data: string): Promise<Result<string>>` - Encrypt data: `await encryptionService.encrypt('sensitive') → Result<string>`
- `decrypt(encryptedData: string): Promise<Result<string>>` - Decrypt data: `await encryptionService.decrypt(encrypted) → Result<string>`
- `generateSecureToken(length?: number): Result<string>` - Generate token: `encryptionService.generateSecureToken(32) → Result<string>`

## @system/validation

### ValidationService
- `validateObject<T>(obj: T, rules: ValidationRules): Promise<ValidationResult>` - Validate object: `await validationService.validateObject(user, {email: ['required', 'email']}) → {isValid: boolean, errors: []}`
- `addCustomValidator(name: string, validator: ValidatorFunction): void` - Add validator: `validationService.addCustomValidator('strongPassword', (value) => /regex/.test(value))`

### AdvancedValidationService
- `validateSchema<T>(data: T, schema: ValidationSchema): Promise<ValidationResult>` - Schema validation: `await advancedValidationService.validateSchema(data, schema) → ValidationResult`

## @system/monitoring

### MetricsService
- `createCounter(name: string, help: string, labels?: string[]): void` - Create counter: `metricsService.createCounter('requests_total', 'Total requests')`
- `incrementCounter(name: string, value?: number, labels?: Record<string, string>): void` - Increment counter: `metricsService.incrementCounter('requests_total', 1, {method: 'GET'})`
- `createGauge(name: string, help: string, labels?: string[]): void` - Create gauge: `metricsService.createGauge('active_users', 'Active users')`
- `setGauge(name: string, value: number, labels?: Record<string, string>): void` - Set gauge: `metricsService.setGauge('active_users', 150)`
- `createHistogram(name: string, help: string, buckets?: number[], labels?: string[]): void` - Create histogram: `metricsService.createHistogram('request_duration', 'Request duration')`
- `observeHistogram(name: string, value: number, labels?: Record<string, string>): void` - Observe histogram: `metricsService.observeHistogram('request_duration', 250)`
- `getMetrics(): {counters: [], gauges: [], histograms: []}` - Get all metrics: `metricsService.getMetrics() → metrics object`
- `reset(): void` - Reset metrics: `metricsService.reset()`

## @system/audit

### AuditService
- `log(auditData: AuditLog): Promise<void>` - Log audit: `await auditService.log({userId: '123', action: 'CREATE', resource: 'user'})`
- `query(query: AuditQuery): Promise<Result<any>>` - Query audits: `await auditService.query({userId: '123', startDate: date}) → Result<audits>`
- `getComplianceReport(startDate: Date, endDate: Date): Promise<any>` - Compliance report: `await auditService.getComplianceReport(start, end) → report`

### Decorators
- `@Auditable(action: string, resource: string)` - Auto audit: `@Auditable('CREATE', 'user')`

## @system/search

### SearchService
- `index(indexName: string, id: string, document: any): Promise<Result<void>>` - Index document: `await searchService.index('users', '123', {name: 'John'}) → Result<void>`
- `search(indexName: string, query: string, options?: SearchOptions): Promise<Result<SearchResult>>` - Search: `await searchService.search('users', 'john', {page: 1}) → Result<{hits: [], total: number}>`
- `update(indexName: string, id: string, document: any): Promise<Result<void>>` - Update document: `await searchService.update('users', '123', {name: 'Jane'}) → Result<void>`
- `delete(indexName: string, id: string): Promise<Result<void>>` - Delete document: `await searchService.delete('users', '123') → Result<void>`

## @system/rate-limiting

### RateLimiterService
- `checkLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult>` - Check rate limit: `await rateLimiterService.checkLimit('user:123', {maxRequests: 100, windowMs: 60000}) → {allowed: boolean, remaining: number}`
- `generateKey(request: any, prefix?: string): string` - Generate key: `rateLimiterService.generateKey(req, 'api') → 'api:127.0.0.1:user123'`
- `resetLimit(key: string): Promise<void>` - Reset limit: `await rateLimiterService.resetLimit('user:123')`

### Guards
- `RateLimitGuard` - Rate limit guard: `@UseGuards(RateLimitGuard)`

## @system/infrastructure

### PrismaService
- `$queryRaw<T>(query: TemplateStringsArray, ...values: any[]): Promise<T>` - Raw query: `await prisma.$queryRaw\`SELECT * FROM users\` → results`
- `$executeRaw(query: TemplateStringsArray, ...values: any[]): Promise<number>` - Execute raw: `await prisma.$executeRaw\`UPDATE users SET name = ${'John'}\` → affected rows`

### RepositoryFactory
- `createRepository<T>(modelName: string): BaseRepository<T>` - Create repository: `repositoryFactory.createRepository<User>('user') → UserRepository`
- `createQueryBuilder<T>(modelName: string): QueryBuilder<T>` - Create query builder: `repositoryFactory.createQueryBuilder<User>('user') → QueryBuilder`

### QueryBuilder
- `where(conditions: any): QueryBuilder<T>` - Add where: `queryBuilder.where({email: 'john@example.com'})`
- `orderBy(field: keyof T, direction?: 'asc'|'desc'): QueryBuilder<T>` - Add order: `queryBuilder.orderBy('createdAt', 'desc')`
- `skip(count: number): QueryBuilder<T>` - Skip records: `queryBuilder.skip(10)`
- `take(count: number): QueryBuilder<T>` - Take records: `queryBuilder.take(20)`
- `include(relations: any): QueryBuilder<T>` - Include relations: `queryBuilder.include({profile: true})`
- `findMany(): Promise<Result<T[]>>` - Find many: `await queryBuilder.findMany() → Result<T[]>`
- `findFirst(): Promise<Result<T | null>>` - Find first: `await queryBuilder.findFirst() → Result<T>`
- `count(): Promise<Result<number>>` - Count records: `await queryBuilder.count() → Result<number>`

## @system/health

### HealthService
- `registerCheck(check: HealthCheck): void` - Register check: `healthService.registerCheck({name: 'db', check: () => checkDb()})`
- `runCheck(name: string): Promise<HealthCheckResult>` - Run check: `await healthService.runCheck('db') → {status: 'healthy', message: 'OK'}`
- `runAllChecks(): Promise<Record<string, HealthCheckResult>>` - Run all checks: `await healthService.runAllChecks() → {db: {status: 'healthy'}}`

## @system/file-storage

### FileStorageService
- `store(path: string, data: Buffer | string): Promise<Result<string>>` - Store file: `await fileStorageService.store('uploads/file.jpg', buffer) → Result<string>`
- `retrieve(path: string): Promise<Result<Buffer>>` - Retrieve file: `await fileStorageService.retrieve('uploads/file.jpg') → Result<Buffer>`
- `delete(path: string): Promise<Result<void>>` - Delete file: `await fileStorageService.delete('uploads/file.jpg') → Result<void>`
- `exists(path: string): Promise<Result<boolean>>` - Check exists: `await fileStorageService.exists('uploads/file.jpg') → Result<boolean>`

## @system/notifications

### NotificationService
- `send(notification: NotificationData): Promise<Result<void>>` - Send notification: `await notificationService.send({to: 'user@example.com', subject: 'Hello', template: 'welcome'}) → Result<void>`

## @system/shared

### FileUtils
- `getExtension(filename: string): string` - Get extension: `FileUtils.getExtension('file.jpg') → 'jpg'`
- `getName(filepath: string): string` - Get filename: `FileUtils.getName('/path/file.jpg') → 'file.jpg'`
- `getBaseName(filename: string): string` - Get base name: `FileUtils.getBaseName('file.jpg') → 'file'`
- `formatSize(bytes: number): string` - Format size: `FileUtils.formatSize(1024) → '1.0 KB'`
- `isImage(filename: string): boolean` - Check image: `FileUtils.isImage('file.jpg') → true`
- `isVideo(filename: string): boolean` - Check video: `FileUtils.isVideo('file.mp4') → true`
- `isDocument(filename: string): boolean` - Check document: `FileUtils.isDocument('file.pdf') → true`
- `sanitizeFilename(filename: string): string` - Sanitize name: `FileUtils.sanitizeFilename('file name!.jpg') → 'file_name_.jpg'`
- `joinPath(...parts: string[]): string` - Join paths: `FileUtils.joinPath('uploads', 'images', 'file.jpg') → 'uploads/images/file.jpg'`
- `getMimeType(filename: string): string` - Get MIME type: `FileUtils.getMimeType('file.jpg') → 'image/jpeg'`