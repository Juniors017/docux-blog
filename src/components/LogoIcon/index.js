import React from "react";
import { Icon } from "@iconify/react";

export default function LogoIcon({ name, size = 48 }) {
  // Supporte soit un nom déjà préfixé (ex: "logos:javascript"),
  // soit un nom simple (ex: "javascript") pour le set "logos" par défaut.
  const iconName = name?.includes(":") ? name : `logos:${name}`;
  return <Icon icon={iconName} width={size} height={size} />;
}
