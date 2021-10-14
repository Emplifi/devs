import Container from "../components/container";
import PostBody from "../components/post-body";
import Header from "../components/header";
import PostHeader from "../components/post-header";
import Layout from "../components/layout";
import { getPostBySlug } from "../lib/api";
import Head from "next/head";
import markdownToHtml from "../lib/markdownToHtml";

const Techstack = ({ post, preview }) => {
  return (
    <Layout preview={preview}>
      <Container>
        <Header />
        <>
          <article className="mb-32">
            <Head>
              <title>{post.title} | Emplifi Developers</title>
              <meta property="og:image" content={post.ogImage.url} />
            </Head>
            <PostHeader
              title={post.title}
              coverImage={post.coverImage}
              date={post.date}
              author={post.author}
            />
            <PostBody content={post.content} />
          </article>
        </>
      </Container>
    </Layout>
  );
};

export default Techstack;

export async function getStaticProps({ params }) {
  const post = getPostBySlug("_techstack", [
    "title",
    "date",
    "slug",
    "author",
    "content",
    "ogImage",
    "coverImage",
  ]);
  const content = await markdownToHtml(post.content || "");

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  };
}
