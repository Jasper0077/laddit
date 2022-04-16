import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';
import React, { useState } from 'react'

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<"updoot-loading" | "downdoot-loading" | "not-loading">("not-loading");
  const [,vote] = useVoteMutation();
  return (
    <Flex
      direction="column"
      justifyContent="center"
      alignItems="center"
      mr={4}
    >
      <IconButton
        onClick={
          async () => {
            setLoadingState("updoot-loading");
            await vote({
              postId: post.id,
              value: 1
            })
            setLoadingState("not-loading");
          }
        }
        icon={<ChevronUpIcon />}
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
        boxSize={8}
        isLoading={loadingState === "updoot-loading"}
        aria-label="updoot post"
      />
      {post.points}
      <IconButton
        onClick={
          async () => {
            setLoadingState("downdoot-loading");
            await vote({
              postId: post.id,
              value: -1
            })
            setLoadingState("not-loading");
          }
        }
        icon={<ChevronDownIcon />}
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
        isLoading={loadingState === "downdoot-loading"}
        boxSize={8}
        aria-label="downvote post"
      />
    </Flex>
  );
}