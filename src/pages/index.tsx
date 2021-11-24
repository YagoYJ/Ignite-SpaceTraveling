import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { AiOutlineCalendar } from "react-icons/ai";
import { FiUser } from "react-icons/fi";

import { getPrismicClient } from "../services/prismic";

import commonStyles from "../styles/common.module.scss";
import styles from "./home.module.scss";

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | Space Traveling</title>
      </Head>

      <main className={styles.content}>
        <div className={styles.logoContainer}>
          <img src="/images/logo.svg" alt="Space Traveling" />
        </div>

        <div className={styles.posts}>
          <Link href="/">
            <a>
              <h2>Faz teus corre</h2>
              <p>
                Apenas um texto simples Lorem ipsum dolor sit amet consectetur,
                adipisicing elit. Tempora consectetur numquam fugit possimus ut
                commodi. Excepturi fuga in eaque officia harum illo architecto,
                quae tenetur iusto quos libero nam deleniti.
              </p>

              <div className={styles.details}>
                <div>
                  <AiOutlineCalendar size="1.3rem" />
                  <time>15 Mar 2021</time>
                </div>

                <div>
                  <FiUser size="1.3rem" />
                  <span>Yaguin Gameplays</span>
                </div>
              </div>
            </a>
          </Link>
        </div>

        <button type="button" className={styles.loadMorePostsButton}>
          Carregar mais posts
        </button>
      </main>
    </>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
