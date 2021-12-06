import { useState } from "react";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { AiOutlineCalendar } from "react-icons/ai";
import { FiUser } from "react-icons/fi";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import Prismic from "@prismicio/client";

import { getPrismicClient } from "../services/prismic";

import commonStyles from "../styles/common.module.scss";
import styles from "./home.module.scss";
import Header from "../components/Header";

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
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<PostPagination>(postsPagination);

  function handleFetchMorePost(nextPage: string): void {
    fetch(nextPage)
      .then(response => response.json())
      .then((data: PostPagination) => {
        const newPosts: Post[] = posts.results;
        data.results.map(post =>
          newPosts.push({
            uid: post.uid,
            first_publication_date: format(
              new Date(post.first_publication_date),
              "dd LLL yyyy",
              {
                locale: ptBR,
              }
            ),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          })
        );

        setPosts({
          next_page: data.next_page,
          results: newPosts,
        });
      });
  }

  return (
    <>
      <Head>
        <title>Home | Space Traveling</title>
      </Head>

      <Header />
      <div className={commonStyles.container}>
        <main className={styles.content}>
          <div className={styles.posts}>
            {posts.results.map(post => (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a>
                  <h2>{post.data.title}</h2>
                  <p>{post.data.subtitle}</p>

                  <div className={styles.details}>
                    <div>
                      <AiOutlineCalendar size="1.3rem" />
                      <time>
                        {format(
                          new Date(post.first_publication_date),
                          "dd LLL yyyy",
                          {
                            locale: ptBR,
                          }
                        )}
                      </time>
                    </div>

                    <div>
                      <FiUser size="1.3rem" />
                      <span>{post.data.author}</span>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>

          {posts.next_page && (
            <button
              type="button"
              className={styles.loadMorePostsButton}
              onClick={() => handleFetchMorePost(posts.next_page)}
            >
              Carregar mais posts
            </button>
          )}

          {preview && (
            <aside className={commonStyles.exitPreviewContainer}>
              <Link href="/api/exit-preview">
                <a className={commonStyles.exitPreviewButton}>
                  Sair do modo Preview
                </a>
              </Link>
            </aside>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at("document.type", "posts")],
    {
      fetch: ["posts.title", "posts.subtitle", "posts.author"],
      pageSize: 1,
      ref: previewData?.ref ?? null,
    }
  );

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    }),
  };

  return {
    props: {
      postsPagination,
      preview,
    },
  };
};
