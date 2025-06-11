import React from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import AdmonitionLayout from '@theme/Admonition/Layout';
import IconBug from '/img/icon/bug-solid.svg';
const infimaClassName = 'alert alert--bug';
const defaultProps = {
  icon: <IconBug />,
  title: (
    <Translate
      id="theme.admonition.bug"
      description="The default label used for the Caution admonition (:::bug)">
      bug
    </Translate>
  ),
};
// TODO remove before v4: Caution replaced by Warning
// see https://github.com/facebook/docusaurus/issues/7558
export default function AdmonitionTypeBug(props) {
  return (
    <AdmonitionLayout
      {...defaultProps}
      {...props}
      className={clsx(infimaClassName, props.className)}>
      {props.children}
    </AdmonitionLayout>
  );
}

