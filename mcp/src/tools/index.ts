import type { McpServer } from '@modelcontextprotocol/server';
import { registerSnapshotTool, type ToolDependencies } from './define';
import { getBookReview } from './get-book-review';
import { getPost } from './get-post';
import { getProfile } from './get-profile';
import { getProjects } from './get-projects';
import { getReadingList } from './get-reading-list';
import { listPosts } from './list-posts';

/** The server's whole tool surface, in the order clients list it. */
export function registerTools(server: McpServer, dependencies: ToolDependencies): void {
  registerSnapshotTool(server, dependencies, getProfile);
  registerSnapshotTool(server, dependencies, getProjects);
  registerSnapshotTool(server, dependencies, listPosts);
  registerSnapshotTool(server, dependencies, getPost);
  registerSnapshotTool(server, dependencies, getReadingList);
  registerSnapshotTool(server, dependencies, getBookReview);
}
