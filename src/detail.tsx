import { Detail, useNavigation } from "@raycast/api";
import UserActions from "./actions";
import { User, useUser } from "./api";

export default function UserDetail(props: { user: User }) {
  const { pop } = useNavigation();
  const { data, isLoading, revalidate } = useUser(props.user);

  return (
    <Detail
      isLoading={isLoading}
      markdown={`# ${data.title.rendered}`}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="ID" text={data._id} />
          <Detail.Metadata.Label title="Date" text={new Date(data.date).toLocaleString()} />
        </Detail.Metadata>
      }
      actions={<UserActions user={data} onDeleteUser={pop} onUpdateUser={revalidate} />}
    />
  );
}
