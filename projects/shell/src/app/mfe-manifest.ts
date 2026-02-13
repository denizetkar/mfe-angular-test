export type RemoteName = 'catalog' | 'checkout';

export interface MfeManifest {
  manifestVersion: number;
  generatedAt?: string;
  remotes: Record<RemoteName, {
    entry: string;
    version?: string;
    exposes?: {
      routes?: string;
    };
  }>;
}

