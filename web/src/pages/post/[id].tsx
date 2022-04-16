import { Box, Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { Layout } from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";

const Post = ({ }) => {
  const router = useRouter();
  const intId = typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  const [{ data, error, fetching }] = usePostQuery({
    variables: {
      id: intId
    }
  });
    if (fetching) {
    return (
      <Layout variant="regular">
        <div>loading...</div>
      </Layout>
    );
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data?.post) {
    return (
      <Layout variant="regular">
        <Box>could not find post</Box>
      </Layout>
    );
  }

  return (
    <Layout variant="regular">
      <Heading mb={4}>{data.post.title}</Heading>
      {data.post.textSnippet}
    </Layout>
  );
};

export default Post;