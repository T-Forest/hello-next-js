import React from "react";
import { Header } from "../Header";
import styles from "./styles.module.css";

export function Layout(props: { children?: React.ReactNode }) {
  return (
    <div className={styles.module}>
      <header>
        <Header />
      </header>
      <main>{props.children}</main>
    </div>
  );
}
