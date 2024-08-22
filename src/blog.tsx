import { List, ActionPanel, Action } from "@raycast/api";
import { getAvatarIcon } from "@raycast/utils";
import UserActions from "./actions";
import { usePosts, useTypes } from "./api";
import PostType from "./type";

const coreTypes = [
  "attachment",
  "revision",
  "nav_menu_item",
  "custom_css",
  "customize_changeset",
  "oembed_cache",
  "user_request",
  "wp_block",
  "wp_template",
  "wp_dataviews",
  "wp_template_part",
  "wp_global_styles",
  "wp_navigation",
  "wp_font_family",
  "wp_font_face",
];

export default function Command() {
  const { data: types, isLoading, revalidate } = useTypes();

  console.log("types:", Object.keys(types));

  const filteredTypes = types && Object.values(types).filter((type) => !coreTypes.includes(type.slug));

  return (
    <List isLoading={isLoading}>
      {filteredTypes &&
        Object.values(filteredTypes).map((type) => (
          <List.Item
            key={type.slug}
            title={`${type.name}`}
            subtitle={type.description}
            actions={
              <ActionPanel>
                <Action.Push title="Read post" target={<PostType type={type} />} />
              </ActionPanel>
            }
          />
        ))}
    </List>
  );
}
