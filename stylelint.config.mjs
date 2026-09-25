/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  rules: {
    // Prettier owns whitespace and blank-line formatting.
    'at-rule-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'rule-empty-line-before': null,
    // Components use BEM: block, block__element, block--modifier.
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      { message: 'Expected class selector "%s" to be kebab-case BEM' },
    ],
    // Flags unrelated selectors that never target the same element.
    'no-descending-specificity': null,
  },
  overrides: [
    {
      files: ['**/*.astro'],
      customSyntax: 'postcss-html',
      rules: {
        'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],
      },
    },
  ],
};
