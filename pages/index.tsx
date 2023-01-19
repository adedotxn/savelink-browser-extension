import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
// import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

// const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  // const { data: session, status } = useSession();
  const [pageData, setPageData] = useState({
    url: "",
    title: "",
  });
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLinkSaving = async (): Promise<void> => {
    setIsLoading(true);
    await fetch(`http://savelink.vercel.app/api/${currentEmail}/cr8`, {
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
    })
      .then((response) => {
        response.json();
        setIsLoading(false);
        setSaved(true);
      })
      .catch((err) => {
        setIsLoading(false);
        setError(err.message);
        console.log(err);
      });

    console.log("Done?");
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

  useEffect(() => {
    if (saved) {
      setTimeout(() => {
        setSaved(false);
        setPageData({ title: "", url: "" });
        setCategory("");
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
            Link will be saved under : {currentEmail} in{" "}
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

            {/** I could enable fetcging user categories from the api but that exposes a lot of things, so i'll be holding off till i strengthen the backend security */}
            <input
              type="text"
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Type in category"
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
