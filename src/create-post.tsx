import PostForm from "./form";
import { usePostType } from "./api";

export default function CreatePost({ type, onPop }: { type: string; onPop: () => void }) {
  const { data: postType, isLoading, revalidate } = usePostType(type);
  console.log("data:", postType);

  return <PostForm isLoading={isLoading} typeName={type} postType={postType} onPop={onPop} />;
}
