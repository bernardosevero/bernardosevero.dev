// The About schema accepts only these names. Profile links render PixelIcon artwork,
// so each label must have an icon here.
export const toolNames = ['VS Code', 'GitHub', 'Docker', 'AWS'] as const;

export const profileLinkLabels = ['LinkedIn', 'GitHub'] as const;
export type ProfileLinkLabel = (typeof profileLinkLabels)[number];

export const profileLinkIcons = {
  LinkedIn: 'linkedin',
  GitHub: 'github',
} as const satisfies Record<ProfileLinkLabel, string>;
