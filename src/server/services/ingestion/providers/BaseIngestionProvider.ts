import { SourceProvider } from '@prisma/client';
import { IngestionProvider, RawContent, NormalizedContent } from '../types';

export abstract class BaseIngestionProvider implements IngestionProvider {
  constructor(public providerRecord: SourceProvider) {}

  /**
   * Fetch raw content from the source.
   */
  abstract fetch(): Promise<RawContent[]>;

  /**
   * Normalize the raw content into the standardized format.
   */
  abstract normalize(rawItems: RawContent[]): Promise<NormalizedContent[]>;

  /**
   * Validate if the provider is healthy and configured correctly.
   */
  async validate(): Promise<boolean> {
    if (!this.providerRecord.isActive || !this.providerRecord.url) {
      return false;
    }
    return true;
  }
}
