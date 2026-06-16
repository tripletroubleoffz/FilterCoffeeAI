import { db as prisma } from '@/lib/db';
import { SourceRegistry } from './SourceRegistry';
import { ContentDeduplicationService } from './ContentDeduplicationService';

export class ContentIngestionService {
  /**
   * Run the ingestion pipeline for a specific source provider.
   */
  static async ingestSource(providerId: string): Promise<{ fetched: number, added: number, duplicates: number, error?: string }> {
    const providerRecord = await prisma.sourceProvider.findUnique({ where: { id: providerId } });
    if (!providerRecord || !providerRecord.isActive) {
      return { fetched: 0, added: 0, duplicates: 0, error: 'Provider not found or inactive' };
    }

    const providerImpl = SourceRegistry.getProvider(providerRecord);
    if (!providerImpl) {
      return { fetched: 0, added: 0, duplicates: 0, error: `No implementation for source type ${providerRecord.type}` };
    }

    // 1. Validate
    const isValid = await providerImpl.validate();
    if (!isValid) {
      return { fetched: 0, added: 0, duplicates: 0, error: 'Provider validation failed' };
    }

    let fetchedCount = 0;
    let addedCount = 0;
    let duplicateCount = 0;

    try {
      // 2. Fetch
      const rawContent = await providerImpl.fetch();
      fetchedCount = rawContent.length;

      if (fetchedCount === 0) {
        return { fetched: 0, added: 0, duplicates: 0 };
      }

      // 3. Normalize
      const normalizedContent = await providerImpl.normalize(rawContent);

      // 4. Deduplicate & Save
      for (const item of normalizedContent) {
        const hash = ContentDeduplicationService.generateHash(item);
        const duplicateId = await ContentDeduplicationService.isDuplicate(item, hash);

        if (duplicateId) {
          // Merge duplicates
          await ContentDeduplicationService.mergeDuplicates(duplicateId, item);
          duplicateCount++;
        } else {
          // Save new item
          await prisma.contentItem.create({
            data: {
              title: item.title,
              summary: item.summary,
              content: item.content,
              source: item.source,
              sourceType: item.sourceType,
              url: item.url,
              author: item.author,
              publishedAt: item.publishedAt,
              imageUrl: item.imageUrl,
              language: item.language,
              category: item.category,
              industry: item.industry,
              tags: item.tags || [],
              hash,
              sourceProviderId: providerRecord.id,
              status: 'PENDING',
              finalScore: 0.0,
            }
          });
          addedCount++;
        }
      }

      // Update provider last fetched
      await prisma.sourceProvider.update({
        where: { id: providerRecord.id },
        data: {
          lastFetched: new Date(),
          healthStatus: 'HEALTHY',
          lastError: null,
        }
      });

      return { fetched: fetchedCount, added: addedCount, duplicates: duplicateCount };

    } catch (error: any) {
      console.error(`Ingestion error for ${providerRecord.name}:`, error);
      
      // Update provider health
      await prisma.sourceProvider.update({
        where: { id: providerRecord.id },
        data: {
          healthStatus: 'ERROR',
          lastError: error.message || 'Unknown error',
        }
      });

      return { fetched: fetchedCount, added: addedCount, duplicates: duplicateCount, error: error.message };
    }
  }
}
