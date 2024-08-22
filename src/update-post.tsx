import PostForm from "./form";
import { usePostType } from "./api";

export default function UpdatePost({ type, post, onPop }: { type: string; post: any; onPop: () => void }) {
  const { data: postType, isLoading, revalidate } = usePostType(type);
  console.log("data:", type, postType, isLoading);

  return isLoading ? null : <PostForm typeName={type} post={post} postType={postType} onPop={onPop} />;
}
