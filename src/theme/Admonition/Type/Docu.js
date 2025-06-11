import React from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import AdmonitionLayout from '@theme/Admonition/Layout';
import IconDocu from '/img/icon/logo.svg';
const infimaClassName = 'alert alert--docu';
const defaultProps = {
  icon: <IconDocu />,
  title: (
    <Translate
      id="theme.admonition.docu"
      description="The default label used for the Caution admonition (:::docu)">
      docu
    </Translate>
  ),
};
// TODO remove before v4: Caution replaced by Warning
// see https://github.com/facebook/docusaurus/issues/7558
export default function AdmonitionTypeDocu(props) {
  return (
    <AdmonitionLayout
      {...defaultProps}
      {...props}
      className={clsx(infimaClassName, props.className)}>
      {props.children}
    </AdmonitionLayout>
  );
}
