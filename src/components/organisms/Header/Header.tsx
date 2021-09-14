import React from "react";
import { User } from "./User";
import styles from "./styles.module.css";
function HeaderBase() {
  return (
    <div className={styles.module}>
      <User />
    </div>
  );
}

export const Header = React.memo(HeaderBase);
