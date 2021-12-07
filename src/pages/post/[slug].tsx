import { Fragment } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Prismic from "@prismicio/client";
import { RichText } from "prismic-dom";
import { AiOutlineCalendar, AiOutlineClockCircle } from "react-icons/ai";
import { FiUser } from "react-icons/fi";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Utterances } from "utterances-react-component";

import Header from "../../components/Header";

import { getPrismicClient } from "../../services/prismic";

import commonStyles from "../../styles/common.module.scss";
import styles from "./post.module.scss";

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  uid: string;
  data: {
    title: string;
    subtitle: string;
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
  preview: boolean;
  nextPost: {
    uid: string;
    title: string;
  } | null;
  prevPost: {
    uid: string;
    title: string;
  } | null;
}

export default function Post({
  post,
  preview,
  nextPost,
  prevPost,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  let allText = "";

  // eslint-disable-next-line array-callback-return
  post.data.content.map(content => {
    allText += content.heading;
    allText += RichText.asText(content.body);
  });

  const textCount = allText.split(" ").length;

  const readingTime = Math.ceil(textCount / 200);

  return (
    <>
      <Head>
        <title>Post | Space Traveling</title>
      </Head>

      <Header />

      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" />
      </div>

      <main className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.details}>
            <div>
              <AiOutlineCalendar size="1.3rem" />
              <time>
                {format(new Date(post.first_publication_date), "dd LLL yyyy", {
                  locale: ptBR,
                })}
              </time>
            </div>

            <div>
              <FiUser size="1.3rem" />
              <span>{post.data.author}</span>
            </div>

            <div>
              <AiOutlineClockCircle size="1.3rem" />
              <span>{readingTime} min</span>
            </div>
          </div>

          {post.last_publication_date && (
            <span className={styles.publicationDate}>
              * etidado em{" "}
              {format(
                new Date(post.last_publication_date),

                "dd LLL yyyy', às 'hh:mm",
                {
                  locale: ptBR,
                }
              )}
            </span>
          )}

          <div className={styles.content}>
            {post.data.content.map(content => (
              <Fragment key={content.heading}>
                <h3>{content.heading}</h3>

                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </Fragment>
            ))}
          </div>
        </article>
      </main>

      <footer className={`${commonStyles.container} ${styles.footer}`}>
        <div className={styles.nextPostsContainer}>
          {prevPost ? (
            <div>
              <h2>{prevPost.title}</h2>

              <Link href={`/post/${prevPost.uid}`}>
                <a>Post anterior</a>
              </Link>
            </div>
          ) : (
            <div />
          )}

          {nextPost ? (
            <div>
              <h2>{nextPost.title}</h2>

              <Link href={`/post/${nextPost.uid}`}>
                <a>Próximo post</a>
              </Link>
            </div>
          ) : (
            <div />
          )}
        </div>

        <Utterances
          label="Space Traveling comment"
          repo="YagoYJ/Ignite-SpaceTraveling"
          theme="github-dark"
          issueTerm="pathname"
        />

        {preview && (
          <aside className={commonStyles.exitPreviewContainer}>
            <Link href="/api/exit-preview">
              <a className={commonStyles.exitPreviewButton}>
                Sair do modo Preview
              </a>
            </Link>
          </aside>
        )}
      </footer>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at("document.type", "posts"),
  ]);

  const paths = posts.results.map(post => {
    return post.uid;
  });

  return {
    paths: [
      {
        params: { slug: paths[0] },
      },
      {
        params: { slug: paths[1] },
      },
    ],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID("posts", String(slug), {});

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: { url: response.data.banner.url },
      author: response.data.author,
      content: response.data.content.map(content => {
        return { heading: content.heading, body: content.body };
      }),
    },
  };

  const nextPostReponse = await prismic.query(
    [
      Prismic.Predicates.at("document.type", "posts"),
      Prismic.Predicates.dateAfter(
        "document.first_publication_date",
        response.first_publication_date
      ),
    ],
    {
      fetch: ["post.results.uid", "post.results.title"],
      ref: previewData?.ref ?? null,
    }
  );

  const prevPostReponse = await prismic.query(
    [
      Prismic.Predicates.at("document.type", "posts"),
      Prismic.Predicates.dateBefore(
        "document.first_publication_date",
        response.first_publication_date
      ),
    ],
    {
      fetch: ["post.results.uid", "post.results.title"],
      ref: previewData?.ref ?? null,
    }
  );

  let prevPost = null;
  let nextPost = null;

  if (prevPostReponse.results.length > 0) {
    prevPost = {
      uid: prevPostReponse.results[0]?.uid,
      title: prevPostReponse.results[0]?.data?.title,
    };
  }

  if (nextPostReponse.results.length > 0) {
    nextPost = {
      uid: nextPostReponse.results[0]?.uid,
      title: nextPostReponse.results[0]?.data?.title,
    };
  }

  return {
    props: {
      post,
      preview,
      prevPost,
      nextPost,
    },
    revalidate: 60 * 2, // 2 minutes
  };
};
