import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";

export default function Home() {
  const [pageData, setPageData] = useState({
    url: "",
    title: "",
  });

  const [identifier, setIdentifier] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [categories, setCategories] = useState<string[] | null>(null);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (inputValue.includes(",")) {
      const array = inputValue.split(",").map((item) => item.trim());
      setCategories(array);
    }
  }, [inputValue]);

  const handleLinkSaving = async (): Promise<void> => {
    setIsLoading(true);
    await fetch(`http://savelink.vercel.app/api/${identifier}/save`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        identifier: `${identifier}`,
        title: `${pageData.title}`,
        url: `${pageData.url}`,
        categories: categories ?? ["saved"],
        bookmarked: false,
        time: Date.now(),
      }),
    })
      .then((response) => {
        response.json();
        setIsLoading(false);
        setSaved(true);
      })
      .catch((err) => {
        setIsLoading(false);
        setError(err.message);
        console.error(err);
      });

    // console.log("Done.");
  };

  /** uses the chrome api to get current webpage details
   * and current account signed in to chrome.
   */

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
        setIdentifier(userEmail);
      });
  }, []);

  useEffect(() => {
    if (saved) {
      setTimeout(() => {
        setSaved(false);
        setPageData({ title: "", url: "" });
        setInputValue("");
        setCategories([]);
      }, 2000);
    }
  }, [saved]);

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
            Link will be saved under : {identifier} in{" "}
            <a href="http://savelink.vercel.app">Savelink</a>
          </p>

          <div className={styles.inputs}>
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

            <input
              type="text"
              onChange={(e) => setInputValue(e.target.value)}
              value={inputValue}
              placeholder="Type in categories you want to save this link in"
            />
          </div>

          <div className={styles.save}>
            {saved ? (
              <button>Saved ✅</button>
            ) : isLoading ? (
              <button>
                Saving <span className={styles.loader}></span>
              </button>
            ) : (
              <button
                onClick={() => {
                  handleLinkSaving();
                }}
              >
                Save
              </button>
            )}
          </div>

          {error !== "" && <p>{error}</p>}
        </div>
      </main>
    </>
  );
}
