import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { AiOutlineCalendar, AiOutlineClockCircle } from "react-icons/ai";
import { FiUser } from "react-icons/fi";
import Header from "../../components/Header";

import { getPrismicClient } from "../../services/prismic";

import commonStyles from "../../styles/common.module.scss";
import styles from "./post.module.scss";

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post(): JSX.Element {
  return (
    <>
      <Head>
        <title>Post | Space Traveling</title>
      </Head>

      <Header />

      <div className={styles.banner}>
        <img src="/images/Lorem.jpg" alt="banner" />
      </div>

      <main className={styles.main}>
        <article>
          <h1>Título</h1>
          <div className={styles.details}>
            <div>
              <AiOutlineCalendar size="1.3rem" />
              <time>12 de mar</time>
            </div>

            <div>
              <FiUser size="1.3rem" />
              <span>Yago</span>
            </div>

            <div>
              <AiOutlineClockCircle size="1.3rem" />
              <span>Tem</span>
            </div>
          </div>

          <div className={styles.content}>
            <h2>Test</h2>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officiis
            blanditiis ipsam ipsa quasi distinctio voluptatem rerum delectus
            excepturi. Illo quis hic eum fugiat aspernatur ea recusandae autem
            quos enim architecto!
          </div>
        </article>
      </main>
    </>
  );
}

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);

//   // TODO
// };

// export const getStaticProps = async context => {
//   const prismic = getPrismicClient();
//   const response = await prismic.getByUID(TODO);

//   // TODO
// };
