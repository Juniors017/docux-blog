import React from 'react';
import AdmonitionTypeNote from '@theme/Admonition/Type/Note';
import AdmonitionTypeTip from '@theme/Admonition/Type/Tip';
import AdmonitionTypeInfo from '@theme/Admonition/Type/Info';
import AdmonitionTypeWarning from '@theme/Admonition/Type/Warning';
import AdmonitionTypeDanger from '@theme/Admonition/Type/Danger';
import AdmonitionTypeCaution from '@theme/Admonition/Type/Caution';
import AdmonitionTypeJira from '@theme/Admonition/Type/Jira';
import AdmonitionTypeBug from '@theme/Admonition/Type/Bug';
import AdmonitionTypeDocu from '@theme/Admonition/Type/Docu';
const admonitionTypes = {
  note: AdmonitionTypeNote,
  tip: AdmonitionTypeTip,
  info: AdmonitionTypeInfo,
  warning: AdmonitionTypeWarning,
  danger: AdmonitionTypeDanger,
  jira: AdmonitionTypeJira,
  bug: AdmonitionTypeBug,
  docu: AdmonitionTypeDocu,
};
// Undocumented legacy admonition type aliases
// Provide hardcoded/untranslated retrocompatible label
// See also https://github.com/facebook/docusaurus/issues/7767
const admonitionAliases = {
  secondary: (props) => <AdmonitionTypeNote title="secondary" {...props} />,
  important: (props) => <AdmonitionTypeInfo title="important" {...props} />,
  success: (props) => <AdmonitionTypeTip title="success" {...props} />,
  caution: AdmonitionTypeCaution,
  jira: AdmonitionTypeJira,
  bug: AdmonitionTypeBug,
  docu: AdmonitionTypeDocu,
};
export default {
  ...admonitionTypes,
  ...admonitionAliases,
};
