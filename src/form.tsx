import { Action, ActionPanel, Form, showToast, Toast, useNavigation } from "@raycast/api";
import { usePostType, createPost, updatePost } from "./api";
import { useForm, FormValidation } from "@raycast/utils";
import { getPreferenceValues } from "@raycast/api";
import fs from "fs";

export default function PostForm(props: {
  isLoading: boolean;
  typeName: string;
  postType: any;
  post?: any;
  onPop?: () => void;
}) {
  const { pop } = useNavigation();
  const site = getPreferenceValues().site;
  console.log("fields:", props.postType, props.post);
  const fields = props.postType
    ? Object.keys(props.postType.fields).map((key) => {
        return {
          name: key,
          type: props.postType.fields[key].type,
          description: props.postType.fields[key].description,
        };
      })
    : [];

  let initialValues = {};

  if (props.post) {
    initialValues = { ...props.post.meta };
  }

  const hasTitle = !!props.post?.title?.rendered || props.postType?.supports.title;
  const hasStatus = true;
  const hasContent = !!props.post?.content?.rendered || props.postType?.supports.editor;
  const hasExcerpt = !!props.post?.excerpt?.rendered || props.postType?.supports.excerpt;
  const hasFeaturedImage = !!props.post?.featured_media || props.postType?.supports["thumbnail"];

  if (hasTitle) {
    initialValues.title = props.post?.title.rendered || "";
  }

  if (hasContent) {
    initialValues.content = props.post?.content.rendered || "";
  }

  if (hasExcerpt) {
    initialValues.excerpt = props.post?.excerpt.rendered || "";
  }

  if (hasFeaturedImage) {
    initialValues.featured = null;
  }

  const { itemProps, handleSubmit, reset, focus } = useForm({
    initialValues,
    validation: {
      featured: (value) => {
        console.log("value:", value);
        if (value && value.length > 0) {
          const file = value[0];
          if (!fs.existsSync(file) || !fs.lstatSync(file).isFile()) {
            return "Please select a valid file";
          }
        }
      },
    },
    async onSubmit(values) {
      console.log("values:", values);
      if (values.featured && values.featured.length > 0) {
        const file = values.featured[0];
        if (!fs.existsSync(file) || !fs.lstatSync(file).isFile()) {
          return false;
        }
      }
      await showToast({ style: Toast.Style.Animated, title: props.post ? "Updating..." : "Creating..." });
      try {
        if (props.post) {
          await updatePost(props.postType.rest_base, props.post.id, values);
          await showToast({ style: Toast.Style.Success, title: "Updated" });

          if (props.post) {
            if (props.onPop) {
              props.onPop();
            }

            pop();
          }
        } else {
          await createPost(props.postType.rest_base, values);
          await showToast({ style: Toast.Style.Success, title: "Created" });

          if (props.onPop) {
            props.onPop();
          }

          pop();
        }
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: props.post ? "Failed updating" : "Failed creating",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    },
  });

  const renderFields = () => {
    return fields.map((field) => {
      console.log("field yay:", field);
      if (field.type === "string") {
        return <Form.TextArea title={field.name} placeholder={field.description} {...itemProps[field.name]} />;
      }
      if (field.type === "number") {
        return <Form.TextField title={field.name} placeholder={field.description} {...itemProps[field.name]} />;
      }
    });
  };

  console.log("itemProps:", itemProps);
  return (
    <Form
      navigationTitle={"Test"}
      isLoading={props.isLoading}
      searchBarAccessory={
        props.post && (
          <Form.LinkAccessory
            target={`${site}wp-admin/site-editor.php?postId=${props.post.id}&postType=${props.typeName}&canvas=edit`}
            text="Open editor"
          />
        )
      }
      actions={
        <ActionPanel>
          <Action.SubmitForm title={props.post ? "Update post" : "Create post"} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      {hasStatus && (
        <Form.Dropdown id="status" title="Status" defaultValue={props.post?.status || "draft"}>
          <Form.Dropdown.Item value="publish" title="Published" icon="🌎" />
          <Form.Dropdown.Item value="draft" title="Draft" icon="✍️" />
        </Form.Dropdown>
      )}
      {hasTitle && <Form.TextField title={"Title"} placeholder={"Title"} {...itemProps.title} />}
      {hasExcerpt && <Form.TextArea title={"Excerpt"} placeholder={"Excerpt"} {...itemProps.excerpt} />}
      {hasFeaturedImage && <Form.FilePicker title="Image" allowMultipleSelection={false} {...itemProps.featured} />}
      {renderFields()}
    </Form>
  );
}
