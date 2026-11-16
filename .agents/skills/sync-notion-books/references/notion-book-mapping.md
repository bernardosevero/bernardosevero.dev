# Normalized Notion book mapping

Map semantic fields, not assumed display names:

| Normalized field | Required | Expected source |
| --- | --- | --- |
| `notionId` | yes | Stable Notion page ID |
| `notionLastEditedAt` | yes | Notion page last-edited timestamp |
| `title` | yes | Database title property |
| `author` | yes | Text, select, relation, or rollup resolved to a readable name |
| `status` | yes | Status/select normalized to `reading`, `finished`, or `wishlist` |
| `rating` | no | Numeric value from 0 through 5 |
| `finishedAt` | no | ISO date |
| `isbn` | no | ISBN-10 or ISBN-13 in the Notion `ISBN` text property; used to verify the edition and cover |
| `coverUrl` | no | Public, stable cover URL |
| `review` | no | Full Markdown from the review property or explicitly designated page-body section; imported to `<book-id>.md`, not the JSON catalog |

The importer creates a stable local `id` for new records and preserves the existing `id` for records already matched by `notionId`.

The catalog has no `preview` field. Draft entries are excluded in every environment; do not add a draft-preview workflow.

Do not infer a rating from prose, invent a review, or use an expiring private cover URL. If two properties could represent the same field, report the ambiguity before writing.
