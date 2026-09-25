// The About schema accepts only these names, so every tool and profile link that
// reaches the Character Sheet has PixelIcon artwork.
export const toolNames = ['VS Code', 'GitHub', 'Docker', 'AWS'] as const;
export type ToolName = (typeof toolNames)[number];

export const toolIcons = {
  'VS Code': 'vscode',
  GitHub: 'github',
  Docker: 'docker',
  AWS: 'cloud',
} as const satisfies Record<ToolName, string>;

export const profileLinkLabels = ['LinkedIn', 'GitHub'] as const;
export type ProfileLinkLabel = (typeof profileLinkLabels)[number];

export const profileLinkIcons = {
  LinkedIn: 'linkedin',
  GitHub: 'github',
} as const satisfies Record<ProfileLinkLabel, string>;
