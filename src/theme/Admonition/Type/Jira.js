import React from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import AdmonitionLayout from '@theme/Admonition/Layout';
import IconJira from '/img/icon/jira.svg';
const infimaClassName = 'alert alert--jira';
const defaultProps = {
  icon: <IconJira />,
  title: (
    <Translate
      id="theme.admonition.jira"
      description="The default label used for the Caution admonition (:::jira)">
      jira
    </Translate>
  ),
};
// TODO remove before v4: Caution replaced by Warning
// see https://github.com/facebook/docusaurus/issues/7558
export default function AdmonitionTypeJira(props) {
  return (
    <AdmonitionLayout
      {...defaultProps}
      {...props}
      className={clsx(infimaClassName, props.className)}>
      {props.children}
    </AdmonitionLayout>
  );
}
