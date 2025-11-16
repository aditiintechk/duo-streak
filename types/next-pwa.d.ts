declare module 'next-pwa' {
  import type { NextConfig } from 'next';
  
  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    sw?: string;
    swSrc?: string;
    publicExcludes?: string[];
    buildExcludes?: RegExp[];
    cacheOnFrontEndNav?: boolean;
    aggressiveFrontEndNavCaching?: boolean;
    reloadOnOnline?: boolean;
    swcMinify?: boolean;
    workboxOptions?: any;
    fallbacks?: {
      document?: string;
      image?: string;
      audio?: string;
      video?: string;
      font?: string;
    };
    runtimeCaching?: any[];
    scope?: string;
    base?: string;
    basePath?: string;
  }
  
  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  
  export default withPWA;
}

