// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"alert-config.mdx": () => import("../content/docs/alert-config.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "security-faq.mdx": () => import("../content/docs/security-faq.mdx?collection=docs"), "services/github.mdx": () => import("../content/docs/services/github.mdx?collection=docs"), "services/mongodb.mdx": () => import("../content/docs/services/mongodb.mdx?collection=docs"), "services/railway.mdx": () => import("../content/docs/services/railway.mdx?collection=docs"), "services/supabase.mdx": () => import("../content/docs/services/supabase.mdx?collection=docs"), "services/vercel.mdx": () => import("../content/docs/services/vercel.mdx?collection=docs"), }),
};
export default browserCollections;