import { List, ActionPanel, Action } from "@raycast/api";
import { getAvatarIcon } from "@raycast/utils";
import UserActions from "./actions";
import { usePosts, useTypes } from "./api";
import CreatePost from "./create-post";
import UpdatePost from "./update-post";
import { getPreferenceValues } from "@raycast/api";

export default function PostType({ type }: { type: any }) {
  console.log("type:", type);
  const { data: posts, isLoading, revalidate } = usePosts(type.rest_base);

  console.log("posts:", posts);

  return (
    <List isShowingDetail isLoading={isLoading}>
      {type && (
        <List.Item
          key="create"
          title="Create new..."
          subtitle={`Create a new ${type.slug}`}
          actions={
            <ActionPanel>
              <Action.Push title="Read post" target={<CreatePost type={type.slug} onPop={revalidate} />} />
            </ActionPanel>
          }
        />
      )}
      {posts?.map((post) => {
        console.log("post:", post._embedded);
        const image =
          post._embedded && post._embedded["wp:featuredmedia"]
            ? post._embedded["wp:featuredmedia"][0]?.source_url
            : undefined;
        const title = post.title?.rendered ? post.title?.rendered : Object.values(post.meta)[0];

        let markdown = `# ${title}`;

        if (image) {
          markdown += `![image](${image})`;
        }
        return (
          <List.Item
            key={post.slug}
            title={title}
            subtitle={`#${post.id}`}
            detail={
              <List.Item.Detail
                markdown={markdown}
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title="Status" text={post.status} />
                    {post.meta &&
                      Object.entries(post.meta).map(([key, value]) => (
                        <List.Item.Detail.Metadata.Label key={key} title={key} text={value} />
                      ))}
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={
              <ActionPanel>
                <Action.Push
                  title="Read post"
                  target={<UpdatePost post={post} type={type.slug} onPop={revalidate} />}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
