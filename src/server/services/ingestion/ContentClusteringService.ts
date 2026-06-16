import { db as prisma } from '@/lib/db';
import { ContentItem } from '@prisma/client';
import { ContentDeduplicationService } from './ContentDeduplicationService';

export class ContentClusteringService {
  /**
   * Processes unclustered items and groups them together if similarity is high.
   */
  static async processClusters(batchSize = 100): Promise<void> {
    // Get unclustered items
    const unclustered = await prisma.contentItem.findMany({
      where: { clusterId: null, status: 'ENRICHED' },
      take: batchSize,
      orderBy: { createdAt: 'desc' }
    });

    if (unclustered.length === 0) return;

    // Get active clusters
    const activeClusters = await prisma.contentCluster.findMany({
      where: { isActive: true },
      include: { items: { select: { content: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 20 // Check against recent 20 active clusters
    });

    for (const item of unclustered) {
      let matchedClusterId: string | null = null;

      // Try to find a matching cluster
      for (const cluster of activeClusters) {
        if (cluster.items.length === 0) continue;
        
        // Calculate similarity with the first item in the cluster as a representative
        const repItem = cluster.items[0];
        const similarity = ContentDeduplicationService.calculateSimilarity(
          item.content.substring(0, 500), 
          repItem.content.substring(0, 500)
        );

        if (similarity > 75) { // 75% similarity threshold for clustering
          matchedClusterId = cluster.id;
          break;
        }
      }

      if (matchedClusterId) {
        // Add to existing cluster
        await prisma.contentItem.update({
          where: { id: item.id },
          data: { clusterId: matchedClusterId, status: 'CLUSTERED' }
        });

        // Optionally update cluster importance
        await prisma.contentCluster.update({
          where: { id: matchedClusterId },
          data: { importance: { increment: item.finalScore * 0.1 } } // bump importance slightly
        });
      } else {
        // Create new cluster
        const newCluster = await prisma.contentCluster.create({
          data: {
            theme: item.title,
            summary: item.summary,
            importance: item.finalScore,
            isActive: true
          }
        });

        await prisma.contentItem.update({
          where: { id: item.id },
          data: { clusterId: newCluster.id, status: 'CLUSTERED' }
        });
        
        // Add to active memory for next loop iterations
        activeClusters.unshift({ ...newCluster, items: [{ content: item.content }] } as any);
      }
    }
  }
}
