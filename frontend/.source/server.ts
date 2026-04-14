// @ts-nocheck
import * as __fd_glob_9 from "../content/docs/services/vercel.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/services/supabase.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/services/railway.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/services/mongodb.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/services/github.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/security-faq.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/alert-config.mdx?collection=docs"
import { default as __fd_glob_1 } from "../content/docs/services/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, "services/meta.json": __fd_glob_1, }, {"alert-config.mdx": __fd_glob_2, "index.mdx": __fd_glob_3, "security-faq.mdx": __fd_glob_4, "services/github.mdx": __fd_glob_5, "services/mongodb.mdx": __fd_glob_6, "services/railway.mdx": __fd_glob_7, "services/supabase.mdx": __fd_glob_8, "services/vercel.mdx": __fd_glob_9, });