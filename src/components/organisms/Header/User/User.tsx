import { signIn, signOut, useSession } from "next-auth/client";
import React from "react";
import styles from "./styles.module.css";

export function User() {
  const [session] = useSession();
  return (
    <div className={styles.module}>
      <span>User: {session ? session.user.name : "Guest User"}</span>
      <span>
        avatar:
        {session && typeof session.user.image === "string" && (
          <img src={session.user.image} />
        )}
      </span>
      <span>
        signin or signout:
        {session ? (
          <button onClick={() => signOut()}>SIGN OUT</button>
        ) : (
          <button onClick={() => signIn()}>SIGN IN</button>
        )}
      </span>
    </div>
  );
}
