import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { data: session, status } = useSession();
  const [pageData, setPageData] = useState({
    url: "",
    title: "",
  });
  const [currentEmail, setCurrentEmail] = useState("");
  const [category, setCategory] = useState("");

  const handleLinkSaving = async () => {
    const response = await fetch(
      `http://savelink.vercel.app/api/${currentEmail}/cr8`,
      {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          identifier: `${currentEmail}`,
          title: `${pageData.title}`,
          url: `${pageData.url}`,
          category: `${category}`,
          bookmarked: false,
          time: Date.now(),
        }),
      }
    );

    console.log("Done?");
    return response.json();
  };

  useEffect(() => {
    chrome.tabs &&
      chrome.tabs.query(
        { active: true, currentWindow: true },
        (tabs: any[]) => {
          const url = tabs[0].url;
          const title = tabs[0].title;
          setPageData({ url, title });
        }
      );

    chrome.identity &&
      chrome.identity.getProfileUserInfo((user) => {
        const userEmail = user.email;
        setCurrentEmail(userEmail);
      });
    console.log(setPageData);
  }, []);

  return (
    <>
      <Head>
        <title>Savelink Extension</title>
        <meta
          name="description"
          content="Web extension for the savelink web app"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <h1>Savelink</h1>
          <p>
            Link will be saved under : {currentEmail} as that&apos;s the google
            account you&apos;re logged in as
          </p>

          <div className="inputs">
            <input
              type="text"
              onChange={(e) =>
                setPageData({ ...pageData, title: e.target.value })
              }
              value={pageData.title}
            />
            <input
              type="text"
              onChange={(e) =>
                setPageData({ ...pageData, url: e.target.value })
              }
              name="url"
              value={pageData.url}
            />

            {/**Enable options for getting user category straight from db with a new api route in savelink/api codebase */}
            <input
              type="text"
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Type in category"
            />
          </div>

          <div className={styles.login}>
            <button
              onClick={() => {
                handleLinkSaving();
              }}
            >
              Save
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
