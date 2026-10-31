import "server-only";
import { db } from "./db";
import {
  contentList as list,
  saveContent as save,
  type Collection,
} from "../admin/content-store";
export type { Collection };
export const contentList = (collection: Collection) =>
  list((sql, values) => db().query(sql, values), collection);
export const saveContent = (
  collection: Collection,
  input: unknown,
  actor: string,
) => save((sql, values) => db().query(sql, values), collection, input, actor);
